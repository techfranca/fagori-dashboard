'use client';

import { useEffect, useState, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DashboardHeader,
  DashboardFooter,
  CompanyNav,
  InsightsSection,
  UploadModal,
  FagoriDashboard,
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
  verifyAdminPassword,
} from '@/lib/utils';
import { parseXLSX } from '@/lib/xlsxParser';
import { generatePDF } from '@/lib/pdfExport';

// Modal de senha admin
function AdminPasswordModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(password)) {
      onSuccess();
      setPassword('');
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-xl font-bold text-franca-secondary mb-2">Área Admin</h3>
        <p className="text-sm text-franca-accent mb-6">Digite a senha para acessar as funções de administrador.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full px-4 py-3 border border-franca-light-blue rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-franca-primary"
            autoFocus
          />
          
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                setPassword('');
                setError('');
              }}
              className="flex-1 px-4 py-3 border border-franca-light-blue rounded-lg text-franca-accent hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-franca-secondary text-white rounded-lg hover:bg-franca-secondary/90 transition-colors"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<DashboardData>(sampleData);
  const [activeCompany, setActiveCompany] = useState('fagori');
  const [insights, setInsights] = useState<{ [key: string]: Insights }>({});
  const [editMode, setEditMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedData, setUploadedData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Carregar dados do Firestore
  useEffect(() => {
    const loadData = async () => {
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
    loadData();
  }, []);

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
      // Buscar insights diretamente do Firestore
      let pdfInsights: Insights = { progress: '', positives: '', nextFocus: '' };
      
      try {
        const insightsDoc = await getDoc(doc(db, 'dashboard', 'insights'));
        if (insightsDoc.exists()) {
          const allInsights = insightsDoc.data() as { [key: string]: Insights };
          pdfInsights = allInsights[activeCompany] || pdfInsights;
        }
      } catch (err) {
        console.error('Erro ao buscar insights:', err);
        pdfInsights = insights[activeCompany] || pdfInsights;
      }
      
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
  const currentData = data[activeCompany] || sampleData.fagori;
  const currentInsights = insights[activeCompany] || { progress: '', positives: '', nextFocus: '' };

  // Handler de mudança de insights
  const handleInsightsChange = (newInsights: Insights) => {
    setInsights({ ...insights, [activeCompany]: newInsights });
  };

  // Renderizar dashboard por cliente
  const renderDashboardContent = () => {
    switch (activeCompany) {
      case 'fagori':
        return <FagoriDashboard data={currentData} />;
      case 'miguel':
        return <MiguelDashboard data={currentData} />;
      case 'trevo-barbearia':
        return <TrevoBarbeariaDashboard data={currentData} />;
      case 'trevo-tabacaria':
        return <TrevoTabacariaDashboard data={currentData} />;
      default:
        return <FagoriDashboard data={currentData} />;
    }
  };

  // Loading state
  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header simplificado sem login */}
      <header className="bg-white border-b border-franca-light-blue px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <svg viewBox="0 0 120 80" className="w-full h-full">
                <polygon points="10,70 50,10 90,10 50,70" fill="#7DE08D" />
                <polygon points="70,10 110,10 90,40" fill="#598F74" />
                <path d="M35,35 L35,55 L45,55 L45,47 L55,47 L55,40 L45,40 L45,35 Z" fill="#081534" />
                <circle cx="62" cy="58" r="5" fill="#081534" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-franca-secondary">Relatório de Performance</h1>
              <p className="text-xs text-franca-accent">Dashboard de Campanhas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <>
                <label className="px-4 py-2 bg-franca-primary text-franca-secondary rounded-lg text-sm font-medium cursor-pointer hover:bg-franca-primary/90 transition-colors">
                  Importar Planilha
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setIsAdmin(false)}
                  className="px-4 py-2 bg-franca-secondary text-white rounded-lg text-sm font-medium hover:bg-franca-secondary/90 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sair Admin
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="px-4 py-2 border border-franca-light-blue text-franca-accent rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Área Admin
              </button>
            )}
          </div>
        </div>
      </header>

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

      <AdminPasswordModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={() => {
          setIsAdmin(true);
          setShowAdminModal(false);
        }}
      />
    </div>
  );
}
