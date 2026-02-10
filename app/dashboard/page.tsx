'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DashboardHeader,
  DashboardFooter,
  CompanyNav,
  InsightsSection,
  UploadModal,
  HoustonDashboard,
  MiguelDashboard,
  TrevoBarbeariaDashboard,
  TrevoTabacariaDashboard,
} from '@/components';
import {
  companies,
  sampleData,
  DashboardData,
  Insights,
  CompanyData,
} from '@/lib/utils';
import { parseXLSX } from '@/lib/xlsxParser';
import { generatePDF } from '@/lib/pdfExport';

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

  // Redirect se não autenticado
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAuthorized) {
        router.push('/login');
      }
    }
  }, [user, loading, isAuthorized, router]);

  // Carregar dados do Firestore
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

  // Salvar dados no Firestore
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

  // Salvar insights no Firestore
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

  // Handler de upload de arquivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsed = await parseXLSX(file, activeCompany);
        setUploadedData(parsed);
        setShowUploadModal(true);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Erro ao processar arquivo. Verifique o formato da planilha.');
      }
    }
    e.target.value = '';
  };

  // Confirmar upload
  const confirmUpload = () => {
    if (uploadedData) {
      const newData = { ...data, [activeCompany]: uploadedData };
      saveData(newData);
      setShowUploadModal(false);
      setUploadedData(null);
    }
  };

  // Exportar PDF
  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const pdfInsights = insights[activeCompany] || { progress: '', positives: '', nextFocus: '' };
      
      // Debug: verificar o que está sendo passado
      console.log('Exportando PDF com insights:', pdfInsights);
      console.log('Estado completo de insights:', insights);
      console.log('Empresa ativa:', activeCompany);
      
      generatePDF({
        currentData,
        activeCompany,
        insights: pdfInsights,
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Dados atuais
  const currentData = data[activeCompany] || sampleData.houston;
  const currentInsights = insights[activeCompany] || { progress: '', positives: '', nextFocus: '' };

  // Handler de mudança de insights
  const handleInsightsChange = (newInsights: Insights) => {
    setInsights({ ...insights, [activeCompany]: newInsights });
  };

  // Renderizar dashboard por cliente
  const renderDashboardContent = () => {
    switch (activeCompany) {
      case 'houston':
        return <HoustonDashboard data={currentData} />;
      case 'miguel':
        return <MiguelDashboard data={currentData} />;
      case 'trevo-barbearia':
        return <TrevoBarbeariaDashboard data={currentData} />;
      case 'trevo-tabacaria':
        return <TrevoTabacariaDashboard data={currentData} />;
      default:
        return <HoustonDashboard data={currentData} />;
    }
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