# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Brasileiros de qualquer faixa etária e vínculo empregatício (`CLT`, `PJ`, servidor público, contrato temporário, estudante) que organizam suas finanças pessoais e familiares pelo smartphone (Android e iOS). O sistema adapta os meses recomendados de reserva de emergência, pisos de proteção e estratégias de alocação à estabilidade real de cada vínculo, tratando dependentes residentes e pensão alimentícia judicial como obrigações blindadas de primeira classe.

## Product Purpose

Aplicativo mobile nativo de inteligência e controle financeiro pessoal com planejamento orçamentário por IA (Algoritmo Genético). Diferente de aplicativos financeiros tradicionais que funcionam apenas como "retrovisor" do que já foi gasto, o Rumvel Mobile projeta o futuro financeiro do usuário distribuindo a renda líquida confiável em **9 potes orçamentários** com garantia matemática de soma exata em 100% (método dos maiores restos de Hare-Niemeyer) e proteção inegociável das despesas de sobrevivência e obrigações legais.

O sucesso significa que o usuário consegue, em poucos toques no celular, saber seu saldo realizado e projetado, dar baixa em compromissos pendentes, gerar um plano de alocação realista (Modo Equilíbrio ou Modo Resgate de Dívidas) e transformar a recomendação da IA diretamente em tetos mensais de orçamento acompanhados em tempo real.

## Positioning

Único aplicativo financeiro mobile brasileiro que une:
1. Diagnóstico da realidade financeira brasileira real (vínculo CLT/PJ/Servidor, dependentes residentes, pensão alimentícia blindada, regime de moradia e nível de endividamento);
2. Motor de otimização evolucionária (Algoritmo Genético com fallback determinístico Hare-Niemeyer local) que respeita pisos protegidos antes de sugerir cortes ou investimentos;
3. Provisionamento automático em 1 toque dos 9 potes recomendados para os orçamentos mensais do usuário;
4. Modo Sandbox Offline completo com dados bancários brasileiros pré-populados para experimentação imediata sem barreira de cadastro.

## Operating Context

### Ecossistema Rumvel (Arquitetura Integrada)
- **App Mobile (`rumvel-mobile` — este repositório):** React Native `0.85.3` + Expo SDK 56 (`expo-router`) + NativeWind v4 + React Native Reusables (`@rn-primitives/*`) + New Architecture + Hermes. Distribuído nativamente para Android (APK universal `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) e iOS (`me.rumvel.mobile`).
- **Frontend Web (`rumvel-web`):** SPA React 19 / Vite / Tailwind CSS em `https://rumvel.me`.
- **Backend Transacional (`rumvel-api` / `finan-service`):** Quarkus (Java 21) + PostgreSQL 16 em `/api/auth` e `/api/finance`. Responsável por autenticação JWT + Refresh Token, verificação OTP por e-mail, contas, saldos realizados/projetados, lançamentos, parcelamentos, recorrências, orçamentos, metas e conformidade LGPD.
- **Motor de IA (`rumvel-ga-engine`):** FastAPI (Python 3.11+) + NumPy em `/api/ai/optimize-allocations`, com motor determinístico espelhado localmente no app (`lib/plannerEngine.ts`) para operação resiliente e offline.
- **Integrações de Mercado:** Consulta em tempo real com cache local às APIs públicas `AwesomeAPI` (`USD-BRL`, `EUR-BRL`, `BTC-BRL`) e `BrasilAPI` (`Selic`, `IPCA`).

## Capabilities and Constraints

### Módulos Funcionais Confirmados
1. **Autenticação, Segurança & Sandbox (`app/auth.tsx`):** Login JWT com renovação automática concorrente (`secureFetch`), cadastro com aceite LGPD, verificação de e-mail por código OTP de 6 dígitos, recuperação de senha e entrada em 1 toque no **Modo Sandbox Offline** (`lib/demoBackend.ts`).
2. **Painel Consolidado (`app/(tabs)/index.tsx`):** Saldo Consolidado Realizado vs. Projetado, Entradas, Saídas, Ritmo Diário de Gasto, barra de indicadores de mercado (Dólar, Euro, Bitcoin, Selic, IPCA), ações rápidas (+ Despesa, + Receita, + Transferência), compromissos pendentes/atrasados com baixa otimista em 1 toque, distribuição percentual por categoria e termômetro de orçamentos.
3. **Extrato & Lançamentos (`app/(tabs)/transactions.tsx`):** Busca textual, filtros combinados por natureza/status (`Todos`, `Despesas`, `Receitas`, `Transferências`, `Pendentes`, `Atrasados`, `Pagos`) e por conta bancária. Suporte a lançamento único, parcelado (`2x` a `120x` em `/installments`), fixo/recorrente (`WEEKLY`, `MONTHLY`, `YEARLY` em `/recurring`) e transferência atômica entre contas (`/transactions/transfers`).
4. **Planejador IA / Algoritmo Genético (`app/(tabs)/planner.tsx`):** Diagnóstico interativo de renda, vínculo, dependentes, pensão alimentícia blindada, moradia, custos essenciais e dívidas. Alternância entre **Modo Equilíbrio (`BALANCED`)** e **Modo Resgate de Dívidas (`DEBT_PAYOFF`)**, cálculo de reserva de emergência recomendada e provisionamento idempotente em 1 toque para os orçamentos do mês.
5. **Orçamentos, Metas & Taxonomia (`app/(tabs)/budgets.tsx`):** Tetos mensais de despesa com semáforo visual (verde `< 80%`, amarelo `80–99%`, vermelho `≥ 100%`), cópia rápida para o mês seguinte, metas mensais de receita e gestão de categorias e etiquetas (`tags`) coloridas.
6. **Contas Bancárias, Simulador CDI/IPCA & LGPD (`app/(tabs)/accounts.tsx`):** Gestão de contas correntes, poupança, investimentos, carteira e cartão (criação, edição, arquivamento, exclusão), simulador comparativo de rendimento líquido de 12 meses (`100% CDI` descontando IR de `17,5%` vs. `Poupança` e ganho real acima do `IPCA`), exportação JSON de portabilidade LGPD e exclusão permanente de conta mediante senha e frase de confirmação (`EXCLUIR MINHA CONTA`).
7. **Modo Privacidade:** Ocultação instantânea de todos os valores monetários (`R$ ••••,••`) persistida no dispositivo para uso seguro em ambientes públicos.

### Os 9 Potes Orçamentários (`BucketKey`)
1. `housing` — Moradia & Habitação
2. `food` — Alimentação Essencial
3. `transport` — Transporte & Mobilidade
4. `health` — Saúde & Bem-Estar
5. `family` — Família & Dependentes (inclui blindagem integral de pensão alimentícia)
6. `lifestyle` — Lazer & Vida Pessoal
7. `debt` — Quitação de Dívidas
8. `emergency` — Reserva de Emergência
9. `investments` — Investimentos & Futuro

## Brand Commitments

- **Nome:** Rumvel
- **Package / Bundle ID:** `me.rumvel.mobile` (`scheme: rumvel`)
- **Domínios Oficiais:** `rumvel.me`, `rumvel.com`, `rumvel.com.br`
- **Posicionamento de Identidade:** *Committed Banking Precision* — linguagem técnica acessível em português brasileiro (`pt-BR`), transmitindo precisão bancária, sobriedade, transparência e controle sem gamificação infantilizada.

## Evidence on Hand

- **Dados Reais de Demonstração (Sandbox):** Estado pré-populado realista com instituições brasileiras (Nubank, Itaú Personalité, Banco Inter, Carteira Física) em `lib/demoBackend.ts`.
- **Cotações e Taxas Oficiais:** Integração real com `AwesomeAPI` e `BrasilAPI` em `lib/marketService.ts`.
- **Suíte de Testes Automatizados:** Testes de unidade e integração em `lib/__tests__/mvp.test.ts` (Vitest) validando formatadores BRL, soma exata de 100% no motor Hare-Niemeyer, pisos protegidos, detecção de déficit e fluxo completo de API.
- **Ausências Declaradas:** Nenhum depoimento de cliente, número de usuários ativos, certificação bancária regulatória ou benchmark comparativo de terceiros deve ser fabricado na interface.

## Product Principles

1. **Piso antes do teto:** Despesas essenciais de sobrevivência e obrigações legais (como pensão alimentícia) são blindadas (`PROTECTED`) — nenhuma otimização corta o básico para inflar investimentos.
2. **Previsibilidade acionável, não apenas retrovisor:** O produto existe para guiar a alocação futura de cada real e transformar recomendações em tetos reais de orçamento com 1 toque.
3. **Realidade financeira brasileira em primeiro lugar:** Vínculos `CLT`/`PJ`/`Servidor`, impostos de renda fixa (IR regressivo sobre CDI), Selic, IPCA e bancos nacionais são parte nativa da modelagem.
4. **Zero atrito no mobile:** Mutações otimistas em 1 toque (`Pagar`/`Receber`), funcionamento resiliente com fallback offline/Sandbox e Modo Privacidade imediato.
5. **Autonomia e soberania de dados (LGPD):** Portabilidade real em JSON e exclusão definitiva de conta diretamente pelo aplicativo, sem barreiras ocultas.

## Accessibility & Inclusion

- Primitivas acessíveis baseadas em `@rn-primitives/*` com papéis semânticos, `accessibilityLabel` em botões de ícone e contraste projetado para leitura financeira rápida.
- Uso obrigatório de algarismos tabulares (`tabular-nums`) em todos os valores monetários, percentuais e datas para evitar desalinhamento visual na leitura vertical.
