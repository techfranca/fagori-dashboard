'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  DashboardHeader,
  DashboardFooter,
  CompanyNav,
  MetricCard,
  SecondaryCard,
  InsightsSection,
  UploadModal,
} from '@/components';
import {
  formatCurrency,
  companies,
  sampleData,
  DashboardData,
  Insights,
  CompanyData,
} from '@/lib/utils';

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

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAuthorized) {
        router.push('/login');
      }
    }
  }, [user, loading, isAuthorized, router]);

  // Load data from Firestore
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load dashboard data
        const dataDoc = await getDoc(doc(db, 'dashboard', 'data'));
        if (dataDoc.exists()) {
          setData(dataDoc.data() as DashboardData);
        }

        // Load insights
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

  // Save data to Firestore
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

  // Save insights to Firestore
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

  // Parse XLSX file
  const parseXLSX = (file: File): Promise<CompanyData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Initialize metrics
          let purchases = { results: 0, costPerResult: 0 };
          let leads = { results: 0, costPerResult: 0 };
          let profileVisits = { results: 0, costPerResult: 0 };
          let totalInvestment = 0;
          let followers = 0;
          let impressions = 0;
          let periodStart = '';
          let periodEnd = '';

          // Process each row
          jsonData.forEach((row: any) => {
            const resultType = row['Tipo de resultado']?.toLowerCase() || '';
            const results = Number(row['Resultados']) || 0;
            const costPerResult = Number(row['Custo por resultado']) || 0;
            const investment = Number(row['Valor usado (BRL)']) || 0;

            totalInvestment += investment;

            if (row['Seguidores no Instagram']) {
              followers = Number(row['Seguidores no Instagram']) || 0;
            }

            if (row['Impressões']) {
              impressions += Number(row['Impressões']) || 0;
            }

            if (row['Início dos relatórios']) {
              periodStart = row['Início dos relatórios'];
            }

            if (row['Término dos relatórios']) {
              periodEnd = row['Término dos relatórios'];
            }

            if (resultType.includes('compras no site') || resultType.includes('compras')) {
              purchases.results += results;
              purchases.costPerResult = costPerResult;
            } else if (resultType.includes('leads no site') || resultType.includes('leads')) {
              leads.results += results;
              leads.costPerResult = costPerResult;
            } else if (resultType.includes('visitas ao perfil') || resultType.includes('visitas')) {
              profileVisits.results += results;
              profileVisits.costPerResult = costPerResult;
            }
          });

          const companyName = companies.find(c => c.id === activeCompany)?.name || 'Empresa';

          resolve({
            name: companyName,
            period: { start: periodStart, end: periodEnd },
            metrics: { purchases, leads, profileVisits },
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

  // Handle file upload
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
    // Reset input
    e.target.value = '';
  };

  // Confirm upload
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
    if (!dashboardRef.current) return;

    try {
      // Hide no-print elements
      const noPrintElements = document.querySelectorAll('.no-print');
      noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none');

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Show no-print elements again
      noPrintElements.forEach(el => (el as HTMLElement).style.display = '');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`franca-relatorio-${activeCompany}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    }
  };

  // Get current company data
  const currentData = data[activeCompany] || sampleData.houston;
  const currentInsights = insights[activeCompany] || { progress: '', positives: '', nextFocus: '' };

  // Handle insights change
  const handleInsightsChange = (newInsights: Insights) => {
    setInsights({ ...insights, [activeCompany]: newInsights });
  };

  // Loading state
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <DashboardHeader
        user={user}
        isAdmin={isAdmin}
        onLogout={signOut}
        onFileUpload={handleFileUpload}
      />

      {/* Company Navigation */}
      <CompanyNav
        activeCompany={activeCompany}
        onCompanyChange={setActiveCompany}
      />

      {/* Main Content */}
      <main ref={dashboardRef} className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        {/* Company Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-franca-secondary tracking-tight">
              {currentData.name}
            </h2>
            <p className="text-sm text-franca-accent mt-2">
              Período: {currentData.period.start} - {currentData.period.end}
            </p>
          </div>

          <div className="px-6 py-3 bg-franca-secondary text-white rounded-lg text-sm font-medium">
            Investimento Total: {formatCurrency(currentData.investment)}
          </div>
        </div>

        {/* Saving indicator */}
        {isSaving && (
          <div className="fixed top-20 right-4 bg-franca-primary text-franca-secondary px-4 py-2 rounded-lg text-sm font-medium animate-pulse-slow z-50">
            Salvando...
          </div>
        )}

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger-children">
          <MetricCard
            title="Compras no Site"
            value={currentData.metrics.purchases.results}
            costPerResult={currentData.metrics.purchases.costPerResult}
            color="primary"
            isExcellent={currentData.metrics.purchases.costPerResult > 0 && currentData.metrics.purchases.costPerResult < 40}
          />

          <MetricCard
            title="Leads Gerados"
            value={currentData.metrics.leads.results}
            costPerResult={currentData.metrics.leads.costPerResult}
            color="secondary"
          />

          <MetricCard
            title="Visitas ao Perfil"
            value={currentData.metrics.profileVisits.results}
            costPerResult={currentData.metrics.profileVisits.costPerResult}
            color="accent"
            formatAsNumber
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 stagger-children">
          <SecondaryCard
            title="Novos Seguidores"
            value={currentData.followers}
            prefix="+"
            variant="light"
            icon="users"
          />

          <SecondaryCard
            title="Impressões"
            value={currentData.impressions}
            variant="dark"
            icon="eye"
          />
        </div>

        {/* Insights Section */}
        <InsightsSection
          insights={currentInsights}
          editMode={editMode}
          isAdmin={isAdmin}
          onInsightsChange={handleInsightsChange}
          onEditModeToggle={() => setEditMode(!editMode)}
          onSave={saveInsights}
        />

        {/* Footer */}
        <DashboardFooter onExportPDF={exportPDF} />
      </main>

      {/* Upload Modal */}
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
