// Formatar moeda brasileira
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatar número
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

// Verificar senha do admin
export const verifyAdminPassword = (password: string): boolean => {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
  return password === adminPassword;
};

// Cores da marca Franca
export const colors = {
  primary: '#7DE08D',
  primaryDark: '#5ea86a',
  secondary: '#081534',
  accent: '#598F74',
  white: '#FFFFFF',
  lightGreen: '#f2fcf4',
  lightBlue: '#e6e8eb'
};

// Empresas disponíveis
export const companies = [
  { id: 'fagori', name: 'Fagori Invest' },
  { id: 'trevo-barbearia', name: 'Trevo Barbearia' },
  { id: 'trevo-tabacaria', name: 'Trevo Tabacaria' },
  { id: 'miguel', name: 'Miguel' }
];

// Tipos de dados
export interface MetricData {
  results: number;
  costPerResult: number;
}

export interface CompanyData {
  name: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    purchases: MetricData;
    leads: MetricData;
    profileVisits: MetricData;
  };
  investment: number;
  followers: number;
  impressions: number;
}

export interface Insights {
  progress: string;
  positives: string;
  nextFocus: string;
}

export interface DashboardData {
  [companyId: string]: CompanyData;
}

// Dados de exemplo
export const sampleData: DashboardData = {
  fagori: {
    name: 'Fagori Invest',
    period: { start: '01/01/2025', end: '31/01/2025' },
    metrics: {
      purchases: { results: 47, costPerResult: 32.50 },
      leads: { results: 156, costPerResult: 18.75 },
      profileVisits: { results: 2340, costPerResult: 1.25 }
    },
    investment: 5890.00,
    followers: 234,
    impressions: 145000
  },
  'trevo-barbearia': {
    name: 'Trevo Barbearia',
    period: { start: '01/01/2025', end: '31/01/2025' },
    metrics: {
      purchases: { results: 0, costPerResult: 0 },
      leads: { results: 89, costPerResult: 12.50 },
      profileVisits: { results: 1560, costPerResult: 0.85 }
    },
    investment: 2200.00,
    followers: 178,
    impressions: 89000
  },
  'trevo-tabacaria': {
    name: 'Trevo Tabacaria',
    period: { start: '01/01/2025', end: '31/01/2025' },
    metrics: {
      purchases: { results: 23, costPerResult: 45.00 },
      leads: { results: 67, costPerResult: 22.00 },
      profileVisits: { results: 980, costPerResult: 1.50 }
    },
    investment: 3500.00,
    followers: 145,
    impressions: 67000
  },
  'miguel': {
    name: 'Miguel',
    period: { start: '01/01/2025', end: '31/01/2025' },
    metrics: {
      purchases: { results: 12, costPerResult: 38.00 },
      leads: { results: 45, costPerResult: 15.00 },
      profileVisits: { results: 750, costPerResult: 1.10 }
    },
    investment: 1800.00,
    followers: 98,
    impressions: 45000
  }
};
