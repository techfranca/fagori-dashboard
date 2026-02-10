'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

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
        <p className="mt-4 text-franca-accent text-sm">Carregando...</p>
      </div>
    </div>
  );
}
