'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {
  DashboardHeader,
  DashboardFooter,
  CompanyNav,
  InsightsSection,
  UploadModal,
} from '@/components';
import {
  formatCurrency,
  formatNumber,
  companies,
  sampleData,
  DashboardData,
  Insights,
  CompanyData,
} from '@/lib/utils';

// Ícone de crescimento
const GrowthIcon = () => (
  <svg className="w-4 h-4 text-franca-primary-dark inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// Componente de Card Customizado
interface CustomMetricCardProps {
  title: string;
  value: number;
  costPerResult?: number;
  color: 'primary' | 'secondary' | 'accent';
  showCost?: boolean;
  excellentMessage?: string;
  superExcellentMessage?: string;
  isExcellent?: boolean;
  isSuperExcellent?: boolean;
  formatAsNumber?: boolean;
  prefix?: string;
  showGrowthIcon?: boolean;
  subtitle?: string;
}

function CustomMetricCard({
  title,
  value,
  costPerResult = 0,
  color,
  showCost = true,
  excellentMessage,
  superExcellentMessage,
  isExcellent = false,
  isSuperExcellent = false,
  formatAsNumber = false,
  prefix = '',
  showGrowthIcon = false,
  subtitle,
}: CustomMetricCardProps) {
  const colorClasses = {
    primary: 'bg-franca-primary',
    secondary: 'bg-franca-secondary',
    accent: 'bg-franca-accent',
  };

  // Mensagem padrão baseada no tipo de métrica
  const getDefaultSubtitle = () => {
    if (subtitle) return subtitle;
    if (title.toLowerCase().includes('seguidores')) return 'Novos seguidores conquistados no período';
    if (title.toLowerCase().includes('visualizações')) return 'Total de visualizações alcançadas';
    if (title.toLowerCase().includes('visitas')) return 'Visitas ao perfil do Instagram';
    if (title.toLowerCase().includes('compras')) return 'Conversões realizadas no site';
    if (title.toLowerCase().includes('leads')) return 'Leads captados no período';
    if (title.toLowerCase().includes('conversas')) return 'Conversas iniciadas via mensagem';
    return 'Resultado do período';
  };

  return (
    <div className="bg-white border border-franca-light-blue rounded-2xl p-7 relative overflow-hidden card-hover">
      <div className={`absolute top-0 left-0 right-0 h-1 ${colorClasses[color]}`} />

      <p className="text-xs font-semibold text-franca-accent uppercase tracking-wider mb-1">
        {title}
        {showGrowthIcon && value > 0 && <GrowthIcon />}
      </p>
      
      <p className="text-[10px] text-franca-accent/70 mb-4">
        {getDefaultSubtitle()}
      </p>

      <p className="text-5xl font-bold text-franca-secondary mb-2 leading-none">
        {prefix}{formatAsNumber ? formatNumber(value) : value}
      </p>

      {showCost && costPerResult > 0 && (
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-franca-accent">Custo por resultado:</span>
          <span className={`text-base font-semibold ${isExcellent || isSuperExcellent ? 'text-franca-primary-dark' : 'text-franca-secondary'}`}>
            {formatCurrency(costPerResult)}
          </span>
        </div>
      )}

      {isSuperExcellent && superExcellentMessage && (
        <div className="mt-4 p-3 bg-gradient-to-r from-franca-primary to-franca-primary-dark rounded-lg border-l-4 border-franca-secondary">
          <p className="text-xs font-bold text-franca-secondary">
            🎉 INCRÍVEL! {superExcellentMessage}
          </p>
        </div>
      )}

      {isExcellent && !isSuperExcellent && excellentMessage && (
        <div className="mt-4 p-3 bg-franca-light-green rounded-lg border-l-4 border-franca-primary">
          <p className="text-xs font-medium text-franca-primary-dark">
            {excellentMessage}
          </p>
        </div>
      )}
    </div>
  );
}

// Card de Visualizações (Principal em todos)
interface ViewsCardProps {
  value: number;
  showGrowthIcon?: boolean;
}

function ViewsCard({ value, showGrowthIcon = false }: ViewsCardProps) {
  return (
    <div className="bg-franca-secondary rounded-2xl p-7 card-hover">
      <p className="text-xs font-semibold text-franca-light-blue uppercase tracking-wider mb-1">
        Visualizações
        {showGrowthIcon && value > 0 && (
          <svg className="w-4 h-4 text-franca-primary inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )}
      </p>
      <p className="text-[10px] text-franca-light-blue/70 mb-4">
        Alcance total das suas campanhas
      </p>
      <p className="text-4xl font-bold text-white">
        {formatNumber(value)}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading, isAdmin, isAuthorized, signOut } = useAuth();
  const router = useRouter();
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<DashboardData>(sampleData);
  const [activeCompany, setActiveCompany] = useState('houston');
  const [insights, setInsights] = useState<{ [key: string]: Insights }>({});
  const [editMode, setEditMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedData, setUploadedData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAuthorized) {
        router.push('/login');
      }
    }
  }, [user, loading, isAuthorized, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const dataDoc = await getDoc(doc(db, 'dashboard', 'data'));
        if (dataDoc.exists()) {
          setData(dataDoc.data() as DashboardData);
        }
        const insightsDoc = await getDoc(doc(db, 'dashboard', 'insights'));
        if (insightsDoc.exists()) {
          setInsights(insightsDoc.data() as { [key: string]: Insights });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user && isAuthorized) {
      loadData();
    }
  }, [user, isAuthorized]);

  const saveData = async (newData: DashboardData) => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'dashboard', 'data'), newData);
      setData(newData);
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveInsights = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'dashboard', 'insights'), insights);
    } catch (error) {
      console.error('Error saving insights:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string') {
      if (dateValue.includes('-')) {
        const [year, month, day] = dateValue.split('-');
        return `${day}/${month}/${year}`;
      }
      return dateValue;
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString('pt-BR');
    }
    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toLocaleDateString('pt-BR');
    }
    return String(dateValue);
  };

  // Parse XLSX - CUSTOMIZADO POR CLIENTE
  const parseXLSX = (file: File): Promise<CompanyData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileData = e.target?.result;
          const workbook = XLSX.read(fileData, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let purchases = { results: 0, totalCost: 0 };
          let leads = { results: 0, totalCost: 0 };
          let profileVisits = { results: 0, totalCost: 0 };
          let totalInvestment = 0;
          let followers = 0;
          let impressions = 0;
          let periodStart = '';
          let periodEnd = '';

          jsonData.forEach((row: any) => {
            const resultType = (row['Tipo de resultado'] || '').toString().toLowerCase();
            const results = Number(row['Resultados']) || 0;
            const investment = Number(row['Valor usado (BRL)']) || 0;

            totalInvestment += investment;

            if (row['Seguidores no Instagram'] !== undefined) {
              followers += Number(row['Seguidores no Instagram']) || 0;
            }

            if (row['Impressões'] !== undefined) {
              impressions += Number(row['Impressões']) || 0;
            }

            if (!periodStart && row['Início dos relatórios']) {
              periodStart = formatDate(row['Início dos relatórios']);
            }

            if (!periodEnd && row['Término dos relatórios']) {
              periodEnd = formatDate(row['Término dos relatórios']);
            }

            // HOUSTON ACADEMY
            if (activeCompany === 'houston') {
              if (resultType.includes('compras no site') || resultType.includes('compras')) {
                purchases.results += results;
                purchases.totalCost += investment;
              } else if (resultType.includes('leads no site') || resultType.includes('leads')) {
                leads.results += results;
                leads.totalCost += investment;
              } else if (resultType.includes('visitas ao perfil')) {
                profileVisits.results += results;
                profileVisits.totalCost += investment;
              }
            }
            
            // MIGUEL - ThruPlay e Visitas ao Perfil
            else if (activeCompany === 'miguel') {
              if (resultType.includes('visitas ao perfil')) {
                profileVisits.results += results;
                profileVisits.totalCost += investment;
              }
              // ThruPlay não precisa mapear, impressões já vem pelo campo Impressões
            }
            
            // TREVO BARBEARIA - Conversas e Cliques no Link
            else if (activeCompany === 'trevo-barbearia') {
              if (resultType.includes('conversas por mensagem') || resultType.includes('conversas')) {
                purchases.results += results;
                purchases.totalCost += investment;
              }
              // "Cliques no link" = Visitas ao Perfil
              else if (resultType.includes('cliques no link') || resultType.includes('clique no link')) {
                profileVisits.results += results;
                profileVisits.totalCost += investment;
              }
            }
            
            // TREVO TABACARIA - Só Conversas
            else if (activeCompany === 'trevo-tabacaria') {
              if (resultType.includes('conversas por mensagem') || resultType.includes('conversas')) {
                purchases.results += results;
                purchases.totalCost += investment;
              }
            }
          });

          const purchasesMetric = {
            results: purchases.results,
            costPerResult: purchases.results > 0 ? purchases.totalCost / purchases.results : 0
          };
          
          const leadsMetric = {
            results: leads.results,
            costPerResult: leads.results > 0 ? leads.totalCost / leads.results : 0
          };
          
          const profileVisitsMetric = {
            results: profileVisits.results,
            costPerResult: profileVisits.results > 0 ? profileVisits.totalCost / profileVisits.results : 0
          };

          const companyName = companies.find(c => c.id === activeCompany)?.name || 'Empresa';

          console.log('Parsed data for', activeCompany, ':', {
            purchases: purchasesMetric,
            leads: leadsMetric,
            profileVisits: profileVisitsMetric,
            investment: totalInvestment,
            followers,
            impressions,
            period: { start: periodStart, end: periodEnd }
          });

          resolve({
            name: companyName,
            period: { start: periodStart, end: periodEnd },
            metrics: { 
              purchases: purchasesMetric, 
              leads: leadsMetric, 
              profileVisits: profileVisitsMetric 
            },
            investment: totalInvestment,
            followers,
            impressions,
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsed = await parseXLSX(file);
        setUploadedData(parsed);
        setShowUploadModal(true);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Erro ao processar arquivo. Verifique o formato da planilha.');
      }
    }
    e.target.value = '';
  };

  const confirmUpload = () => {
    if (uploadedData) {
      const newData = { ...data, [activeCompany]: uploadedData };
      saveData(newData);
      setShowUploadModal(false);
      setUploadedData(null);
    }
  };

  // Export PDF
  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      const primaryGreen = [125, 224, 141];
      const darkBlue = [8, 21, 52];
      const accentGreen = [89, 143, 116];
      const lightGreen = [242, 252, 244];

      let yPosition = margin;

      // HEADER
      pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.rect(0, 0, pageWidth, 45, 'F');
      pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      pdf.rect(margin, 15, 40, 4, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório de Performance', margin, 32);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Franca Assessoria • Dashboard de Campanhas', margin, 40);

      yPosition = 60;

      // INFO DA EMPRESA
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(currentData.name, margin, yPosition);
      yPosition += 8;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
      pdf.text(`Período: ${currentData.period.start} - ${currentData.period.end}`, margin, yPosition);
      yPosition += 15;

      // CARD DE INVESTIMENTO TOTAL
      pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      pdf.roundedRect(margin, yPosition, contentWidth, 35, 4, 4, 'F');
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVESTIMENTO TOTAL', margin + 10, yPosition + 12);
      pdf.setFontSize(28);
      pdf.text(formatCurrency(currentData.investment), margin + 10, yPosition + 28);
      yPosition += 45;

      // CARD DE VISUALIZAÇÕES (sempre presente)
      pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.roundedRect(margin, yPosition, contentWidth, 30, 4, 4, 'F');
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VISUALIZAÇÕES', margin + 10, yPosition + 11);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Alcance total das suas campanhas', margin + 10, yPosition + 17);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatNumber(currentData.impressions), margin + 10, yPosition + 26);
      yPosition += 40;

      // MÉTRICAS - CUSTOMIZADO POR CLIENTE
      const cardWidth = (contentWidth - 10) / 3;
      const cardHeight = 55;

      if (activeCompany === 'houston') {
        // Houston: Compras, Leads, Visitas + Seguidores
        // Card 1
        pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
        pdf.roundedRect(margin, yPosition, cardWidth, cardHeight, 3, 3, 'F');
        pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
        pdf.rect(margin, yPosition, cardWidth, 3, 'F');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('COMPRAS NO SITE', margin + 5, yPosition + 12);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Conversões realizadas no site', margin + 5, yPosition + 17);
        pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(currentData.metrics.purchases.results), margin + 5, yPosition + 32);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.text(`Custo: ${formatCurrency(currentData.metrics.purchases.costPerResult)}`, margin + 5, yPosition + 42);

        // Card 2
        const card2X = margin + cardWidth + 5;
        pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
        pdf.roundedRect(card2X, yPosition, cardWidth, cardHeight, 3, 3, 'F');
        pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        pdf.rect(card2X, yPosition, cardWidth, 3, 'F');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LEADS GERADOS', card2X + 5, yPosition + 12);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Leads captados no período', card2X + 5, yPosition + 17);
        pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(currentData.metrics.leads.results), card2X + 5, yPosition + 32);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.text(`Custo: ${formatCurrency(currentData.metrics.leads.costPerResult)}`, card2X + 5, yPosition + 42);

        // Card 3
        const card3X = margin + (cardWidth * 2) + 10;
        pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
        pdf.roundedRect(card3X, yPosition, cardWidth, cardHeight, 3, 3, 'F');
        pdf.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.rect(card3X, yPosition, cardWidth, 3, 'F');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('VISITAS AO PERFIL', card3X + 5, yPosition + 12);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Visitas ao perfil do Instagram', card3X + 5, yPosition + 17);
        pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatNumber(currentData.metrics.profileVisits.results), card3X + 5, yPosition + 32);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.text(`Custo: ${formatCurrency(currentData.metrics.profileVisits.costPerResult)}`, card3X + 5, yPosition + 42);

        yPosition += cardHeight + 10;

        // Card Seguidores
        pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
        pdf.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('NOVOS SEGUIDORES', margin + 10, yPosition + 11);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Novos seguidores conquistados no período', margin + 10, yPosition + 16);
        pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`+${formatNumber(currentData.followers)}`, margin + 10, yPosition + 26);

        yPosition += 40;

      } else if (activeCompany === 'miguel') {
        // Miguel: Seguidores, Visitas
        // Card 1 - Seguidores
        pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
        pdf.roundedRect(margin, yPosition, (contentWidth - 5) / 2, cardHeight, 3, 3, 'F');
        pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
        pdf.rect(margin, yPosition, (contentWidth - 5) / 2, 3, 'F');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('NOVOS SEGUIDORES', margin + 5, yPosition + 12);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Novos seguidores conquistados', margin + 5, yPosition + 17);
        pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`+${formatNumber(currentData.followers)}`, margin + 5, yPosition + 35);

        // Card 2 - Visitas
        const card2X = margin + (contentWidth - 5) / 2 + 5;
        pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
        pdf.roundedRect(card2X, yPosition, (contentWidth - 5) / 2, cardHeight, 3, 3, 'F');
        pdf.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.rect(card2X, yPosition, (contentWidth - 5) / 2, 3, 'F');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('VISITAS AO PERFIL', card2X + 5, yPosition + 12);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Visitas ao perfil do Instagram', card2X + 5, yPosition + 17);
        pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatNumber(currentData.metrics.profileVisits.results), card2X + 5, yPosition + 35);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.text(`Custo: ${formatCurrency(currentData.metrics.profileVisits.costPerResult)}`, card2X + 5, yPosition + 45);

        yPosition += cardHeight + 10;

      } else {
        // Trevo Barbearia e Tabacaria: Conversas, Seguidores, Visitas
        // Card 1 - Conversas
        pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
        pdf.roundedRect(margin, yPosition, cardWidth, cardHeight, 3, 3, 'F');
        pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
        pdf.rect(margin, yPosition, cardWidth, 3, 'F');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CONVERSAS INICIADAS', margin + 5, yPosition + 12);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Conversas via mensagem', margin + 5, yPosition + 17);
        pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(currentData.metrics.purchases.results), margin + 5, yPosition + 32);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.text(`Custo: ${formatCurrency(currentData.metrics.purchases.costPerResult)}`, margin + 5, yPosition + 42);

        // Card 2 - Seguidores
        const card2X = margin + cardWidth + 5;
        pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
        pdf.roundedRect(card2X, yPosition, cardWidth, cardHeight, 3, 3, 'F');
        pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        pdf.rect(card2X, yPosition, cardWidth, 3, 'F');
        pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('NOVOS SEGUIDORES', card2X + 5, yPosition + 12);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Novos seguidores conquistados', card2X + 5, yPosition + 17);
        pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`+${formatNumber(currentData.followers)}`, card2X + 5, yPosition + 35);

        // Card 3 - Visitas (só para Barbearia)
        if (activeCompany === 'trevo-barbearia') {
          const card3X = margin + (cardWidth * 2) + 10;
          pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
          pdf.roundedRect(card3X, yPosition, cardWidth, cardHeight, 3, 3, 'F');
          pdf.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
          pdf.rect(card3X, yPosition, cardWidth, 3, 'F');
          pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text('VISITAS AO PERFIL', card3X + 5, yPosition + 12);
          pdf.setFontSize(5);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Visitas ao perfil do Instagram', card3X + 5, yPosition + 17);
          pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
          pdf.setFontSize(24);
          pdf.setFont('helvetica', 'bold');
          pdf.text(formatNumber(currentData.metrics.profileVisits.results), card3X + 5, yPosition + 32);
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
          pdf.text(`Custo: ${formatCurrency(currentData.metrics.profileVisits.costPerResult)}`, card3X + 5, yPosition + 42);
        }

        yPosition += cardHeight + 10;
      }

      // INSIGHTS
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Análise e Próximos Passos', margin, yPosition);
      yPosition += 10;

      const insightCardWidth = (contentWidth - 10) / 3;
      const insightCardHeight = 45;

      // Progresso
      pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
      pdf.roundedRect(margin, yPosition, insightCardWidth, insightCardHeight, 3, 3, 'F');
      pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      pdf.rect(margin, yPosition, 3, insightCardHeight, 'F');
      pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PONTOS DE PROGRESSO', margin + 6, yPosition + 8);
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const progressText = currentInsights.progress || 'Nenhum ponto adicionado.';
      const progressLines = pdf.splitTextToSize(progressText, insightCardWidth - 10);
      pdf.text(progressLines.slice(0, 4), margin + 6, yPosition + 16);

      // Positivos
      const insight2X = margin + insightCardWidth + 5;
      pdf.setFillColor(230, 232, 235);
      pdf.roundedRect(insight2X, yPosition, insightCardWidth, insightCardHeight, 3, 3, 'F');
      pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.rect(insight2X, yPosition, 3, insightCardHeight, 'F');
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PONTOS POSITIVOS', insight2X + 6, yPosition + 8);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const positivesText = currentInsights.positives || 'Nenhum ponto adicionado.';
      const positivesLines = pdf.splitTextToSize(positivesText, insightCardWidth - 10);
      pdf.text(positivesLines.slice(0, 4), insight2X + 6, yPosition + 16);

      // Focos
      const insight3X = margin + (insightCardWidth * 2) + 10;
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(230, 232, 235);
      pdf.roundedRect(insight3X, yPosition, insightCardWidth, insightCardHeight, 3, 3, 'FD');
      pdf.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
      pdf.rect(insight3X, yPosition, 3, insightCardHeight, 'F');
      pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FOCOS DO PRÓXIMO MÊS', insight3X + 6, yPosition + 8);
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const focusText = currentInsights.nextFocus || 'Nenhum foco adicionado.';
      const focusLines = pdf.splitTextToSize(focusText, insightCardWidth - 10);
      pdf.text(focusLines.slice(0, 4), insight3X + 6, yPosition + 16);

      // FOOTER
      pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Franca Assessoria', margin, pageHeight - 10);
      pdf.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      pdf.text('Vendendo mais para você', pageWidth - margin - 45, pageHeight - 10);
      pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      pdf.rect(0, pageHeight - 22, pageWidth, 2, 'F');

      const fileName = `franca-relatorio-${currentData.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentData = data[activeCompany] || sampleData.houston;
  const currentInsights = insights[activeCompany] || { progress: '', positives: '', nextFocus: '' };

  const handleInsightsChange = (newInsights: Insights) => {
    setInsights({ ...insights, [activeCompany]: newInsights });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg viewBox="0 0 120 80" className="w-full h-full">
              <polygon points="10,70 50,10 90,10 50,70" fill="#7DE08D" />
              <polygon points="70,10 110,10 90,40" fill="#598F74" />
              <path d="M35,35 L35,55 L45,55 L45,47 L55,47 L55,40 L45,40 L45,35 Z" fill="#081534" />
              <circle cx="62" cy="58" r="5" fill="#081534" />
            </svg>
          </div>
          <div className="w-8 h-8 border-2 border-franca-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-franca-accent text-sm">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return null;
  }

  // RENDER CUSTOMIZADO POR CLIENTE
  const renderDashboardContent = () => {
    // HOUSTON ACADEMY
    if (activeCompany === 'houston') {
      return (
        <>
          {/* Card Investimento Grande */}
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-franca-primary to-franca-primary-dark rounded-2xl p-8 md:p-10 shadow-lg">
              <p className="text-franca-secondary text-sm font-semibold uppercase tracking-wider mb-1">
                Investimento Total
              </p>
              <p className="text-franca-secondary/70 text-xs mb-2">
                Valor investido no período
              </p>
              <p className="text-franca-secondary text-4xl md:text-5xl font-bold">
                {formatCurrency(currentData.investment)}
              </p>
            </div>
          </div>

          {/* Card Visualizações */}
          <div className="mb-6 animate-fade-in">
            <ViewsCard value={currentData.impressions} showGrowthIcon={currentData.impressions > 0} />
          </div>

          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 stagger-children">
            <CustomMetricCard
              title="Compras no Site"
              value={currentData.metrics.purchases.results}
              costPerResult={currentData.metrics.purchases.costPerResult}
              color="primary"
              isExcellent={currentData.metrics.purchases.costPerResult > 0 && currentData.metrics.purchases.costPerResult < 40}
              excellentMessage="Resultado Excelente! O custo por compra está abaixo de R$40, indicando alta eficiência na conversão de vendas."
              showGrowthIcon={currentData.metrics.purchases.results > 0}
            />
            <CustomMetricCard
              title="Leads Gerados"
              value={currentData.metrics.leads.results}
              costPerResult={currentData.metrics.leads.costPerResult}
              color="secondary"
              showGrowthIcon={currentData.metrics.leads.results > 0}
            />
            <CustomMetricCard
              title="Visitas ao Perfil"
              value={currentData.metrics.profileVisits.results}
              costPerResult={currentData.metrics.profileVisits.costPerResult}
              color="accent"
              formatAsNumber
              showGrowthIcon={currentData.metrics.profileVisits.results > 0}
            />
          </div>

          {/* Card Seguidores */}
          <div className="mb-10 animate-fade-in">
            <div className="bg-franca-light-green rounded-2xl p-7 card-hover">
              <p className="text-xs font-semibold text-franca-accent uppercase tracking-wider mb-1">
                Novos Seguidores
                {currentData.followers > 0 && <GrowthIcon />}
              </p>
              <p className="text-[10px] text-franca-accent/70 mb-4">
                Novos seguidores conquistados no período
              </p>
              <p className="text-4xl font-bold text-franca-secondary">
                +{formatNumber(currentData.followers)}
              </p>
            </div>
          </div>
        </>
      );
    }

    // MIGUEL
    if (activeCompany === 'miguel') {
      return (
        <>
          {/* Card Investimento Grande */}
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-franca-primary to-franca-primary-dark rounded-2xl p-8 md:p-10 shadow-lg">
              <p className="text-franca-secondary text-sm font-semibold uppercase tracking-wider mb-1">
                Investimento Total
              </p>
              <p className="text-franca-secondary/70 text-xs mb-2">
                Valor investido no período
              </p>
              <p className="text-franca-secondary text-4xl md:text-5xl font-bold">
                {formatCurrency(currentData.investment)}
              </p>
            </div>
          </div>

          {/* Card Visualizações */}
          <div className="mb-6 animate-fade-in">
            <ViewsCard value={currentData.impressions} showGrowthIcon={currentData.impressions > 0} />
          </div>

          {/* Métricas principais - Miguel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 stagger-children">
            <CustomMetricCard
              title="Novos Seguidores"
              value={currentData.followers}
              color="primary"
              showCost={false}
              prefix="+"
              showGrowthIcon={currentData.followers > 0}
            />
            <CustomMetricCard
              title="Visitas ao Perfil"
              value={currentData.metrics.profileVisits.results}
              costPerResult={currentData.metrics.profileVisits.costPerResult}
              color="accent"
              formatAsNumber
              isExcellent={currentData.metrics.profileVisits.costPerResult > 0 && currentData.metrics.profileVisits.costPerResult < 0.50}
              excellentMessage="Resultado Excelente! O custo por visita está abaixo de R$0,50, indicando ótima eficiência no engajamento."
              showGrowthIcon={currentData.metrics.profileVisits.results > 0}
            />
          </div>
        </>
      );
    }

    // TREVO BARBEARIA
    if (activeCompany === 'trevo-barbearia') {
      const visitCost = currentData.metrics.profileVisits.costPerResult;
      const isSuperExcellent = visitCost > 0 && visitCost < 0.20;
      const isExcellent = visitCost > 0 && visitCost < 0.50 && !isSuperExcellent;

      return (
        <>
          {/* Card Investimento Grande */}
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-franca-primary to-franca-primary-dark rounded-2xl p-8 md:p-10 shadow-lg">
              <p className="text-franca-secondary text-sm font-semibold uppercase tracking-wider mb-1">
                Investimento Total
              </p>
              <p className="text-franca-secondary/70 text-xs mb-2">
                Valor investido no período
              </p>
              <p className="text-franca-secondary text-4xl md:text-5xl font-bold">
                {formatCurrency(currentData.investment)}
              </p>
            </div>
          </div>

          {/* Card Visualizações */}
          <div className="mb-6 animate-fade-in">
            <ViewsCard value={currentData.impressions} showGrowthIcon={currentData.impressions > 0} />
          </div>

          {/* Métricas principais - Trevo Barbearia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 stagger-children">
            <CustomMetricCard
              title="Conversas por Mensagem Iniciadas"
              value={currentData.metrics.purchases.results}
              costPerResult={currentData.metrics.purchases.costPerResult}
              color="primary"
              showGrowthIcon={currentData.metrics.purchases.results > 0}
            />
            <CustomMetricCard
              title="Novos Seguidores"
              value={currentData.followers}
              color="secondary"
              showCost={false}
              prefix="+"
              showGrowthIcon={currentData.followers > 0}
            />
            <CustomMetricCard
              title="Visitas ao Perfil"
              value={currentData.metrics.profileVisits.results}
              costPerResult={currentData.metrics.profileVisits.costPerResult}
              color="accent"
              formatAsNumber
              isExcellent={isExcellent}
              isSuperExcellent={isSuperExcellent}
              excellentMessage="Resultado Excelente! O custo por visita está abaixo de R$0,50, indicando ótima eficiência no engajamento."
              superExcellentMessage="O custo por visita está ABAIXO de R$0,20! Performance excepcional, continuem assim!"
              showGrowthIcon={currentData.metrics.profileVisits.results > 0}
            />
          </div>
        </>
      );
    }

    // TREVO TABACARIA
    if (activeCompany === 'trevo-tabacaria') {
      return (
        <>
          {/* Card Investimento Grande */}
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-franca-primary to-franca-primary-dark rounded-2xl p-8 md:p-10 shadow-lg">
              <p className="text-franca-secondary text-sm font-semibold uppercase tracking-wider mb-1">
                Investimento Total
              </p>
              <p className="text-franca-secondary/70 text-xs mb-2">
                Valor investido no período
              </p>
              <p className="text-franca-secondary text-4xl md:text-5xl font-bold">
                {formatCurrency(currentData.investment)}
              </p>
            </div>
          </div>

          {/* Card Visualizações */}
          <div className="mb-6 animate-fade-in">
            <ViewsCard value={currentData.impressions} showGrowthIcon={currentData.impressions > 0} />
          </div>

          {/* Métricas principais - Trevo Tabacaria (só Conversas e Seguidores) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 stagger-children">
            <CustomMetricCard
              title="Conversas por Mensagem Iniciadas"
              value={currentData.metrics.purchases.results}
              costPerResult={currentData.metrics.purchases.costPerResult}
              color="primary"
              showGrowthIcon={currentData.metrics.purchases.results > 0}
            />
            <CustomMetricCard
              title="Novos Seguidores"
              value={currentData.followers}
              color="secondary"
              showCost={false}
              prefix="+"
              showGrowthIcon={currentData.followers > 0}
            />
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        user={user}
        isAdmin={isAdmin}
        onLogout={signOut}
        onFileUpload={handleFileUpload}
      />

      <CompanyNav
        activeCompany={activeCompany}
        onCompanyChange={setActiveCompany}
      />

      <main ref={dashboardRef} className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-fade-in">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-franca-secondary tracking-tight">
              {currentData.name}
            </h2>
            <p className="text-sm text-franca-accent mt-2">
              Período: {currentData.period.start} - {currentData.period.end}
            </p>
          </div>
        </div>

        {isSaving && (
          <div className="fixed top-20 right-4 bg-franca-primary text-franca-secondary px-4 py-2 rounded-lg text-sm font-medium animate-pulse-slow z-50">
            Salvando...
          </div>
        )}

        {renderDashboardContent()}

        <InsightsSection
          insights={currentInsights}
          editMode={editMode}
          isAdmin={isAdmin}
          onInsightsChange={handleInsightsChange}
          onEditModeToggle={() => setEditMode(!editMode)}
          onSave={saveInsights}
        />

        <DashboardFooter onExportPDF={exportPDF} isExporting={isExporting} />
      </main>

      <UploadModal
        isOpen={showUploadModal}
        companyName={companies.find(c => c.id === activeCompany)?.name || ''}
        onConfirm={confirmUpload}
        onCancel={() => {
          setShowUploadModal(false);
          setUploadedData(null);
        }}
      />
    </div>
  );
}
