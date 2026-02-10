import * as XLSX from 'xlsx';
import { CompanyData, companies } from '@/lib/utils';

// Helper para formatar datas
export const formatDate = (dateValue: any): string => {
  if (!dateValue) return '';
  if (typeof dateValue === 'string') {
    if (dateValue.includes('-')) {
      const [year, month, day] = dateValue.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateValue;
  }
  if (dateValue instanceof Date) {
    return dateValue.toLocaleDateString('pt-BR');
  }
  if (typeof dateValue === 'number') {
    const date = new Date((dateValue - 25569) * 86400 * 1000);
    return date.toLocaleDateString('pt-BR');
  }
  return String(dateValue);
};

// Parse XLSX customizado por cliente
export const parseXLSX = (file: File, activeCompany: string): Promise<CompanyData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        const workbook = XLSX.read(fileData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let purchases = { results: 0, totalCost: 0 };
        let leads = { results: 0, totalCost: 0 };
        let profileVisits = { results: 0, totalCost: 0 };
        let totalInvestment = 0;
        let followers = 0;
        let impressions = 0;
        let periodStart = '';
        let periodEnd = '';

        jsonData.forEach((row: any) => {
          const resultType = (row['Tipo de resultado'] || '').toString().toLowerCase();
          const results = Number(row['Resultados']) || 0;
          const investment = Number(row['Valor usado (BRL)']) || 0;

          totalInvestment += investment;

          if (row['Seguidores no Instagram'] !== undefined) {
            followers += Number(row['Seguidores no Instagram']) || 0;
          }

          if (row['Impressões'] !== undefined) {
            impressions += Number(row['Impressões']) || 0;
          }

          if (!periodStart && row['Início dos relatórios']) {
            periodStart = formatDate(row['Início dos relatórios']);
          }

          if (!periodEnd && row['Término dos relatórios']) {
            periodEnd = formatDate(row['Término dos relatórios']);
          }

          // HOUSTON ACADEMY
          if (activeCompany === 'houston') {
            if (resultType.includes('compras no site') || resultType.includes('compras')) {
              purchases.results += results;
              purchases.totalCost += investment;
            } else if (resultType.includes('leads no site') || resultType.includes('leads')) {
              leads.results += results;
              leads.totalCost += investment;
            } else if (resultType.includes('visitas ao perfil')) {
              profileVisits.results += results;
              profileVisits.totalCost += investment;
            }
          }
          
          // MIGUEL - ThruPlay e Visitas ao Perfil
          else if (activeCompany === 'miguel') {
            if (resultType.includes('visitas ao perfil')) {
              profileVisits.results += results;
              profileVisits.totalCost += investment;
            }
            // ThruPlay não precisa mapear, impressões já vem pelo campo Impressões
          }
          
          // TREVO BARBEARIA - Conversas e Cliques no Link
          else if (activeCompany === 'trevo-barbearia') {
            if (resultType.includes('conversas por mensagem') || resultType.includes('conversas')) {
              purchases.results += results;
              purchases.totalCost += investment;
            }
            // "Cliques no link" = Visitas ao Perfil
            else if (resultType.includes('cliques no link') || resultType.includes('clique no link')) {
              profileVisits.results += results;
              profileVisits.totalCost += investment;
            }
          }
          
          // TREVO TABACARIA - Só Conversas
          else if (activeCompany === 'trevo-tabacaria') {
            if (resultType.includes('conversas por mensagem') || resultType.includes('conversas')) {
              purchases.results += results;
              purchases.totalCost += investment;
            }
          }
        });

        const purchasesMetric = {
          results: purchases.results,
          costPerResult: purchases.results > 0 ? purchases.totalCost / purchases.results : 0
        };
        
        const leadsMetric = {
          results: leads.results,
          costPerResult: leads.results > 0 ? leads.totalCost / leads.results : 0
        };
        
        const profileVisitsMetric = {
          results: profileVisits.results,
          costPerResult: profileVisits.results > 0 ? profileVisits.totalCost / profileVisits.results : 0
        };

        const companyName = companies.find(c => c.id === activeCompany)?.name || 'Empresa';

        console.log('Parsed data for', activeCompany, ':', {
          purchases: purchasesMetric,
          leads: leadsMetric,
          profileVisits: profileVisitsMetric,
          investment: totalInvestment,
          followers,
          impressions,
          period: { start: periodStart, end: periodEnd }
        });

        resolve({
          name: companyName,
          period: { start: periodStart, end: periodEnd },
          metrics: { 
            purchases: purchasesMetric, 
            leads: leadsMetric, 
            profileVisits: profileVisitsMetric 
          },
          investment: totalInvestment,
          followers,
          impressions,
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
