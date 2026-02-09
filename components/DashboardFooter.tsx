import FrancaLogo from './FrancaLogo';

interface DashboardFooterProps {
  onExportPDF: () => void;
  isExporting?: boolean;
}

export default function DashboardFooter({ onExportPDF, isExporting = false }: DashboardFooterProps) {
  return (
    <footer className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-franca-light-blue">
      <div className="flex items-center gap-3">
        <FrancaLogo size="sm" />
        <span className="text-sm text-franca-accent">
          Franca Assessoria
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className="px-4 py-2 bg-franca-secondary text-white rounded-lg text-xs font-medium hover:bg-franca-secondary/90 transition-all no-print disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Gerando PDF...
            </>
          ) : (
            'Exportar PDF'
          )}
        </button>
        <p className="text-xs text-franca-accent">
          Vendendo mais para você
        </p>
      </div>
    </footer>
  );
}
