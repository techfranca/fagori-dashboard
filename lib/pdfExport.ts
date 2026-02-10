import jsPDF from 'jspdf';
import { CompanyData, Insights, formatCurrency, formatNumber } from '@/lib/utils';

interface ExportPDFParams {
  currentData: CompanyData;
  activeCompany: string;
  insights: Insights;
}

export const generatePDF = ({ currentData, activeCompany, insights }: ExportPDFParams): void => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  const primaryGreen = [125, 224, 141];
  const darkBlue = [8, 21, 52];
  const accentGreen = [89, 143, 116];
  const lightGreen = [242, 252, 244];

  let yPosition = margin;

  // HEADER
  pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  pdf.rect(margin, 15, 40, 4, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório de Performance', margin, 32);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Franca Assessoria • Dashboard de Campanhas', margin, 40);

  yPosition = 60;

  // INFO DA EMPRESA
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(currentData.name, margin, yPosition);
  yPosition += 8;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.text(`Período: ${currentData.period.start} - ${currentData.period.end}`, margin, yPosition);
  yPosition += 15;

  // CARD DE INVESTIMENTO TOTAL
  pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  pdf.roundedRect(margin, yPosition, contentWidth, 35, 4, 4, 'F');
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVESTIMENTO TOTAL', margin + 10, yPosition + 12);
  pdf.setFontSize(28);
  pdf.text(formatCurrency(currentData.investment), margin + 10, yPosition + 28);
  yPosition += 45;

  // CARD DE VISUALIZAÇÕES (sempre presente)
  pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.roundedRect(margin, yPosition, contentWidth, 30, 4, 4, 'F');
  pdf.setTextColor(200, 200, 200);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('VISUALIZAÇÕES', margin + 10, yPosition + 11);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Alcance total das suas campanhas', margin + 10, yPosition + 17);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatNumber(currentData.impressions), margin + 10, yPosition + 26);
  yPosition += 40;

  // MÉTRICAS - CUSTOMIZADO POR CLIENTE
  const cardWidth = (contentWidth - 10) / 3;
  const cardHeight = 55;

  if (activeCompany === 'houston') {
    yPosition = renderHoustonMetrics(pdf, currentData, margin, yPosition, cardWidth, cardHeight, contentWidth, primaryGreen, darkBlue, accentGreen, lightGreen);
  } else if (activeCompany === 'miguel') {
    yPosition = renderMiguelMetrics(pdf, currentData, margin, yPosition, cardHeight, contentWidth, primaryGreen, darkBlue, accentGreen, lightGreen);
  } else {
    yPosition = renderTrevoMetrics(pdf, currentData, activeCompany, margin, yPosition, cardWidth, cardHeight, primaryGreen, darkBlue, accentGreen, lightGreen);
  }

  // INSIGHTS
  yPosition = renderInsights(pdf, insights, margin, yPosition, contentWidth, primaryGreen, darkBlue, accentGreen, lightGreen);

  // FOOTER
  renderFooter(pdf, pageWidth, pageHeight, margin, primaryGreen, darkBlue);

  // SALVAR
  const fileName = `franca-relatorio-${currentData.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(fileName);
};

// Render Houston metrics
function renderHoustonMetrics(
  pdf: jsPDF, 
  data: CompanyData, 
  margin: number, 
  yPos: number, 
  cardWidth: number, 
  cardHeight: number, 
  contentWidth: number,
  primaryGreen: number[], 
  darkBlue: number[], 
  accentGreen: number[], 
  lightGreen: number[]
): number {
  // Card 1 - Compras
  pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  pdf.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  pdf.rect(margin, yPos, cardWidth, 3, 'F');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('COMPRAS NO SITE', margin + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Conversões realizadas no site', margin + 5, yPos + 17);
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(data.metrics.purchases.results), margin + 5, yPos + 32);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.text(`Custo: ${formatCurrency(data.metrics.purchases.costPerResult)}`, margin + 5, yPos + 42);

  // Card 2 - Leads
  const card2X = margin + cardWidth + 5;
  pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  pdf.roundedRect(card2X, yPos, cardWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.rect(card2X, yPos, cardWidth, 3, 'F');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LEADS GERADOS', card2X + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Leads captados no período', card2X + 5, yPos + 17);
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(data.metrics.leads.results), card2X + 5, yPos + 32);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.text(`Custo: ${formatCurrency(data.metrics.leads.costPerResult)}`, card2X + 5, yPos + 42);

  // Card 3 - Visitas
  const card3X = margin + (cardWidth * 2) + 10;
  pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  pdf.roundedRect(card3X, yPos, cardWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.rect(card3X, yPos, cardWidth, 3, 'F');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('VISITAS AO PERFIL', card3X + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Visitas ao perfil do Instagram', card3X + 5, yPos + 17);
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatNumber(data.metrics.profileVisits.results), card3X + 5, yPos + 32);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.text(`Custo: ${formatCurrency(data.metrics.profileVisits.costPerResult)}`, card3X + 5, yPos + 42);

  yPos += cardHeight + 10;

  // Card Seguidores
  pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  pdf.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NOVOS SEGUIDORES', margin + 10, yPos + 11);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Novos seguidores conquistados no período', margin + 10, yPos + 16);
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`+${formatNumber(data.followers)}`, margin + 10, yPos + 26);

  return yPos + 40;
}

// Render Miguel metrics
function renderMiguelMetrics(
  pdf: jsPDF, 
  data: CompanyData, 
  margin: number, 
  yPos: number, 
  cardHeight: number, 
  contentWidth: number,
  primaryGreen: number[], 
  darkBlue: number[], 
  accentGreen: number[], 
  lightGreen: number[]
): number {
  const halfWidth = (contentWidth - 5) / 2;

  // Card 1 - Seguidores
  pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  pdf.roundedRect(margin, yPos, halfWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  pdf.rect(margin, yPos, halfWidth, 3, 'F');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NOVOS SEGUIDORES', margin + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Novos seguidores conquistados', margin + 5, yPos + 17);
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`+${formatNumber(data.followers)}`, margin + 5, yPos + 35);

  // Card 2 - Visitas
  const card2X = margin + halfWidth + 5;
  pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  pdf.roundedRect(card2X, yPos, halfWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.rect(card2X, yPos, halfWidth, 3, 'F');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('VISITAS AO PERFIL', card2X + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Visitas ao perfil do Instagram', card2X + 5, yPos + 17);
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatNumber(data.metrics.profileVisits.results), card2X + 5, yPos + 35);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.text(`Custo: ${formatCurrency(data.metrics.profileVisits.costPerResult)}`, card2X + 5, yPos + 45);

  return yPos + cardHeight + 10;
}

// Render Trevo metrics (Barbearia e Tabacaria)
function renderTrevoMetrics(
  pdf: jsPDF, 
  data: CompanyData, 
  activeCompany: string,
  margin: number, 
  yPos: number, 
  cardWidth: number, 
  cardHeight: number,
  primaryGreen: number[], 
  darkBlue: number[], 
  accentGreen: number[], 
  lightGreen: number[]
): number {
  // Card 1 - Conversas
  pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  pdf.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  pdf.rect(margin, yPos, cardWidth, 3, 'F');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONVERSAS INICIADAS', margin + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Conversas via mensagem', margin + 5, yPos + 17);
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(data.metrics.purchases.results), margin + 5, yPos + 32);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.text(`Custo: ${formatCurrency(data.metrics.purchases.costPerResult)}`, margin + 5, yPos + 42);

  // Card 2 - Seguidores
  const card2X = margin + cardWidth + 5;
  pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  pdf.roundedRect(card2X, yPos, cardWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.rect(card2X, yPos, cardWidth, 3, 'F');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NOVOS SEGUIDORES', card2X + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Novos seguidores conquistados', card2X + 5, yPos + 17);
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`+${formatNumber(data.followers)}`, card2X + 5, yPos + 35);

  // Card 3 - Visitas (só para Barbearia)
  if (activeCompany === 'trevo-barbearia') {
    const card3X = margin + (cardWidth * 2) + 10;
    pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
    pdf.roundedRect(card3X, yPos, cardWidth, cardHeight, 3, 3, 'F');
    pdf.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    pdf.rect(card3X, yPos, cardWidth, 3, 'F');
    pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VISITAS AO PERFIL', card3X + 5, yPos + 12);
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Visitas ao perfil do Instagram', card3X + 5, yPos + 17);
    pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatNumber(data.metrics.profileVisits.results), card3X + 5, yPos + 32);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    pdf.text(`Custo: ${formatCurrency(data.metrics.profileVisits.costPerResult)}`, card3X + 5, yPos + 42);
  }

  return yPos + cardHeight + 10;
}

// Render Insights section
function renderInsights(
  pdf: jsPDF, 
  insights: Insights, 
  margin: number, 
  yPos: number, 
  contentWidth: number,
  primaryGreen: number[], 
  darkBlue: number[], 
  accentGreen: number[], 
  lightGreen: number[]
): number {
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Análise e Próximos Passos', margin, yPos);
  yPos += 10;

  const insightCardWidth = (contentWidth - 10) / 3;
  const insightCardHeight = 45;

  // Progresso
  pdf.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
  pdf.roundedRect(margin, yPos, insightCardWidth, insightCardHeight, 3, 3, 'F');
  pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  pdf.rect(margin, yPos, 3, insightCardHeight, 'F');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PONTOS DE PROGRESSO', margin + 6, yPos + 8);
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const progressText = insights.progress || 'Nenhum ponto adicionado.';
  const progressLines = pdf.splitTextToSize(progressText, insightCardWidth - 10);
  pdf.text(progressLines.slice(0, 4), margin + 6, yPos + 16);

  // Positivos
  const insight2X = margin + insightCardWidth + 5;
  pdf.setFillColor(230, 232, 235);
  pdf.roundedRect(insight2X, yPos, insightCardWidth, insightCardHeight, 3, 3, 'F');
  pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.rect(insight2X, yPos, 3, insightCardHeight, 'F');
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PONTOS POSITIVOS', insight2X + 6, yPos + 8);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const positivesText = insights.positives || 'Nenhum ponto adicionado.';
  const positivesLines = pdf.splitTextToSize(positivesText, insightCardWidth - 10);
  pdf.text(positivesLines.slice(0, 4), insight2X + 6, yPos + 16);

  // Focos
  const insight3X = margin + (insightCardWidth * 2) + 10;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(230, 232, 235);
  pdf.roundedRect(insight3X, yPos, insightCardWidth, insightCardHeight, 3, 3, 'FD');
  pdf.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.rect(insight3X, yPos, 3, insightCardHeight, 'F');
  pdf.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FOCOS DO PRÓXIMO MÊS', insight3X + 6, yPos + 8);
  pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const focusText = insights.nextFocus || 'Nenhum foco adicionado.';
  const focusLines = pdf.splitTextToSize(focusText, insightCardWidth - 10);
  pdf.text(focusLines.slice(0, 4), insight3X + 6, yPos + 16);

  return yPos + insightCardHeight + 10;
}

// Render Footer
function renderFooter(
  pdf: jsPDF, 
  pageWidth: number, 
  pageHeight: number, 
  margin: number,
  primaryGreen: number[], 
  darkBlue: number[]
): void {
  pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Franca Assessoria', margin, pageHeight - 10);
  pdf.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  pdf.text('Vendendo mais para você', pageWidth - margin - 45, pageHeight - 10);
  pdf.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  pdf.rect(0, pageHeight - 22, pageWidth, 2, 'F');
}
