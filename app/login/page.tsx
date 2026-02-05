'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { user, loading, isAuthorized, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (isAuthorized) {
        router.push('/dashboard');
      } else {
        setError('Seu email não está autorizado a acessar este dashboard. Entre em contato com o administrador.');
      }
    }
  }, [user, loading, isAuthorized, router]);

  const handleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-franca-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-franca-light-green to-white">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-14 mx-auto mb-4">
              <svg viewBox="0 0 120 80" className="w-full h-full">
                <polygon points="10,70 50,10 90,10 50,70" fill="#7DE08D" />
                <polygon points="70,10 110,10 90,40" fill="#598F74" />
                <path d="M35,35 L35,55 L45,55 L45,47 L55,47 L55,40 L45,40 L45,35 Z" fill="#081534" />
                <circle cx="62" cy="58" r="5" fill="#081534" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-franca-secondary">
              Franca Dashboard
            </h1>
            <p className="text-franca-accent text-sm mt-2">
              Relatório de Performance de Campanhas
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-franca-light-blue rounded-xl hover:bg-franca-light-green transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-franca-secondary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-franca-secondary">
                  Entrar com Google
                </span>
              </>
            )}
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-franca-accent mt-6">
            Acesso restrito a usuários autorizados
          </p>
        </div>

        {/* Brand Footer */}
        <p className="text-center text-xs text-franca-accent mt-8">
          Franca Assessoria • Vendendo mais para você
        </p>
      </div>
    </div>
  );
}
