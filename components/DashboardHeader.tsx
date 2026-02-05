'use client';

import { User } from 'firebase/auth';
import Image from 'next/image';
import FrancaLogo from './FrancaLogo';

interface DashboardHeaderProps {
  user: User | null;
  isAdmin: boolean;
  onLogout: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DashboardHeader({
  user,
  isAdmin,
  onLogout,
  onFileUpload,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-franca-light-blue px-6 md:px-10 py-5 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <FrancaLogo size="md" />
          <div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight text-franca-secondary">
              Relatório de Performance
            </h1>
            <p className="text-xs text-franca-accent hidden md:block">
              Dashboard de Campanhas
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Upload Button (Admin only) */}
          {isAdmin && (
            <label className="px-4 py-2 bg-franca-light-green text-franca-secondary rounded-lg text-xs font-medium cursor-pointer hover:bg-franca-primary/30 transition-all no-print">
              <span className="hidden md:inline">Importar Planilha</span>
              <span className="md:hidden">Importar</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={onFileUpload}
                className="hidden"
              />
            </label>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3">
            {user?.photoURL && (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-franca-secondary leading-tight">
                {user?.displayName?.split(' ')[0]}
              </p>
              {isAdmin && (
                <p className="text-xs text-franca-primary-dark">Admin</p>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-franca-secondary text-white rounded-lg text-xs font-medium hover:bg-franca-secondary/90 transition-all no-print"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
