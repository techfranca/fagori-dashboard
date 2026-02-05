'use client';

import { Insights } from '@/lib/utils';

interface InsightsSectionProps {
  insights: Insights;
  editMode: boolean;
  isAdmin: boolean;
  onInsightsChange: (insights: Insights) => void;
  onEditModeToggle: () => void;
  onSave: () => void;
}

export default function InsightsSection({
  insights,
  editMode,
  isAdmin,
  onInsightsChange,
  onEditModeToggle,
  onSave,
}: InsightsSectionProps) {
  const handleSave = () => {
    onSave();
    onEditModeToggle();
  };

  const sections = [
    {
      key: 'progress' as const,
      title: 'Pontos de Progresso',
      bg: 'bg-franca-light-green',
      border: 'border-franca-primary',
      titleColor: 'text-franca-primary-dark',
    },
    {
      key: 'positives' as const,
      title: 'Pontos Positivos',
      bg: 'bg-franca-light-blue',
      border: 'border-franca-secondary',
      titleColor: 'text-franca-secondary',
    },
    {
      key: 'nextFocus' as const,
      title: 'Focos do Próximo Mês',
      bg: 'bg-white border border-franca-light-blue',
      border: 'border-franca-accent',
      titleColor: 'text-franca-accent',
    },
  ];

  return (
    <div className="bg-white border border-franca-light-blue rounded-2xl p-8 mb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-franca-secondary">
          Análise e Próximos Passos
        </h3>

        {isAdmin && (
          <button
            onClick={editMode ? handleSave : onEditModeToggle}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              editMode
                ? 'bg-franca-primary text-franca-secondary'
                : 'bg-franca-light-green text-franca-secondary'
            }`}
          >
            {editMode ? 'Salvar' : 'Editar'}
          </button>
        )}
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.key}
            className={`p-5 rounded-xl border-l-4 ${section.bg} ${section.border}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${section.titleColor}`}>
              {section.title}
            </p>

            {editMode ? (
              <textarea
                value={insights[section.key]}
                onChange={(e) =>
                  onInsightsChange({ ...insights, [section.key]: e.target.value })
                }
                className="w-full min-h-[120px] p-3 border border-franca-light-blue rounded-lg text-sm font-normal resize-y bg-white focus:outline-none focus:ring-2 focus:ring-franca-primary/20 focus:border-franca-primary"
                placeholder={`Descreva os ${section.title.toLowerCase()}...`}
              />
            ) : (
              <p className="text-sm text-franca-secondary leading-relaxed whitespace-pre-wrap">
                {insights[section.key] || `Nenhum ${section.title.toLowerCase().slice(0, -1)} adicionado ainda.`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
