import { formatCurrency, formatNumber } from '@/lib/utils';

// Ícone de crescimento
export const GrowthIcon = () => (
  <svg className="w-4 h-4 text-franca-primary-dark inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// Props do Card Customizado
export interface CustomMetricCardProps {
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

// Componente de Card Customizado
export function CustomMetricCard({
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

// Props do Card de Visualizações
export interface ViewsCardProps {
  value: number;
  showGrowthIcon?: boolean;
}

// Card de Visualizações (Principal em todos)
export function ViewsCard({ value, showGrowthIcon = false }: ViewsCardProps) {
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

// Card de Investimento Total
export interface InvestmentCardProps {
  value: number;
}

export function InvestmentCard({ value }: InvestmentCardProps) {
  return (
    <div className="mb-6 animate-fade-in">
      <div className="bg-gradient-to-r from-franca-primary to-franca-primary-dark rounded-2xl p-8 md:p-10 shadow-lg">
        <p className="text-franca-secondary text-sm font-semibold uppercase tracking-wider mb-1">
          Investimento Total
        </p>
        <p className="text-franca-secondary/70 text-xs mb-2">
          Valor investido no período
        </p>
        <p className="text-franca-secondary text-4xl md:text-5xl font-bold">
          {formatCurrency(value)}
        </p>
      </div>
    </div>
  );
}

// Card de Seguidores (usado no Houston)
export interface FollowersCardProps {
  value: number;
  showGrowthIcon?: boolean;
}

export function FollowersCard({ value, showGrowthIcon = false }: FollowersCardProps) {
  return (
    <div className="mb-10 animate-fade-in">
      <div className="bg-franca-light-green rounded-2xl p-7 card-hover">
        <p className="text-xs font-semibold text-franca-accent uppercase tracking-wider mb-1">
          Novos Seguidores
          {showGrowthIcon && value > 0 && <GrowthIcon />}
        </p>
        <p className="text-[10px] text-franca-accent/70 mb-4">
          Novos seguidores conquistados no período
        </p>
        <p className="text-4xl font-bold text-franca-secondary">
          +{formatNumber(value)}
        </p>
      </div>
    </div>
  );
}
