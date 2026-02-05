import { formatNumber } from '@/lib/utils';

interface SecondaryCardProps {
  title: string;
  value: number;
  prefix?: string;
  variant: 'light' | 'dark';
  icon: 'users' | 'eye';
}

export default function SecondaryCard({
  title,
  value,
  prefix = '',
  variant,
  icon,
}: SecondaryCardProps) {
  const icons = {
    users: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={variant === 'dark' ? '#7DE08D' : '#081534'} strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    eye: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={variant === 'dark' ? '#7DE08D' : '#081534'} strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  };

  return (
    <div
      className={`rounded-2xl p-7 flex justify-between items-center card-hover ${
        variant === 'dark'
          ? 'bg-franca-secondary'
          : 'bg-franca-light-green'
      }`}
    >
      <div>
        <p
          className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
            variant === 'dark' ? 'text-franca-light-blue' : 'text-franca-accent'
          }`}
        >
          {title}
        </p>
        <p
          className={`text-4xl font-bold ${
            variant === 'dark' ? 'text-white' : 'text-franca-secondary'
          }`}
        >
          {prefix}{formatNumber(value)}
        </p>
      </div>

      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center ${
          variant === 'dark'
            ? 'bg-franca-primary/20'
            : 'bg-franca-primary'
        }`}
      >
        {icons[icon]}
      </div>
    </div>
  );
}
