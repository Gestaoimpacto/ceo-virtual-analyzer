import { jsPDF } from 'jspdf';
import { AnalysisResult, CompanyData } from '@/types/company';
import { formatCurrency, formatPercent } from './excelParser';

export async function generatePDF(
  analysis: AnalysisResult,
  company: CompanyData
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Helper functions
  const addPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (height: number) => {
    if (yPos + height > pageHeight - margin) {
      addPage();
    }
  };

  const drawLine = (y: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
  };

  const getStatusColor = (status: string): [number, number, number] => {
    switch (status) {
      case 'excelente': return [34, 197, 94];
      case 'adequado': return [59, 130, 246];
      case 'atencao': return [251, 191, 36];
      case 'critico': return [239, 68, 68];
      default: return [100, 100, 100];
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'excelente': return 'Excelente';
      case 'adequado': return 'Adequado';
      case 'atencao': return 'Atenção';
      case 'critico': return 'Crítico';
      default: return status;
    }
  };

  // ===== CAPA =====
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('CEO DO GI', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Relatório de Análise Empresarial', pageWidth / 2, 75, { align: 'center' });

  // Nome da empresa
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(analysis.empresa, pageWidth / 2, 120, { align: 'center' });

  // Informações
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Setor: ${analysis.setor}`, pageWidth / 2, 135, { align: 'center' });
  doc.text(`Cidade: ${analysis.cidade}`, pageWidth / 2, 145, { align: 'center' });
  doc.text(`Data da Análise: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 155, { align: 'center' });

  // Score Geral
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth / 2 - 40, 175, 80, 60, 5, 5, 'F');

  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  const scoreColor = analysis.scoreGeral >= 70 ? [34, 197, 94] : analysis.scoreGeral >= 50 ? [251, 191, 36] : [239, 68, 68];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(String(analysis.scoreGeral), pageWidth / 2, 205, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Score Geral de Maturidade', pageWidth / 2, 225, { align: 'center' });

  // Rodapé da capa
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Gestão de Impacto - Análise Empresarial Inteligente', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // ===== PÁGINA 2: VISÃO GERAL =====
  addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Visão Geral dos Scores', margin, yPos);
  yPos += 15;

  drawLine(yPos);
  yPos += 10;

  // Scores por área
  const scores = [
    { area: 'Finanças', score: analysis.scoreFinanceiro },
    { area: 'Comercial', score: analysis.scoreComercial },
    { area: 'Operações', score: analysis.scoreOperacional },
    { area: 'Pessoas', score: analysis.scorePessoas },
    { area: 'Tecnologia', score: analysis.scoreTecnologia },
  ];

  scores.forEach((item) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(item.area, margin, yPos);

    // Barra de progresso
    const barWidth = 100;
    const barHeight = 8;
    const barX = margin + 50;

    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, yPos - 6, barWidth, barHeight, 2, 2, 'F');

    const fillWidth = (item.score / 100) * barWidth;
    const color = item.score >= 70 ? [34, 197, 94] : item.score >= 50 ? [251, 191, 36] : [239, 68, 68];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(barX, yPos - 6, fillWidth, barHeight, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.score}`, barX + barWidth + 10, yPos);

    yPos += 15;
  });

  yPos += 10;

  // ===== COMPARAÇÃO COM BENCHMARKS =====
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Comparação com Benchmarks do Setor', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Setor de referência: ${analysis.benchmarks.setor}`, margin, yPos);
  yPos += 10;

  drawLine(yPos);
  yPos += 10;

  // Tabela de benchmarks
  const benchmarkData = [
    { metrica: 'Margem de Lucro Líquido', empresa: formatPercent(company.lucroLiquido6MesesPercent), benchmark: formatPercent(analysis.benchmarks.margemLucroMedia) },
    { metrica: 'Ticket Médio', empresa: formatCurrency(company.ticketMedio), benchmark: formatCurrency(analysis.benchmarks.ticketMedioMercado) },
    { metrica: 'Taxa de Conversão', empresa: formatPercent(company.taxaConversaoGeral), benchmark: formatPercent(analysis.benchmarks.taxaConversaoMedia) },
    { metrica: 'NPS', empresa: String(company.nps), benchmark: String(analysis.benchmarks.npsReferencia) },
    { metrica: 'Turnover (12 meses)', empresa: formatPercent(company.turnover12Meses), benchmark: formatPercent(analysis.benchmarks.turnoverMedio) },
    { metrica: 'Ciclo de Vendas', empresa: `${company.cicloMedioVendas} dias`, benchmark: `${analysis.benchmarks.cicloVendasMedio} dias` },
  ];

  // Cabeçalho da tabela
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPos - 5, contentWidth, 10, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Métrica', margin + 5, yPos);
  doc.text('Sua Empresa', margin + 80, yPos);
  doc.text('Benchmark', margin + 130, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  benchmarkData.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    }
    doc.setTextColor(51, 65, 85);
    doc.text(row.metrica, margin + 5, yPos);
    doc.text(row.empresa, margin + 80, yPos);
    doc.text(row.benchmark, margin + 130, yPos);
    yPos += 10;
  });

  // ===== PÁGINA 3: DIAGNÓSTICOS =====
  addPage();
  yPos = margin;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Diagnóstico por Área', margin, yPos);
  yPos += 15;

  drawLine(yPos);
  yPos += 10;

  const diagnosticos = [
    { title: 'Finanças e Lucratividade', data: analysis.diagnosticoFinanceiro },
    { title: 'Comercial e Marketing', data: analysis.diagnosticoComercial },
    { title: 'Estratégia e Operações', data: analysis.diagnosticoOperacional },
    { title: 'Pessoas e Liderança', data: analysis.diagnosticoPessoas },
    { title: 'Tecnologia e Dados', data: analysis.diagnosticoTecnologia },
  ];

  diagnosticos.forEach((diag) => {
    checkPageBreak(60);

    // Título da área
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(diag.title, margin, yPos);

    // Status badge
    const statusColor = getStatusColor(diag.data.status);
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(margin + 80, yPos - 5, 25, 7, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(getStatusLabel(diag.data.status), margin + 82, yPos - 1);

    yPos += 10;

    // Pontos Fortes
    if (diag.data.pontosFortesText.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text('Pontos Fortes:', margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      diag.data.pontosFortesText.forEach((ponto) => {
        checkPageBreak(10);
        const lines = doc.splitTextToSize(`• ${ponto}`, contentWidth - 10);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5;
      });
      yPos += 3;
    }

    // Pontos de Atenção
    if (diag.data.pontosAtencaoText.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(251, 191, 36);
      doc.text('Pontos de Atenção:', margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      diag.data.pontosAtencaoText.forEach((ponto) => {
        checkPageBreak(10);
        const lines = doc.splitTextToSize(`• ${ponto}`, contentWidth - 10);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5;
      });
      yPos += 3;
    }

    // Oportunidades
    if (diag.data.oportunidades.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('Oportunidades:', margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      diag.data.oportunidades.forEach((op) => {
        checkPageBreak(10);
        const lines = doc.splitTextToSize(`• ${op}`, contentWidth - 10);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5;
      });
    }

    yPos += 10;
    drawLine(yPos);
    yPos += 10;
  });

  // ===== PÁGINA: RECOMENDAÇÕES =====
  addPage();
  yPos = margin;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Recomendações Priorizadas', margin, yPos);
  yPos += 15;

  drawLine(yPos);
  yPos += 10;

  analysis.recomendacoesPrioritarias.forEach((rec, index) => {
    checkPageBreak(50);

    // Número e título
    doc.setFillColor(59, 130, 246);
    doc.circle(margin + 5, yPos - 2, 5, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(String(index + 1), margin + 3.5, yPos);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(rec.titulo, margin + 15, yPos);
    yPos += 8;

    // Tags
    const prioridadeColors: Record<string, [number, number, number]> = {
      alta: [239, 68, 68],
      media: [251, 191, 36],
      baixa: [34, 197, 94],
    };
    const prioridadeLabels: Record<string, string> = {
      alta: 'Alta Prioridade',
      media: 'Média Prioridade',
      baixa: 'Baixa Prioridade',
    };

    doc.setFontSize(8);
    doc.setFillColor(...prioridadeColors[rec.prioridade]);
    doc.roundedRect(margin + 15, yPos - 4, 25, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(prioridadeLabels[rec.prioridade], margin + 17, yPos - 1);

    yPos += 8;

    // Descrição
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(rec.descricao, contentWidth - 15);
    doc.text(descLines, margin + 15, yPos);
    yPos += descLines.length * 5 + 5;

    // Detalhes
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Impacto: ${rec.impactoEsperado}`, margin + 15, yPos);
    yPos += 5;
    doc.text(`Prazo: ${rec.prazoSugerido}`, margin + 15, yPos);
    yPos += 5;
    doc.text(`Recursos: ${rec.recursos}`, margin + 15, yPos);

    yPos += 15;
  });

  // ===== PÁGINA: PLANO DE AÇÃO =====
  addPage();
  yPos = margin;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Plano de Ação - 90 Dias', margin, yPos);
  yPos += 15;

  drawLine(yPos);
  yPos += 10;

  analysis.planoAcao90Dias.forEach((semana) => {
    checkPageBreak(40);

    // Semana
    doc.setFillColor(59, 130, 246);
    doc.circle(margin + 5, yPos, 8, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`S${semana.semana}`, margin + 2, yPos + 3);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Semana ${semana.semana}`, margin + 20, yPos + 3);
    yPos += 12;

    // Ações
    semana.acoes.forEach((acao) => {
      checkPageBreak(20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      const acaoLines = doc.splitTextToSize(`✓ ${acao.acao}`, contentWidth - 25);
      doc.text(acaoLines, margin + 20, yPos);
      yPos += acaoLines.length * 5;

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Responsável: ${acao.responsavel} | Entregável: ${acao.entregavel}`, margin + 25, yPos);
      yPos += 8;
    });

    yPos += 5;
  });

  // ===== PÁGINA FINAL: METODOLOGIA =====
  addPage();
  yPos = margin;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Metodologia de Análise', margin, yPos);
  yPos += 15;

  drawLine(yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Base das Comparações (Benchmarks)', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const metodologia = [
    'Os benchmarks utilizados são baseados em médias de mercado por setor, compilados a partir de:',
    '',
    '• Dados do IBGE e SEBRAE sobre micro, pequenas e médias empresas',
    '• Pesquisas setoriais de associações comerciais e industriais',
    '• Médias de mercado de consultorias especializadas',
    '• Indicadores de performance de empresas do mesmo porte e segmento',
    '',
    'Cálculo dos Scores:',
    '',
    '• Score Financeiro: Avalia margem de lucro, relação LTV/CAC, inadimplência e endividamento',
    '• Score Comercial: Considera ticket médio, taxa de conversão, NPS e ciclo de vendas',
    '• Score Operacional: Analisa estrutura organizacional, rituais de gestão e metas',
    '• Score de Pessoas: Mede turnover, absenteísmo e mapeamento de perfis',
    '• Score de Tecnologia: Avalia uso de CRM, dashboards, IA e integrações',
    '',
    'O Score Geral é uma média ponderada dos scores por área, com pesos ajustados',
    'conforme a relevância de cada dimensão para o setor da empresa.',
  ];

  metodologia.forEach((line) => {
    const lines = doc.splitTextToSize(line, contentWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 5;
  });

  yPos += 15;

  // Rodapé
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Relatório gerado automaticamente pelo CEO DO GI', margin, pageHeight - 30);
  doc.text('Gestão de Impacto - Análise Empresarial Inteligente', margin, pageHeight - 25);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, pageHeight - 20);

  // Salvar PDF
  doc.save(`Relatorio_CEO_GI_${analysis.empresa.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
