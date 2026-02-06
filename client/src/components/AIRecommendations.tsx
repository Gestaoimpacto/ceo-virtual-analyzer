import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Streamdown } from 'streamdown';
import { CompanyData, AnalysisResult } from '@/types/company';
import { toast } from 'sonner';

interface AIRecommendationsProps {
  companyData: CompanyData;
  analysisResult: AnalysisResult;
  isAuthenticated: boolean;
}

export function AIRecommendations({ companyData, analysisResult, isAuthenticated }: AIRecommendationsProps) {
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateMutation = trpc.ai.generateRecommendations.useMutation({
    onSuccess: (data) => {
      if (data.success && data.recommendation) {
        setAiContent(data.recommendation);
        toast.success('Recomendações da IA geradas com sucesso!');
      } else {
        toast.error('Não foi possível gerar as recomendações. Tente novamente.');
      }
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('AI Error:', error);
      toast.error('Erro ao gerar recomendações. Faça login para usar esta funcionalidade.');
      setIsGenerating(false);
    },
  });

  const handleGenerate = () => {
    if (!isAuthenticated) {
      toast.error('Faça login para usar a IA generativa.');
      return;
    }

    setIsGenerating(true);
    setAiContent(null);

    generateMutation.mutate({
      empresaNome: companyData.empresa,
      setor: companyData.setor || undefined,
      cidade: companyData.cidade || undefined,
      scoreGeral: analysisResult.scoreGeral,
      scoreFinanceiro: analysisResult.scoreFinanceiro,
      scoreComercial: analysisResult.scoreComercial,
      scoreOperacional: analysisResult.scoreOperacional,
      scorePessoas: analysisResult.scorePessoas,
      scoreTecnologia: analysisResult.scoreTecnologia,
      companyData: companyData,
      analysisResult: {
        scoreGeral: analysisResult.scoreGeral,
        scoreFinanceiro: analysisResult.scoreFinanceiro,
        scoreComercial: analysisResult.scoreComercial,
        scoreOperacional: analysisResult.scoreOperacional,
        scorePessoas: analysisResult.scorePessoas,
        scoreTecnologia: analysisResult.scoreTecnologia,
        diagnosticoFinanceiro: analysisResult.diagnosticoFinanceiro,
        diagnosticoComercial: analysisResult.diagnosticoComercial,
        diagnosticoOperacional: analysisResult.diagnosticoOperacional,
        diagnosticoPessoas: analysisResult.diagnosticoPessoas,
        diagnosticoTecnologia: analysisResult.diagnosticoTecnologia,
      },
    });
  };

  const handleCopy = () => {
    if (aiContent) {
      navigator.clipboard.writeText(aiContent);
      setCopied(true);
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#213242]/80 to-[#091018]/80 border border-primary/30 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-primary/20 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                Análise CEO com IA
              </h3>
              <p className="text-sm text-muted-foreground">
                Recomendações personalizadas geradas por inteligência artificial
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {aiContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            )}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !isAuthenticated}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : aiContent ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerar
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar com IA
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                Analisando dados da empresa com IA...
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Isso pode levar até 30 segundos
              </p>
            </motion.div>
          ) : aiContent ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-invert prose-sm max-w-none 
                prose-headings:text-foreground prose-headings:font-bold
                prose-h2:text-primary prose-h2:border-b prose-h2:border-primary/20 prose-h2:pb-2 prose-h2:mt-8
                prose-h3:text-primary/90 prose-h3:mt-6
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-strong:text-foreground
                prose-li:text-muted-foreground
                prose-ul:space-y-1
                prose-ol:space-y-1
                prose-a:text-primary
              "
            >
              <Streamdown>{aiContent}</Streamdown>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Sparkles className="w-12 h-12 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                {isAuthenticated
                  ? 'Clique em "Gerar com IA" para receber recomendações personalizadas baseadas nos dados da empresa.'
                  : 'Faça login para gerar recomendações personalizadas com IA.'}
              </p>
              <p className="text-muted-foreground/60 text-xs mt-2">
                A IA analisará todos os dados e gerará um plano estratégico completo
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
