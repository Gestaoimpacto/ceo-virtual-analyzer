
## Banco de Dados e Histórico de Usuários
- [x] Criar schema para análises de empresas
- [x] Criar API para salvar análises
- [x] Criar API para listar histórico de análises
- [x] Integrar frontend com backend para salvar análises
- [x] Adicionar página de histórico de análises do usuário
## Login e Autenticação
- [x] Adicionar botão de login visível no cabeçalho da página
- [x] Mostrar nome do usuário logado e opção de logout
- [x] Link para histórico visível quando logado
## Painel Administrativo
- [x] Criar rota API para listar todas as análises (admin only)
- [x] Criar página de painel admin com filtros por data, empresa e setor
- [x] Adicionar estatísticas gerais (total de análises, média de scores, etc.)
- [x] Adicionar link para admin no menu de navegação
## Integração com IA Generativa
- [x] Criar endpoint tRPC para gerar recomendações com LLM
- [x] Integrar LLM no fluxo de análise para recomendações personalizadas
- [x] Exibir recomendações da IA na interface com formatação markdown
## Exportação de Histórico Comparativo
- [x] Criar funcionalidade de comparar duas análises lado a lado
- [x] Gerar CSV comparativo com evolução entre análises

## Dashboard Admin Completo
- [x] Expandir API admin com dados detalhados e agregações
- [x] Cards de KPIs principais (total empresas, score médio, setores, etc.)
- [x] Gráfico de distribuição de scores por área (radar/bar)
- [x] Ranking das principais dores e problemas identificados
- [x] Mapa de oportunidades e necessidades mais comuns
- [x] Análise por setor com comparativo
- [x] Tabela detalhada com drill-down por empresa
- [x] Gráfico de evolução temporal das análises
- [x] Seção de causas raiz mais frequentes
- [x] Exportação completa do dashboard

## Dashboard Admin - Dados Estratificados
- [x] Armazenar dados completos da empresa no banco (faturamento, sócios, colaboradores, etc.)
- [x] Aba Visão Geral: faturamento total, médio, por setor; total de colaboradores e sócios
- [x] Aba Perfil das Empresas: faturamento, ticket médio, margem, inadimplência, endividamento
- [x] Aba Estrutura: número de sócios, colaboradores, turnover, absenteísmo por empresa
- [x] Aba Comercial: leads, taxa de conversão, ciclo de vendas, NPS por empresa
- [x] Aba Financeiro: faturamento, lucro, margem, inadimplência, endividamento detalhado
- [x] Aba Tecnologia: stack, CRM, uso de IA por empresa
- [x] Filtros avançados por setor, cidade, faixa de faturamento
- [x] Cards de resumo com médias e totais agregados
- [x] Tabela expandível com todos os dados da empresa

## Dashboard Admin - Filtro por Datas
- [x] Adicionar seletor de período (data início e data fim) no dashboard admin
- [x] Filtrar todas as análises e agregações pelo período selecionado
- [x] Atalhos rápidos: Últimos 7 dias, 30 dias, 90 dias, Este mês, Este ano, Todos
