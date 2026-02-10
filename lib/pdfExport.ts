import jsPDF from 'jspdf';
import { CompanyData, Insights, formatCurrency, formatNumber } from '@/lib/utils';

interface ExportPDFParams {
  currentData: CompanyData;
  activeCompany: string;
  insights: Insights;
}

// Cores do tema
const COLORS = {
  primaryGreen: [125, 224, 141] as [number, number, number],
  darkBlue: [8, 21, 52] as [number, number, number],
  accentGreen: [89, 143, 116] as [number, number, number],
  lightGreen: [242, 252, 244] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  gray: [230, 232, 235] as [number, number, number],
};

// Configurações da página
const PAGE = {
  width: 210,
  height: 297,
  margin: 20,
  get contentWidth() { return this.width - (this.margin * 2); },
  footerHeight: 25,
  headerHeight: 45,
  safeBottom: 30, // Margem de segurança antes do footer
};

export const generatePDF = ({ currentData, activeCompany, insights }: ExportPDFParams): void => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  let yPosition = PAGE.margin;

  // ==================== PÁGINA 1 - MÉTRICAS ====================
  
  // HEADER
  renderHeader(pdf);
  yPosition = 60;

  // INFO DA EMPRESA
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(currentData.name, PAGE.margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.text(`Periodo: ${currentData.period.start} - ${currentData.period.end}`, PAGE.margin, yPosition);
  yPosition += 15;

  // CARD DE INVESTIMENTO TOTAL
  pdf.setFillColor(...COLORS.primaryGreen);
  pdf.roundedRect(PAGE.margin, yPosition, PAGE.contentWidth, 35, 4, 4, 'F');
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVESTIMENTO TOTAL', PAGE.margin + 10, yPosition + 12);
  pdf.setFontSize(28);
  pdf.text(formatCurrency(currentData.investment), PAGE.margin + 10, yPosition + 28);
  yPosition += 45;

  // CARD DE VISUALIZAÇÕES
  pdf.setFillColor(...COLORS.darkBlue);
  pdf.roundedRect(PAGE.margin, yPosition, PAGE.contentWidth, 30, 4, 4, 'F');
  pdf.setTextColor(200, 200, 200);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('VISUALIZACOES', PAGE.margin + 10, yPosition + 11);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Alcance total das suas campanhas', PAGE.margin + 10, yPosition + 17);
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatNumber(currentData.impressions), PAGE.margin + 10, yPosition + 26);
  yPosition += 40;

  // MÉTRICAS POR CLIENTE
  const cardWidth = (PAGE.contentWidth - 10) / 3;
  const cardHeight = 55;

  if (activeCompany === 'fagori') {
    yPosition = renderHoustonMetrics(pdf, currentData, yPosition, cardWidth, cardHeight);
  } else if (activeCompany === 'miguel') {
    yPosition = renderMiguelMetrics(pdf, currentData, yPosition, cardHeight);
  } else {
    yPosition = renderTrevoMetrics(pdf, currentData, activeCompany, yPosition, cardWidth, cardHeight);
  }

  // FOOTER da página 1
  renderFooter(pdf);

  // ==================== PÁGINA 2+ - INSIGHTS (DINÂMICO) ====================
  pdf.addPage();
  renderHeader(pdf);
  yPosition = 60;

  // TÍTULO
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analise e Proximos Passos', PAGE.margin, yPosition);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.text(currentData.name, PAGE.margin, yPosition + 8);
  yPosition += 25;

  // Renderizar cada insight de forma dinâmica
  const insightsData = [
    {
      title: 'PONTOS DE PROGRESSO',
      text: insights.progress || 'Nenhum ponto adicionado.',
      bgColor: COLORS.lightGreen,
      barColor: COLORS.primaryGreen,
      titleColor: COLORS.accentGreen,
    },
    {
      title: 'PONTOS POSITIVOS',
      text: insights.positives || 'Nenhum ponto adicionado.',
      bgColor: COLORS.gray,
      barColor: COLORS.darkBlue,
      titleColor: COLORS.darkBlue,
    },
    {
      title: 'FOCOS DO PROXIMO MES',
      text: insights.nextFocus || 'Nenhum foco adicionado.',
      bgColor: COLORS.white,
      barColor: COLORS.accentGreen,
      titleColor: COLORS.accentGreen,
      hasBorder: true,
    },
  ];

  for (const insight of insightsData) {
    yPosition = renderInsightCard(pdf, insight, yPosition);
  }

  // Footer da última página
  renderFooter(pdf);

  // SALVAR
  const fileName = `franca-relatorio-${currentData.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(fileName);
};

// ==================== RENDER INSIGHT CARD DINÂMICO ====================

interface InsightCardData {
  title: string;
  text: string;
  bgColor: [number, number, number];
  barColor: [number, number, number];
  titleColor: [number, number, number];
  hasBorder?: boolean;
}

function renderInsightCard(pdf: jsPDF, data: InsightCardData, startY: number): number {
  const lineHeight = 5;
  const titleHeight = 15;
  const paddingTop = 12;
  const paddingBottom = 10;
  const textStartOffset = 24;
  
  // Quebrar texto em linhas
  pdf.setFontSize(9);
  const textLines = pdf.splitTextToSize(data.text, PAGE.contentWidth - 20);
  
  // Calcular altura necessária para o card
  const textHeight = textLines.length * lineHeight;
  const cardHeight = titleHeight + textHeight + paddingBottom;
  
  let currentY = startY;
  
  // Verificar se cabe na página atual
  if (currentY + cardHeight > PAGE.height - PAGE.safeBottom) {
    // Criar nova página
    renderFooter(pdf);
    pdf.addPage();
    renderHeader(pdf);
    currentY = 60;
  }
  
  // Desenhar card
  if (data.hasBorder) {
    pdf.setFillColor(...data.bgColor);
    pdf.setDrawColor(...COLORS.gray);
    pdf.roundedRect(PAGE.margin, currentY, PAGE.contentWidth, cardHeight, 4, 4, 'FD');
  } else {
    pdf.setFillColor(...data.bgColor);
    pdf.roundedRect(PAGE.margin, currentY, PAGE.contentWidth, cardHeight, 4, 4, 'F');
  }
  
  // Barra lateral
  pdf.setFillColor(...data.barColor);
  pdf.rect(PAGE.margin, currentY, 4, cardHeight, 'F');
  
  // Título
  pdf.setTextColor(...data.titleColor);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.title, PAGE.margin + 10, currentY + paddingTop);
  
  // Texto (todas as linhas)
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(textLines, PAGE.margin + 10, currentY + textStartOffset);
  
  return currentY + cardHeight + 10;
}

// ==================== FUNÇÕES AUXILIARES ====================

function renderHeader(pdf: jsPDF): void {
  pdf.setFillColor(...COLORS.darkBlue);
  pdf.rect(0, 0, PAGE.width, 45, 'F');
  pdf.setFillColor(...COLORS.primaryGreen);
  pdf.rect(PAGE.margin, 15, 40, 4, 'F');
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatorio de Performance', PAGE.margin, 32);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Franca Assessoria - Dashboard de Campanhas', PAGE.margin, 40);
}

function renderFooter(pdf: jsPDF): void {
  pdf.setFillColor(...COLORS.darkBlue);
  pdf.rect(0, PAGE.height - 20, PAGE.width, 20, 'F');
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Franca Assessoria', PAGE.margin, PAGE.height - 10);
  pdf.setTextColor(...COLORS.primaryGreen);
  pdf.text('Vendendo mais para voce', PAGE.width - PAGE.margin - 45, PAGE.height - 10);
  pdf.setFillColor(...COLORS.primaryGreen);
  pdf.rect(0, PAGE.height - 22, PAGE.width, 2, 'F');
}

function renderHoustonMetrics(pdf: jsPDF, data: CompanyData, yPos: number, cardWidth: number, cardHeight: number): number {
  // Card 1 - Compras
  pdf.setFillColor(...COLORS.lightGreen);
  pdf.roundedRect(PAGE.margin, yPos, cardWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(...COLORS.primaryGreen);
  pdf.rect(PAGE.margin, yPos, cardWidth, 3, 'F');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('COMPRAS NO SITE', PAGE.margin + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Conversoes realizadas no site', PAGE.margin + 5, yPos + 17);
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(data.metrics.purchases.results), PAGE.margin + 5, yPos + 32);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.text(`Custo: ${formatCurrency(data.metrics.purchases.costPerResult)}`, PAGE.margin + 5, yPos + 42);

  // Card 2 - Leads
  const card2X = PAGE.margin + cardWidth + 5;
  pdf.setFillColor(...COLORS.lightGreen);
  pdf.roundedRect(card2X, yPos, cardWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(...COLORS.darkBlue);
  pdf.rect(card2X, yPos, cardWidth, 3, 'F');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LEADS GERADOS', card2X + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Leads captados no periodo', card2X + 5, yPos + 17);
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(data.metrics.leads.results), card2X + 5, yPos + 32);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.text(`Custo: ${formatCurrency(data.metrics.leads.costPerResult)}`, card2X + 5, yPos + 42);

  // Card 3 - Visitas
  const card3X = PAGE.margin + (cardWidth * 2) + 10;
  pdf.setFillColor(...COLORS.lightGreen);
  pdf.roundedRect(card3X, yPos, cardWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(...COLORS.accentGreen);
  pdf.rect(card3X, yPos, cardWidth, 3, 'F');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('VISITAS AO PERFIL', card3X + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Visitas ao perfil do Instagram', card3X + 5, yPos + 17);
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatNumber(data.metrics.profileVisits.results), card3X + 5, yPos + 32);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.text(`Custo: ${formatCurrency(data.metrics.profileVisits.costPerResult)}`, card3X + 5, yPos + 42);

  yPos += cardHeight + 10;

  // Card Seguidores
  pdf.setFillColor(...COLORS.lightGreen);
  pdf.roundedRect(PAGE.margin, yPos, PAGE.contentWidth, 30, 3, 3, 'F');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NOVOS SEGUIDORES', PAGE.margin + 10, yPos + 11);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Novos seguidores conquistados no periodo', PAGE.margin + 10, yPos + 16);
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`+${formatNumber(data.followers)}`, PAGE.margin + 10, yPos + 26);

  return yPos + 40;
}

function renderMiguelMetrics(pdf: jsPDF, data: CompanyData, yPos: number, cardHeight: number): number {
  const halfWidth = (PAGE.contentWidth - 5) / 2;

  // Card 1 - Seguidores
  pdf.setFillColor(...COLORS.lightGreen);
  pdf.roundedRect(PAGE.margin, yPos, halfWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(...COLORS.primaryGreen);
  pdf.rect(PAGE.margin, yPos, halfWidth, 3, 'F');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NOVOS SEGUIDORES', PAGE.margin + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Novos seguidores conquistados', PAGE.margin + 5, yPos + 17);
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`+${formatNumber(data.followers)}`, PAGE.margin + 5, yPos + 35);

  // Card 2 - Visitas
  const card2X = PAGE.margin + halfWidth + 5;
  pdf.setFillColor(...COLORS.lightGreen);
  pdf.roundedRect(card2X, yPos, halfWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(...COLORS.accentGreen);
  pdf.rect(card2X, yPos, halfWidth, 3, 'F');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('VISITAS AO PERFIL', card2X + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Visitas ao perfil do Instagram', card2X + 5, yPos + 17);
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatNumber(data.metrics.profileVisits.results), card2X + 5, yPos + 35);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.text(`Custo: ${formatCurrency(data.metrics.profileVisits.costPerResult)}`, card2X + 5, yPos + 45);

  return yPos + cardHeight + 10;
}

function renderTrevoMetrics(pdf: jsPDF, data: CompanyData, activeCompany: string, yPos: number, cardWidth: number, cardHeight: number): number {
  // Card 1 - Conversas
  pdf.setFillColor(...COLORS.lightGreen);
  pdf.roundedRect(PAGE.margin, yPos, cardWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(...COLORS.primaryGreen);
  pdf.rect(PAGE.margin, yPos, cardWidth, 3, 'F');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONVERSAS INICIADAS', PAGE.margin + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Conversas via mensagem', PAGE.margin + 5, yPos + 17);
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(data.metrics.purchases.results), PAGE.margin + 5, yPos + 32);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.text(`Custo: ${formatCurrency(data.metrics.purchases.costPerResult)}`, PAGE.margin + 5, yPos + 42);

  // Card 2 - Seguidores
  const card2X = PAGE.margin + cardWidth + 5;
  pdf.setFillColor(...COLORS.lightGreen);
  pdf.roundedRect(card2X, yPos, cardWidth, cardHeight, 3, 3, 'F');
  pdf.setFillColor(...COLORS.darkBlue);
  pdf.rect(card2X, yPos, cardWidth, 3, 'F');
  pdf.setTextColor(...COLORS.accentGreen);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NOVOS SEGUIDORES', card2X + 5, yPos + 12);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Novos seguidores conquistados', card2X + 5, yPos + 17);
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`+${formatNumber(data.followers)}`, card2X + 5, yPos + 35);

  // Card 3 - Visitas (só para Barbearia)
  if (activeCompany === 'trevo-barbearia') {
    const card3X = PAGE.margin + (cardWidth * 2) + 10;
    pdf.setFillColor(...COLORS.lightGreen);
    pdf.roundedRect(card3X, yPos, cardWidth, cardHeight, 3, 3, 'F');
    pdf.setFillColor(...COLORS.accentGreen);
    pdf.rect(card3X, yPos, cardWidth, 3, 'F');
    pdf.setTextColor(...COLORS.accentGreen);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VISITAS AO PERFIL', card3X + 5, yPos + 12);
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Visitas ao perfil do Instagram', card3X + 5, yPos + 17);
    pdf.setTextColor(...COLORS.darkBlue);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatNumber(data.metrics.profileVisits.results), card3X + 5, yPos + 32);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.accentGreen);
    pdf.text(`Custo: ${formatCurrency(data.metrics.profileVisits.costPerResult)}`, card3X + 5, yPos + 42);
  }

  return yPos + cardHeight + 10;
}
