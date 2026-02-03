import { useState } from 'react';
import { CompanyData } from '@/types/company';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  Users, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Megaphone,
  UserCog,
  Cpu,
  ClipboardCheck,
  CheckCircle2
} from 'lucide-react';

interface CompanyFormProps {
  onSubmit: (data: CompanyData) => void;
  isLoading?: boolean;
}

const SETORES = [
  'Tecnologia',
  'Varejo',
  'Serviços',
  'Indústria',
  'Saúde',
  'Educação',
  'Alimentação',
  'Construção',
  'Agronegócio',
  'Financeiro',
  'Consultoria',
  'E-commerce',
  'Outro'
];

const STEPS = [
  { id: 1, title: 'Dados Pessoais e da Empresa', icon: Building2, fields: 15 },
  { id: 2, title: 'Estrutura e Visão', icon: Users, fields: 6 },
  { id: 3, title: 'Metas e Objetivos', icon: Target, fields: 5 },
  { id: 4, title: 'Restrições e Estratégia', icon: TrendingUp, fields: 5 },
  { id: 5, title: 'Comercial e Vendas', icon: DollarSign, fields: 7 },
  { id: 6, title: 'Financeiro', icon: DollarSign, fields: 8 },
  { id: 7, title: 'CRM e Marketing', icon: Megaphone, fields: 12 },
  { id: 8, title: 'Gestão de Pessoas', icon: UserCog, fields: 10 },
  { id: 9, title: 'Tecnologia', icon: Cpu, fields: 5 },
  { id: 10, title: 'Autoavaliação', icon: ClipboardCheck, fields: 6 },
];

const initialFormData: CompanyData = {
  nome: '',
  sobrenome: '',
  telefone: '',
  email: '',
  empresa: '',
  dataNascimento: '',
  nomePrisma: '',
  cidade: '',
  cnpj: '',
  dataAbertura: '',
  setor: '',
  setorOutro: '',
  segmento: '',
  instagram: '',
  site: '',
  numSocios: 0,
  numColaboradores: 0,
  possuiPlanoMetas: '',
  maturidadeGerencial: '',
  expectativa4Dias: '',
  visao3a5Anos: '',
  metaFaturamentoAnual: 0,
  margemLucroAlvo: 0,
  topObjetivosAno: '',
  kpisEstrategicos: '',
  iniciativasOKRs: '',
  maioresRestricoes: '',
  apetiteRisco: '',
  vantagemCompetitiva: '',
  clientePrioritario: '',
  regiaoAtuacao: '',
  canaisAquisicao: '',
  taxaConversaoGeral: 0,
  ticketMedio: 0,
  nps: 0,
  principaisObjecoes: '',
  concorrenciaPredominante: '',
  diferenciaisPercebidos: '',
  faturamento6Meses: 0,
  lucroLiquido6MesesPercent: 0,
  custoAquisicaoCliente: 0,
  ltv: 0,
  inadimplenciaPercent: 0,
  endividamento: '',
  custoFinanceiroMensal: 0,
  softwaresFinanceiros: '',
  crmUtilizado: '',
  funilDefinido: '',
  taxaConversaoFunil: 0,
  cicloMedioVendas: 0,
  leadsMes: 0,
  canaisPagosAtivos: '',
  roasMedio: 0,
  conteudosPerformam: '',
  timeComercial: '',
  modeloComissionamento: '',
  winRate: 0,
  motivosPerda: '',
  existeOrganograma: '',
  camadasLideranca: 0,
  perfisMapeados: '',
  turnover12Meses: 0,
  absenteismo: 0,
  rituaisGestao: '',
  modeloMetas: '',
  fortalezasLideranca: '',
  gapsGestao: '',
  areasCarenciaPessoas: '',
  stackAtual: '',
  ondeDadosVivem: '',
  dashboardsKPIs: '',
  usoIAHoje: '',
  integracoesDesejadas: '',
  notaEstrategiaMetas: 5,
  notaFinancasLucratividade: 5,
  notaComercialMarketing: 5,
  notaOperacoesQualidade: 5,
  notaPessoasLideranca: 5,
  notaTecnologiaDados: 5,
};

export function CompanyForm({ onSubmit, isLoading }: CompanyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompanyData>(initialFormData);

  const updateField = (field: keyof CompanyData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const progress = (currentStep / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Dados Pessoais e da Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome *</Label>
                <Input
                  id="sobrenome"
                  value={formData.sobrenome}
                  onChange={(e) => updateField('sobrenome', e.target.value)}
                  placeholder="Seu sobrenome"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => updateField('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => updateField('dataNascimento', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nomePrisma">Nome no Prisma/Sistema</Label>
                <Input
                  id="nomePrisma"
                  value={formData.nomePrisma}
                  onChange={(e) => updateField('nomePrisma', e.target.value)}
                  placeholder="Nome cadastrado"
                />
              </div>
            </div>

            <div className="border-t border-border/50 pt-6 mt-6">
              <h4 className="text-md font-medium text-foreground mb-4">Dados da Empresa</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Nome da Empresa *</Label>
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => updateField('empresa', e.target.value)}
                    placeholder="Nome da sua empresa"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => updateField('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => updateField('cidade', e.target.value)}
                    placeholder="Cidade onde a empresa está localizada"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataAbertura">Data de Abertura</Label>
                  <Input
                    id="dataAbertura"
                    type="date"
                    value={formData.dataAbertura}
                    onChange={(e) => updateField('dataAbertura', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="setor">Setor de Atuação *</Label>
                  <Select value={formData.setor} onValueChange={(value) => updateField('setor', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {SETORES.map((setor) => (
                        <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.setor === 'Outro' && (
                  <div className="space-y-2">
                    <Label htmlFor="setorOutro">Especifique o Setor</Label>
                    <Input
                      id="setorOutro"
                      value={formData.setorOutro}
                      onChange={(e) => updateField('setorOutro', e.target.value)}
                      placeholder="Qual setor?"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="segmento">Segmento/Nicho</Label>
                  <Input
                    id="segmento"
                    value={formData.segmento}
                    onChange={(e) => updateField('segmento', e.target.value)}
                    placeholder="Ex: B2B, B2C, SaaS..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => updateField('instagram', e.target.value)}
                    placeholder="@suaempresa"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site">Site</Label>
                  <Input
                    id="site"
                    value={formData.site}
                    onChange={(e) => updateField('site', e.target.value)}
                    placeholder="www.suaempresa.com.br"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Estrutura e Visão
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numSocios">Número de Sócios</Label>
                <Input
                  id="numSocios"
                  type="number"
                  min="0"
                  value={formData.numSocios || ''}
                  onChange={(e) => updateField('numSocios', parseInt(e.target.value) || 0)}
                  placeholder="Quantos sócios?"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numColaboradores">Número de Colaboradores</Label>
                <Input
                  id="numColaboradores"
                  type="number"
                  min="0"
                  value={formData.numColaboradores || ''}
                  onChange={(e) => updateField('numColaboradores', parseInt(e.target.value) || 0)}
                  placeholder="Total de funcionários"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="possuiPlanoMetas">Possui Plano de Metas?</Label>
                <Select value={formData.possuiPlanoMetas} onValueChange={(value) => updateField('possuiPlanoMetas', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim, estruturado">Sim, estruturado</SelectItem>
                    <SelectItem value="Sim, informal">Sim, informal</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Em desenvolvimento">Em desenvolvimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maturidadeGerencial">Maturidade Gerencial</Label>
                <Select value={formData.maturidadeGerencial} onValueChange={(value) => updateField('maturidadeGerencial', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inicial">Inicial - Processos informais</SelectItem>
                    <SelectItem value="Em desenvolvimento">Em desenvolvimento - Alguns processos</SelectItem>
                    <SelectItem value="Definido">Definido - Processos documentados</SelectItem>
                    <SelectItem value="Gerenciado">Gerenciado - Métricas e controles</SelectItem>
                    <SelectItem value="Otimizado">Otimizado - Melhoria contínua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectativa4Dias">Qual sua expectativa para os próximos 4 dias/semanas?</Label>
              <Textarea
                id="expectativa4Dias"
                value={formData.expectativa4Dias}
                onChange={(e) => updateField('expectativa4Dias', e.target.value)}
                placeholder="Descreva suas expectativas de curto prazo..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="visao3a5Anos">Visão de 3 a 5 anos para a empresa</Label>
              <Textarea
                id="visao3a5Anos"
                value={formData.visao3a5Anos}
                onChange={(e) => updateField('visao3a5Anos', e.target.value)}
                placeholder="Onde você quer que sua empresa esteja em 3-5 anos?"
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Metas e Objetivos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaFaturamentoAnual">Meta de Faturamento Anual (R$)</Label>
                <Input
                  id="metaFaturamentoAnual"
                  type="number"
                  min="0"
                  value={formData.metaFaturamentoAnual || ''}
                  onChange={(e) => updateField('metaFaturamentoAnual', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 1000000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="margemLucroAlvo">Margem de Lucro Alvo (%)</Label>
                <Input
                  id="margemLucroAlvo"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.margemLucroAlvo || ''}
                  onChange={(e) => updateField('margemLucroAlvo', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topObjetivosAno">Top 3 Objetivos do Ano</Label>
              <Textarea
                id="topObjetivosAno"
                value={formData.topObjetivosAno}
                onChange={(e) => updateField('topObjetivosAno', e.target.value)}
                placeholder="Liste seus 3 principais objetivos para este ano..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kpisEstrategicos">KPIs Estratégicos</Label>
              <Textarea
                id="kpisEstrategicos"
                value={formData.kpisEstrategicos}
                onChange={(e) => updateField('kpisEstrategicos', e.target.value)}
                placeholder="Quais indicadores você acompanha? Ex: Faturamento, NPS, Churn..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="iniciativasOKRs">Iniciativas/OKRs em Andamento</Label>
              <Textarea
                id="iniciativasOKRs"
                value={formData.iniciativasOKRs}
                onChange={(e) => updateField('iniciativasOKRs', e.target.value)}
                placeholder="Quais projetos ou OKRs estão em execução?"
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Restrições e Estratégia
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="maioresRestricoes">Maiores Restrições/Gargalos</Label>
              <Textarea
                id="maioresRestricoes"
                value={formData.maioresRestricoes}
                onChange={(e) => updateField('maioresRestricoes', e.target.value)}
                placeholder="O que mais limita o crescimento da sua empresa hoje?"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apetiteRisco">Apetite a Risco</Label>
              <Select value={formData.apetiteRisco} onValueChange={(value) => updateField('apetiteRisco', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conservador">Conservador - Prefiro segurança</SelectItem>
                  <SelectItem value="Moderado">Moderado - Equilíbrio risco/retorno</SelectItem>
                  <SelectItem value="Arrojado">Arrojado - Aceito riscos por crescimento</SelectItem>
                  <SelectItem value="Agressivo">Agressivo - Busco crescimento acelerado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vantagemCompetitiva">Vantagem Competitiva</Label>
              <Textarea
                id="vantagemCompetitiva"
                value={formData.vantagemCompetitiva}
                onChange={(e) => updateField('vantagemCompetitiva', e.target.value)}
                placeholder="O que diferencia sua empresa da concorrência?"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientePrioritario">Cliente Prioritário/ICP</Label>
              <Textarea
                id="clientePrioritario"
                value={formData.clientePrioritario}
                onChange={(e) => updateField('clientePrioritario', e.target.value)}
                placeholder="Descreva seu cliente ideal (perfil, características, necessidades)..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="regiaoAtuacao">Região de Atuação</Label>
              <Input
                id="regiaoAtuacao"
                value={formData.regiaoAtuacao}
                onChange={(e) => updateField('regiaoAtuacao', e.target.value)}
                placeholder="Ex: Nacional, Sul do Brasil, Grande São Paulo..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Comercial e Vendas
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="canaisAquisicao">Canais de Aquisição de Clientes</Label>
              <Textarea
                id="canaisAquisicao"
                value={formData.canaisAquisicao}
                onChange={(e) => updateField('canaisAquisicao', e.target.value)}
                placeholder="Ex: Indicação, Google Ads, Instagram, Prospecção ativa..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxaConversaoGeral">Taxa de Conversão Geral (%)</Label>
                <Input
                  id="taxaConversaoGeral"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.taxaConversaoGeral || ''}
                  onChange={(e) => updateField('taxaConversaoGeral', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ticketMedio">Ticket Médio (R$)</Label>
                <Input
                  id="ticketMedio"
                  type="number"
                  min="0"
                  value={formData.ticketMedio || ''}
                  onChange={(e) => updateField('ticketMedio', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nps">NPS (Net Promoter Score)</Label>
                <Input
                  id="nps"
                  type="number"
                  min="-100"
                  max="100"
                  value={formData.nps || ''}
                  onChange={(e) => updateField('nps', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 70"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="principaisObjecoes">Principais Objeções dos Clientes</Label>
              <Textarea
                id="principaisObjecoes"
                value={formData.principaisObjecoes}
                onChange={(e) => updateField('principaisObjecoes', e.target.value)}
                placeholder="Quais são as objeções mais comuns que você ouve?"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="concorrenciaPredominante">Concorrência Predominante</Label>
              <Textarea
                id="concorrenciaPredominante"
                value={formData.concorrenciaPredominante}
                onChange={(e) => updateField('concorrenciaPredominante', e.target.value)}
                placeholder="Quem são seus principais concorrentes?"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diferenciaisPercebidos">Diferenciais Percebidos pelos Clientes</Label>
              <Textarea
                id="diferenciaisPercebidos"
                value={formData.diferenciaisPercebidos}
                onChange={(e) => updateField('diferenciaisPercebidos', e.target.value)}
                placeholder="O que seus clientes dizem que você faz melhor?"
                rows={2}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Financeiro
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faturamento6Meses">Faturamento Últimos 6 Meses (R$)</Label>
                <Input
                  id="faturamento6Meses"
                  type="number"
                  min="0"
                  value={formData.faturamento6Meses || ''}
                  onChange={(e) => updateField('faturamento6Meses', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 500000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lucroLiquido6MesesPercent">Lucro Líquido (%)</Label>
                <Input
                  id="lucroLiquido6MesesPercent"
                  type="number"
                  min="-100"
                  max="100"
                  step="0.1"
                  value={formData.lucroLiquido6MesesPercent || ''}
                  onChange={(e) => updateField('lucroLiquido6MesesPercent', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 15"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custoAquisicaoCliente">Custo de Aquisição de Cliente - CAC (R$)</Label>
                <Input
                  id="custoAquisicaoCliente"
                  type="number"
                  min="0"
                  value={formData.custoAquisicaoCliente || ''}
                  onChange={(e) => updateField('custoAquisicaoCliente', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ltv">Lifetime Value - LTV (R$)</Label>
                <Input
                  id="ltv"
                  type="number"
                  min="0"
                  value={formData.ltv || ''}
                  onChange={(e) => updateField('ltv', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 2000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inadimplenciaPercent">Inadimplência (%)</Label>
                <Input
                  id="inadimplenciaPercent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.inadimplenciaPercent || ''}
                  onChange={(e) => updateField('inadimplenciaPercent', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custoFinanceiroMensal">Custo Financeiro Mensal (R$)</Label>
                <Input
                  id="custoFinanceiroMensal"
                  type="number"
                  min="0"
                  value={formData.custoFinanceiroMensal || ''}
                  onChange={(e) => updateField('custoFinanceiroMensal', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 5000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endividamento">Nível de Endividamento</Label>
              <Select value={formData.endividamento} onValueChange={(value) => updateField('endividamento', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sem dívidas">Sem dívidas</SelectItem>
                  <SelectItem value="Baixo">Baixo - Dívidas controladas</SelectItem>
                  <SelectItem value="Moderado">Moderado - Algumas dívidas</SelectItem>
                  <SelectItem value="Alto">Alto - Dívidas significativas</SelectItem>
                  <SelectItem value="Crítico">Crítico - Dívidas comprometendo operação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="softwaresFinanceiros">Softwares Financeiros Utilizados</Label>
              <Input
                id="softwaresFinanceiros"
                value={formData.softwaresFinanceiros}
                onChange={(e) => updateField('softwaresFinanceiros', e.target.value)}
                placeholder="Ex: Conta Azul, Omie, Excel..."
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-400" />
              CRM e Marketing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crmUtilizado">CRM Utilizado</Label>
                <Input
                  id="crmUtilizado"
                  value={formData.crmUtilizado}
                  onChange={(e) => updateField('crmUtilizado', e.target.value)}
                  placeholder="Ex: Pipedrive, RD Station, HubSpot, Nenhum..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="funilDefinido">Funil de Vendas Definido?</Label>
                <Select value={formData.funilDefinido} onValueChange={(value) => updateField('funilDefinido', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim, estruturado">Sim, estruturado e documentado</SelectItem>
                    <SelectItem value="Sim, informal">Sim, mas informal</SelectItem>
                    <SelectItem value="Em desenvolvimento">Em desenvolvimento</SelectItem>
                    <SelectItem value="Não">Não tenho funil definido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxaConversaoFunil">Taxa de Conversão do Funil (%)</Label>
                <Input
                  id="taxaConversaoFunil"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.taxaConversaoFunil || ''}
                  onChange={(e) => updateField('taxaConversaoFunil', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cicloMedioVendas">Ciclo Médio de Vendas (dias)</Label>
                <Input
                  id="cicloMedioVendas"
                  type="number"
                  min="0"
                  value={formData.cicloMedioVendas || ''}
                  onChange={(e) => updateField('cicloMedioVendas', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leadsMes">Leads por Mês</Label>
                <Input
                  id="leadsMes"
                  type="number"
                  min="0"
                  value={formData.leadsMes || ''}
                  onChange={(e) => updateField('leadsMes', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roasMedio">ROAS Médio</Label>
                <Input
                  id="roasMedio"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.roasMedio || ''}
                  onChange={(e) => updateField('roasMedio', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 3.5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="winRate">Win Rate (%)</Label>
                <Input
                  id="winRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.winRate || ''}
                  onChange={(e) => updateField('winRate', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 25"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="canaisPagosAtivos">Canais Pagos Ativos</Label>
              <Input
                id="canaisPagosAtivos"
                value={formData.canaisPagosAtivos}
                onChange={(e) => updateField('canaisPagosAtivos', e.target.value)}
                placeholder="Ex: Google Ads, Meta Ads, LinkedIn Ads..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conteudosPerformam">Conteúdos que Mais Performam</Label>
              <Textarea
                id="conteudosPerformam"
                value={formData.conteudosPerformam}
                onChange={(e) => updateField('conteudosPerformam', e.target.value)}
                placeholder="Que tipo de conteúdo gera mais engajamento/leads?"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeComercial">Estrutura do Time Comercial</Label>
              <Textarea
                id="timeComercial"
                value={formData.timeComercial}
                onChange={(e) => updateField('timeComercial', e.target.value)}
                placeholder="Quantas pessoas? Quais funções? (SDR, Closer, CS...)"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modeloComissionamento">Modelo de Comissionamento</Label>
              <Input
                id="modeloComissionamento"
                value={formData.modeloComissionamento}
                onChange={(e) => updateField('modeloComissionamento', e.target.value)}
                placeholder="Ex: Fixo + variável, % sobre vendas..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motivosPerda">Principais Motivos de Perda de Vendas</Label>
              <Textarea
                id="motivosPerda"
                value={formData.motivosPerda}
                onChange={(e) => updateField('motivosPerda', e.target.value)}
                placeholder="Por que os clientes não fecham?"
                rows={2}
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <UserCog className="w-5 h-5 text-cyan-400" />
              Gestão de Pessoas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="existeOrganograma">Existe Organograma?</Label>
                <Select value={formData.existeOrganograma} onValueChange={(value) => updateField('existeOrganograma', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim, atualizado">Sim, atualizado</SelectItem>
                    <SelectItem value="Sim, desatualizado">Sim, mas desatualizado</SelectItem>
                    <SelectItem value="Em desenvolvimento">Em desenvolvimento</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="camadasLideranca">Camadas de Liderança</Label>
                <Input
                  id="camadasLideranca"
                  type="number"
                  min="0"
                  value={formData.camadasLideranca || ''}
                  onChange={(e) => updateField('camadasLideranca', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 3 (Diretor > Gerente > Coordenador)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="perfisMapeados">Perfis Comportamentais Mapeados?</Label>
                <Select value={formData.perfisMapeados} onValueChange={(value) => updateField('perfisMapeados', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim, todos">Sim, todos os colaboradores</SelectItem>
                    <SelectItem value="Sim, liderança">Sim, apenas liderança</SelectItem>
                    <SelectItem value="Parcialmente">Parcialmente</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="turnover12Meses">Turnover 12 Meses (%)</Label>
                <Input
                  id="turnover12Meses"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.turnover12Meses || ''}
                  onChange={(e) => updateField('turnover12Meses', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 15"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="absenteismo">Absenteísmo (%)</Label>
                <Input
                  id="absenteismo"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.absenteismo || ''}
                  onChange={(e) => updateField('absenteismo', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 3"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rituaisGestao">Rituais de Gestão</Label>
              <Textarea
                id="rituaisGestao"
                value={formData.rituaisGestao}
                onChange={(e) => updateField('rituaisGestao', e.target.value)}
                placeholder="Quais reuniões/rituais são praticados? (Daily, Weekly, 1:1...)"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modeloMetas">Modelo de Metas para Equipe</Label>
              <Input
                id="modeloMetas"
                value={formData.modeloMetas}
                onChange={(e) => updateField('modeloMetas', e.target.value)}
                placeholder="Ex: OKR, BSC, Metas individuais..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fortalezasLideranca">Fortalezas da Liderança</Label>
              <Textarea
                id="fortalezasLideranca"
                value={formData.fortalezasLideranca}
                onChange={(e) => updateField('fortalezasLideranca', e.target.value)}
                placeholder="Quais são os pontos fortes da sua liderança?"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gapsGestao">Gaps de Gestão</Label>
              <Textarea
                id="gapsGestao"
                value={formData.gapsGestao}
                onChange={(e) => updateField('gapsGestao', e.target.value)}
                placeholder="Onde você identifica lacunas na gestão?"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="areasCarenciaPessoas">Áreas com Carência de Pessoas</Label>
              <Textarea
                id="areasCarenciaPessoas"
                value={formData.areasCarenciaPessoas}
                onChange={(e) => updateField('areasCarenciaPessoas', e.target.value)}
                placeholder="Quais áreas precisam de mais pessoas ou competências?"
                rows={2}
              />
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Cpu className="w-5 h-5 text-violet-400" />
              Tecnologia
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="stackAtual">Stack Tecnológica Atual</Label>
              <Textarea
                id="stackAtual"
                value={formData.stackAtual}
                onChange={(e) => updateField('stackAtual', e.target.value)}
                placeholder="Quais sistemas/ferramentas você usa? (ERP, CRM, BI...)"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ondeDadosVivem">Onde os Dados Vivem?</Label>
              <Textarea
                id="ondeDadosVivem"
                value={formData.ondeDadosVivem}
                onChange={(e) => updateField('ondeDadosVivem', e.target.value)}
                placeholder="Onde estão armazenados seus dados? (Planilhas, Sistemas, Nuvem...)"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dashboardsKPIs">Dashboards/KPIs Disponíveis</Label>
              <Textarea
                id="dashboardsKPIs"
                value={formData.dashboardsKPIs}
                onChange={(e) => updateField('dashboardsKPIs', e.target.value)}
                placeholder="Quais dashboards você tem? Quais KPIs são monitorados?"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="usoIAHoje">Uso de IA Hoje</Label>
              <Textarea
                id="usoIAHoje"
                value={formData.usoIAHoje}
                onChange={(e) => updateField('usoIAHoje', e.target.value)}
                placeholder="Você usa IA em algum processo? Qual?"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="integracoesDesejadas">Integrações Desejadas</Label>
              <Textarea
                id="integracoesDesejadas"
                value={formData.integracoesDesejadas}
                onChange={(e) => updateField('integracoesDesejadas', e.target.value)}
                placeholder="Quais integrações você gostaria de ter entre seus sistemas?"
                rows={2}
              />
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-amber-400" />
              Autoavaliação (Notas de 1 a 10)
            </h3>
            
            <p className="text-muted-foreground text-sm">
              Avalie cada área da sua empresa de 1 (muito ruim) a 10 (excelente)
            </p>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Estratégia e Metas</Label>
                  <span className="text-2xl font-bold text-primary">{formData.notaEstrategiaMetas}</span>
                </div>
                <Slider
                  value={[formData.notaEstrategiaMetas]}
                  onValueChange={([value]) => updateField('notaEstrategiaMetas', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 - Muito ruim</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Finanças e Lucratividade</Label>
                  <span className="text-2xl font-bold text-emerald-400">{formData.notaFinancasLucratividade}</span>
                </div>
                <Slider
                  value={[formData.notaFinancasLucratividade]}
                  onValueChange={([value]) => updateField('notaFinancasLucratividade', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 - Muito ruim</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Comercial e Marketing</Label>
                  <span className="text-2xl font-bold text-orange-400">{formData.notaComercialMarketing}</span>
                </div>
                <Slider
                  value={[formData.notaComercialMarketing]}
                  onValueChange={([value]) => updateField('notaComercialMarketing', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 - Muito ruim</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Operações e Qualidade</Label>
                  <span className="text-2xl font-bold text-purple-400">{formData.notaOperacoesQualidade}</span>
                </div>
                <Slider
                  value={[formData.notaOperacoesQualidade]}
                  onValueChange={([value]) => updateField('notaOperacoesQualidade', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 - Muito ruim</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Pessoas e Liderança</Label>
                  <span className="text-2xl font-bold text-cyan-400">{formData.notaPessoasLideranca}</span>
                </div>
                <Slider
                  value={[formData.notaPessoasLideranca]}
                  onValueChange={([value]) => updateField('notaPessoasLideranca', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 - Muito ruim</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Tecnologia e Dados</Label>
                  <span className="text-2xl font-bold text-violet-400">{formData.notaTecnologiaDados}</span>
                </div>
                <Slider
                  value={[formData.notaTecnologiaDados]}
                  onValueChange={([value]) => updateField('notaTecnologiaDados', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 - Muito ruim</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Preencha os dados da empresa
          </h2>
          <span className="text-sm text-muted-foreground">
            Etapa {currentStep} de {STEPS.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-between mt-4 overflow-x-auto pb-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[60px] transition-all",
                  isActive && "scale-110",
                  !isActive && !isCompleted && "opacity-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isCompleted && "bg-emerald-500 text-white",
                  isActive && "bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] text-center hidden md:block",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {step.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        
        {currentStep < STEPS.length ? (
          <Button
            onClick={nextStep}
            className="flex items-center gap-2"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.empresa}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Gerar Análise
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
