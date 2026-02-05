import FrancaLogo from './FrancaLogo';

interface DashboardFooterProps {
  onExportPDF: () => void;
}

export default function DashboardFooter({ onExportPDF }: DashboardFooterProps) {
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
          className="px-4 py-2 bg-franca-secondary text-white rounded-lg text-xs font-medium hover:bg-franca-secondary/90 transition-all no-print"
        >
          Exportar PDF
        </button>
        <p className="text-xs text-franca-accent">
          Vendendo mais para você
        </p>
      </div>
    </footer>
  );
}
