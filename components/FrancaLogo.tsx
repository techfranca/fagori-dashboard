interface FrancaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FrancaLogo({ className = '', size = 'md' }: FrancaLogoProps) {
  const sizes = {
    sm: 'w-8 h-6',
    md: 'w-12 h-8',
    lg: 'w-20 h-14',
  };

  return (
    <svg viewBox="0 0 120 80" className={`${sizes[size]} ${className}`}>
      <polygon points="10,70 50,10 90,10 50,70" fill="#7DE08D" />
      <polygon points="70,10 110,10 90,40" fill="#598F74" />
      <path d="M35,35 L35,55 L45,55 L45,47 L55,47 L55,40 L45,40 L45,35 Z" fill="#081534" />
      <circle cx="62" cy="58" r="5" fill="#081534" />
    </svg>
  );
}
