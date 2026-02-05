import { formatCurrency, formatNumber } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  costPerResult: number;
  color: 'primary' | 'secondary' | 'accent';
  isExcellent?: boolean;
  formatAsNumber?: boolean;
}

export default function MetricCard({
  title,
  value,
  costPerResult,
  color,
  isExcellent = false,
  formatAsNumber = false,
}: MetricCardProps) {
  const colorClasses = {
    primary: 'bg-franca-primary',
    secondary: 'bg-franca-secondary',
    accent: 'bg-franca-accent',
  };

  return (
    <div className="bg-white border border-franca-light-blue rounded-2xl p-7 relative overflow-hidden card-hover">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colorClasses[color]}`} />

      {/* Title */}
      <p className="text-xs font-semibold text-franca-accent uppercase tracking-wider mb-4">
        {title}
      </p>

      {/* Main Value */}
      <p className="text-5xl font-bold text-franca-secondary mb-2 leading-none">
        {formatAsNumber ? formatNumber(value) : value}
      </p>

      {/* Cost per result */}
      {costPerResult > 0 && (
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-franca-accent">
            Custo por resultado:
          </span>
          <span className={`text-base font-semibold ${isExcellent ? 'text-franca-primary-dark' : 'text-franca-secondary'}`}>
            {formatCurrency(costPerResult)}
          </span>
        </div>
      )}

      {/* Excellent indicator */}
      {isExcellent && (
        <div className="mt-4 p-3 bg-franca-light-green rounded-lg border-l-4 border-franca-primary">
          <p className="text-xs font-medium text-franca-primary-dark">
            Resultado Excelente! O custo por compra está abaixo de R$40,
            indicando alta eficiência na conversão de vendas.
          </p>
        </div>
      )}
    </div>
  );
}
