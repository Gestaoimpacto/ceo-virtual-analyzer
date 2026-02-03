import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Upload, 
  BarChart3, 
  Target, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Cpu,
  Sparkles,
  Download,
  RefreshCw,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { CompanyForm } from '@/components/CompanyForm';
import { ScoreGauge } from '@/components/ScoreGauge';
import { DiagnosticCard } from '@/components/DiagnosticCard';
import { RecommendationCard } from '@/components/RecommendationCard';
import { ExpandedRecommendation } from '@/components/ExpandedRecommendation';
import { ActionPlanTimeline } from '@/components/ActionPlanTimeline';
import { AdvancedActionPlan } from '@/components/AdvancedActionPlan';
import { RadarChart } from '@/components/RadarChart';
import { BenchmarkComparison } from '@/components/BenchmarkComparison';
import { CompanyData, AnalysisResult } from '@/types/company';
import { mapRowToCompanyData } from '@/lib/excelParser';
import { analyzeCompany } from '@/lib/analysisEngine';
import { analyzeCompanyAdvanced } from '@/lib/advancedAnalysisEngine';
import { generatePDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// Image URLs
const HERO_BG = "https://private-us-east-1.manuscdn.com/sessionFile/mpFmyPTrXnWmKetPsq4txv/sandbox/YYCdgAnwDYJJz8Rhjoq5pe-img-1_1770081648000_na1fn_Y2VvLWhlcm8tYmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvbXBGbXlQVHJYbldtS2V0UHNxNHR4di9zYW5kYm94L1lZQ2RnQW53RFlKSno4Umhqb3E1cGUtaW1nLTFfMTc3MDA4MTY0ODAwMF9uYTFmbl9ZMlZ2TFdobGNtOHRZbWMucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=u0IO4XL3~9yt5jxgdDukhv3jOw6V49OUVU4q9SmShzdNemXetbGSDmD7vv66Sn4dYeaHBYHgTD08e1~wZWdrxa~B0hVAV-LePh6rbIfvWGHv-y0nMN0BilH0JpeCWtQEygNij~z6ftrlo8-qrfHkeUv62U8GCM1ld4pRS0ThcgN~~Dcq~9PEAJJNnMdZ9p7~RAFx6ojhSpwxnOuLITg53jC-clOUf2bsOMsYfR3QRDCd2JhZmQQvtXoBSt44VvDfktmJXnRCWVdrfySDNcgqCbZrzHXVNkO2BA8~CO8dBippJUl5tCo0PJ4-luBPpLa7Fbe110xtCi21FJXKkNAXLQ__";
const ANALYSIS_ICON = "https://private-us-east-1.manuscdn.com/sessionFile/mpFmyPTrXnWmKetPsq4txv/sandbox/YYCdgAnwDYJJz8Rhjoq5pe-img-2_1770081644000_na1fn_Y2VvLWFuYWx5c2lzLWljb24.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvbXBGbXlQVHJYbldtS2V0UHNxNHR4di9zYW5kYm94L1lZQ2RnQW53RFlKSno4Umhqb3E1cGUtaW1nLTJfMTc3MDA4MTY0NDAwMF9uYTFmbl9ZMlZ2TFdGdVlXeDVjMmx6TFdsamIyNC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=p4ubG5dphv4SRdfaCMOL9tQlLIqF1LfFdPbVLjBhdb8-pbkicB7FWRe3n4FSJJS9Hfl9YtpotiKMd8xkaogSt5pt0irgfcKACjvLsTInfRLW5U3RPXu-ok6at0NczwmWPtibr8xZ-rwA-VB~rbrR5QdCootXja2Woe3VLYW2rgP8oTUKOI4h~P0Ff0NVeU6VxY8Spt5kgb25lWWncShokKSQXJMF7FvBUWJxlO9ujU1iUmSUIsBuUL409mxcoKX4QQPODOzIyhVYi-m2NWYpkmQSXoxqBSbSjcfAnp-bUdXsg8Zu3xzNIK9P5AbDL3-TO6Y5tZZuI7rr~Gft7B5QEg__";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [inputMode, setInputMode] = useState<'form' | 'upload'>('form');

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Read file using XLSX library
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      
      if (jsonData.length < 2) {
        throw new Error('O arquivo não contém dados. Por favor, preencha os dados da empresa.');
      }
      
      // Get data row (skip header)
      const dataRow = jsonData[1];
      
      if (!dataRow || dataRow.length === 0) {
        throw new Error('Nenhum dado encontrado no arquivo. Por favor, preencha os dados da empresa.');
      }
      
      // Map to company data
      const company = mapRowToCompanyData(dataRow.map(v => String(v || '')));
      
      if (!company.empresa) {
        throw new Error('Nome da empresa não encontrado. Verifique se o arquivo está no formato correto.');
      }
      
      setCompanyData(company);
      
      // Run advanced analysis with detailed tactics
      const analysis = analyzeCompanyAdvanced(company);
      setAnalysisResult(analysis);
      
      toast.success('Análise concluída com sucesso!', {
        description: `Empresa: ${company.empresa}`,
      });
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar arquivo';
      setError(message);
      toast.error('Erro ao processar arquivo', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setCompanyData(null);
    setAnalysisResult(null);
    setError(null);
    setActiveTab('overview');
  };

  const radarData = analysisResult ? [
    { area: 'Finanças', score: analysisResult.scoreFinanceiro, fullMark: 100 },
    { area: 'Comercial', score: analysisResult.scoreComercial, fullMark: 100 },
    { area: 'Operações', score: analysisResult.scoreOperacional, fullMark: 100 },
    { area: 'Pessoas', score: analysisResult.scorePessoas, fullMark: 100 },
    { area: 'Tecnologia', score: analysisResult.scoreTecnologia, fullMark: 100 },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src={HERO_BG} 
            alt="" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        {/* Content */}
        <div className="relative container py-12 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo/Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center glow-blue">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold text-foreground mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              CEO DO GI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Análise empresarial completa com inteligência artificial.
              <br />
              Diagnóstico, benchmarks e plano de ação personalizado.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mb-10"
            >
              {[
                { icon: <DollarSign className="w-4 h-4" />, label: 'Finanças' },
                { icon: <TrendingUp className="w-4 h-4" />, label: 'Marketing' },
                { icon: <Target className="w-4 h-4" />, label: 'Vendas' },
                { icon: <Users className="w-4 h-4" />, label: 'Gestão de Pessoas' },
                { icon: <Cpu className="w-4 h-4" />, label: 'Tecnologia' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50"
                >
                  <span className="text-primary">{item.icon}</span>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container pb-20">
        <AnimatePresence mode="wait">
          {!analysisResult ? (
            /* Input Section - Form or Upload */
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Mode Toggle */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm p-1">
                  <button
                    onClick={() => setInputMode('form')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      inputMode === 'form'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Preencher Formulário
                  </button>
                  <button
                    onClick={() => setInputMode('upload')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      inputMode === 'upload'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Upload de Arquivo
                  </button>
                </div>
              </div>

              {inputMode === 'form' ? (
                /* Form Mode */
                <CompanyForm
                  onSubmit={(data) => {
                    setIsLoading(true);
                    setCompanyData(data);
                    const analysis = analyzeCompanyAdvanced(data);
                    setAnalysisResult(analysis);
                    setIsLoading(false);
                    toast.success('Análise concluída com sucesso!', {
                      description: `Empresa: ${data.empresa}`,
                    });
                  }}
                  isLoading={isLoading}
                />
              ) : (
                /* Upload Mode */
                <div className="max-w-2xl mx-auto">
                  <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-8">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                        Faça upload do arquivo
                      </h2>
                      <p className="text-muted-foreground">
                        Envie o arquivo Excel com os dados da empresa para iniciar a análise
                      </p>
                    </div>

                    <FileUpload
                      onFileSelect={handleFileSelect}
                      isLoading={isLoading}
                      error={error}
                    />

                    {/* Instructions */}
                    <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/30">
                      <h3 className="text-sm font-medium text-foreground mb-2">Instruções:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• O arquivo deve estar no formato .xlsx ou .csv</li>
                        <li>• A primeira linha deve conter os cabeçalhos</li>
                        <li>• Os dados da empresa devem estar na segunda linha</li>
                        <li>• Preencha o máximo de campos possível para uma análise completa</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* Analysis Results */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Company Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                      {analysisResult.empresa}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {analysisResult.setor}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {analysisResult.cidade}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Análise: {new Date().toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Nova Análise
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={async () => {
                      if (analysisResult && companyData) {
                        try {
                          toast.info('Gerando PDF...');
                          await generatePDF(analysisResult, companyData);
                          toast.success('PDF gerado com sucesso!');
                        } catch (err) {
                          toast.error('Erro ao gerar PDF');
                        }
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-card/30 border border-border/50 p-1 rounded-xl overflow-x-auto">
                  <TabsTrigger value="overview" className="rounded-lg">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger value="diagnostics" className="rounded-lg">
                    <Target className="w-4 h-4 mr-2" />
                    Diagnóstico
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="rounded-lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Recomendações
                  </TabsTrigger>
                  <TabsTrigger value="action-plan" className="rounded-lg">
                    <Settings className="w-4 h-4 mr-2" />
                    Plano de Ação
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-6">
                  <div className="grid gap-6 lg:grid-cols-12">
                    {/* Score Geral */}
                    <div className="lg:col-span-4 p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-foreground mb-6 text-center" style={{ fontFamily: 'var(--font-display)' }}>
                        Score Geral
                      </h3>
                      <div className="flex justify-center">
                        <ScoreGauge score={analysisResult.scoreGeral} label="Maturidade Empresarial" size="lg" />
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        {analysisResult.scoreGeral >= 80 && "Excelente! Empresa com alta maturidade gerencial."}
                        {analysisResult.scoreGeral >= 60 && analysisResult.scoreGeral < 80 && "Bom desempenho com oportunidades de melhoria."}
                        {analysisResult.scoreGeral >= 40 && analysisResult.scoreGeral < 60 && "Atenção necessária em algumas áreas."}
                        {analysisResult.scoreGeral < 40 && "Ação urgente recomendada para melhorias."}
                      </p>
                    </div>

                    {/* Radar Chart */}
                    <div className="lg:col-span-4 p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-foreground mb-4 text-center" style={{ fontFamily: 'var(--font-display)' }}>
                        Análise por Área
                      </h3>
                      <RadarChart data={radarData} />
                    </div>

                    {/* Scores por Área */}
                    <div className="lg:col-span-4 p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-foreground mb-6 text-center" style={{ fontFamily: 'var(--font-display)' }}>
                        Scores por Área
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <ScoreGauge score={analysisResult.scoreFinanceiro} label="Finanças" size="sm" />
                        <ScoreGauge score={analysisResult.scoreComercial} label="Comercial" size="sm" />
                        <ScoreGauge score={analysisResult.scoreOperacional} label="Operações" size="sm" />
                        <ScoreGauge score={analysisResult.scorePessoas} label="Pessoas" size="sm" />
                        <div className="col-span-2 flex justify-center">
                          <ScoreGauge score={analysisResult.scoreTecnologia} label="Tecnologia" size="sm" />
                        </div>
                      </div>
                    </div>

                    {/* Benchmark Comparison */}
                    <div className="lg:col-span-12 p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                      {companyData && (
                        <BenchmarkComparison 
                          company={companyData} 
                          benchmark={analysisResult.benchmarks} 
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Diagnostics Tab */}
                <TabsContent value="diagnostics" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <DiagnosticCard
                      diagnostic={analysisResult.diagnosticoFinanceiro}
                      icon={<DollarSign className="w-5 h-5" />}
                      delay={0}
                    />
                    <DiagnosticCard
                      diagnostic={analysisResult.diagnosticoComercial}
                      icon={<TrendingUp className="w-5 h-5" />}
                      delay={1}
                    />
                    <DiagnosticCard
                      diagnostic={analysisResult.diagnosticoOperacional}
                      icon={<Settings className="w-5 h-5" />}
                      delay={2}
                    />
                    <DiagnosticCard
                      diagnostic={analysisResult.diagnosticoPessoas}
                      icon={<Users className="w-5 h-5" />}
                      delay={3}
                    />
                    <DiagnosticCard
                      diagnostic={analysisResult.diagnosticoTecnologia}
                      icon={<Cpu className="w-5 h-5" />}
                      delay={4}
                    />
                  </div>
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <img src={ANALYSIS_ICON} alt="" className="w-12 h-12 rounded-lg" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                          Recomendações Priorizadas
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Ações estratégicas ordenadas por impacto e urgência
                        </p>
                      </div>
                    </div>
                    {analysisResult.recomendacoesPrioritarias.map((rec, index) => (
                      <ExpandedRecommendation key={rec.id} recommendation={rec} index={index} />
                    ))}
                  </div>
                </TabsContent>

                {/* Action Plan Tab */}
                <TabsContent value="action-plan" className="mt-6">
                  <div className="p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                          Plano de Ação - 90 Dias
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Cronograma detalhado com ações, responsáveis e entregáveis
                        </p>
                      </div>
                    </div>
                    <AdvancedActionPlan plano={analysisResult.planoAcao90Dias} />
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">CEO Virtual</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Análise empresarial inteligente para tomada de decisão estratégica
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
