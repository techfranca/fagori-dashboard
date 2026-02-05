'use client';

import { companies } from '@/lib/utils';

interface CompanyNavProps {
  activeCompany: string;
  onCompanyChange: (companyId: string) => void;
}

export default function CompanyNav({ activeCompany, onCompanyChange }: CompanyNavProps) {
  return (
    <nav className="px-6 md:px-10 bg-white border-b border-franca-light-blue overflow-x-auto">
      <div className="flex max-w-7xl mx-auto">
        {companies.map((company) => (
          <button
            key={company.id}
            onClick={() => onCompanyChange(company.id)}
            className={`px-4 md:px-6 py-4 border-b-[3px] transition-all whitespace-nowrap text-sm ${
              activeCompany === company.id
                ? 'border-franca-primary text-franca-secondary font-semibold'
                : 'border-transparent text-franca-accent hover:text-franca-secondary'
            }`}
          >
            {company.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
