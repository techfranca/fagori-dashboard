'use client';

interface UploadModalProps {
  isOpen: boolean;
  companyName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function UploadModal({
  isOpen,
  companyName,
  onConfirm,
  onCancel,
}: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-franca-secondary/80 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-fade-in">
        <h3 className="text-lg font-semibold text-franca-secondary mb-4">
          Confirmar Importação
        </h3>
        <p className="text-sm text-franca-accent mb-6">
          Deseja substituir os dados atuais de <strong>{companyName}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-franca-light-blue text-franca-secondary rounded-lg text-sm font-medium hover:bg-franca-light-blue/70 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-franca-primary text-franca-secondary rounded-lg text-sm font-semibold hover:bg-franca-primary-dark transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
