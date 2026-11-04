---
name: Rumvel Mobile
description: Inteligência financeira pessoal e alocação por Algoritmo Genético com precisão bancária tática.
colors:
  primary: "#00d494"
  primary-light: "#047857"
  primary-ink: "#041f16"
  obsidian-vault: "#080c10"
  slate-ledger: "#0e141d"
  tactical-slate: "#161f2c"
  steel-hairline: "#1a2332"
  crisp-ivory: "#f3f6fa"
  muted-steel: "#7c8ea1"
  alabaster-sheet: "#f8fafc"
  pure-ledger: "#ffffff"
  cloud-rule: "#e2e8f0"
  deep-ink: "#0f172a"
  crimson-alert: "#f43f5e"
  amber-threshold: "#f59e0b"
  signal-cyan: "#38bdf8"
typography:
  display:
    fontFamily: "Inter, System, Roboto, SF Pro Display, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, System, Roboto, SF Pro Display, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Inter, System, Roboto, SF Pro Text, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, System, Roboto, SF Pro Text, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, System, Roboto, SF Pro Text, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.06em"
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.tactical-slate}"
    textColor: "{colors.crisp-ivory}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-destructive:
    backgroundColor: "{colors.crimson-alert}"
    textColor: "{colors.pure-ledger}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  card:
    backgroundColor: "{colors.slate-ledger}"
    textColor: "{colors.crisp-ivory}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input-field:
    backgroundColor: "{colors.obsidian-vault}"
    textColor: "{colors.crisp-ivory}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  chip-status:
    backgroundColor: "{colors.tactical-slate}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: Rumvel Mobile

## Overview

**Creative North Star: "The Tactical Vault"**

O **Rumvel Mobile** opera sob a metáfora **The Tactical Vault** (*O Cofre Tático*): uma central de comando patrimonial de bolso onde a blindagem das obrigações essenciais da família brasileira encontra velocidade operacional de um toque. A estética combina sobriedade instrumental, densidade escaneável e dignidade patrimonial — tratando cada centavo, teto orçamentário e obrigação legal com o rigor de um terminal bancário profissional.

A arquitetura visual é *Dark-First*, repousando sobre um fundo de obsidiana profunda que reduz a fadiga ocular e faz com que os sinais semânticos — avanços de receita, alertas de teto orçamentário e potes blindados do Algoritmo Genético — saltem imediatamente à vista. O sistema rejeita categoricamente gamificações infantis, confetes comemorativos, gradientes de texto decorativos e sombras neobrutalistas duras, priorizando contornos estruturais precisos e resposta tátil imediata em Android e iOS.

**Key Characteristics:**
- Superfícies em camadas tonais escuras (*Obsidian Vault* e *Slate Ledger*) delimitadas por bordas estruturais *hairline* de 1px (`#1a2332`).
- Sinalização semântica de alta precisão liderada por *Emerald Vector* (`#00d494`) para liquidez positiva, *Amber Threshold* (`#f59e0b`) para pisos blindados e *Crimson Alert* (`#f43f5e`) para déficits ou atrasos.
- Rigor contábil obrigatório com algarismos tabulares (`tabular-nums`) em todos os saldos, cotações, percentuais dos 9 potes e datas.
- Componentes táteis, compactos e com precisão de instrumento (*tactile, compact, and instrument-grade*), projetados para operação rápida com uma mão.
- Suporte nativo dual a Modo Escuro (padrão) e Modo Claro de alto contraste (*Deep Forest Emerald* `#047857` sobre *Alabaster Sheet* `#f8fafc`).

## Colors

A paleta do Rumvel Mobile equilibra superfícies minerais escuras de baixíssima luminância com acentos vetoriais cirúrgicos que comunicam estado financeiro sem ambiguidade.

### Primary
- **Emerald Vector** (`#00d494`): Acento primário no modo escuro. Utilizado em CTAs principais, saldos realizados positivos, entradas de receita, indicadores de progresso dentro da meta e aba ativa na barra de navegação.
- **Deep Forest Emerald** (`#047857`): Variante primária para o modo claro, garantindo razão de contraste superior a 4.5:1 sobre superfícies claras.
- **Primary Ink** (`#041f16`): Cor de texto de alto contraste aplicada exclusivamente sobre botões e badges preenchidos com *Emerald Vector*.

### Secondary
- **Tactical Slate** (`#161f2c`): Superfície secundária para botões tonais, trilhos de barras de progresso (`Progress`), filtros selecionados e contêineres de apoio.
- **Signal Cyan** (`#38bdf8`): Acento informativo utilizado em transferências entre contas (`TRANSFER`) e metas de reserva de emergência.

### Tertiary
- **Amber Threshold** (`#f59e0b`): Sinalizador de alerta moderado (orçamentos entre 80% e 99% do teto) e selo de obrigação blindada (`BLINDADO` / `PROTECTED`) nos 9 potes do Planejador IA.
- **Crimson Alert** (`#f43f5e`): Sinalizador crítico para saídas, lançamentos vencidos (`ATRASADO`), orçamentos estourados (`≥ 100%`), alertas de déficit estrutural e ações destrutivas (exclusão de lançamento ou conta LGPD).

### Neutral
- **Obsidian Vault** (`#080c10`): Canvas global de fundo no modo escuro e preenchimento interno de campos de entrada e sub-cartões aninhados.
- **Slate Ledger** (`#0e141d`): Superfície principal de cartões (`Card`), cabeçalho (`AppHeader`), barra de abas inferior e modais (`Dialog`).
- **Steel Hairline** (`#1a2332`): Traço estrutural de 1px que define os limites de todos os cartões, inputs, pílulas do ticker de mercado e divisórias no modo escuro.
- **Crisp Ivory** (`#f3f6fa`): Tipografia primária para títulos, descrições de lançamentos e valores consolidados no modo escuro.
- **Muted Steel** (`#7c8ea1`): Tipografia secundária para metadados, carimbos de data, legendas explicativas e abas inativas.
- **Alabaster Sheet** (`#f8fafc`), **Pure Ledger** (`#ffffff`), **Cloud Rule** (`#e2e8f0`) e **Deep Ink** (`#0f172a`): Equivalentes estruturais de fundo, cartão, borda e texto principal para o modo claro.

### Named Rules
**The Semantic Emerald Rule.** *Emerald Vector* (`#00d494`) nunca é usado como preenchimento decorativo de grandes áreas; sua presença indica exclusivamente ação primária disponível, entrada de capital ou saúde orçamentária confirmada.

**The Traffic-Light Integrity Rule.** Toda barra de progresso orçamentário e badge de status deve obedecer estritamente aos limiares contábeis: *Emerald Vector* (`#00d494`) abaixo de 80%, *Amber Threshold* (`#f59e0b`) de 80% a 99%, e *Crimson Alert* (`#f43f5e`) a partir de 100%.

## Typography

**Display Font:** Inter (com fallback nativo para Roboto no Android e SF Pro Display no iOS)
**Body Font:** Inter (com fallback nativo para Roboto no Android e SF Pro Text no iOS)
**Label/Mono Font:** Inter com `fontVariant: ['tabular-nums']` (e monospace nativo para visualização de payload JSON LGPD)

**Character:** Geométrica, neutra e de alta legibilidade em corpos reduzidos, priorizando clareza numérica instantânea e alinhamento vertical rigoroso em listas financeiras densas.

### Hierarchy
- **Display** (`800` extrabold, `30px` / `text-3xl`, line-height `1.2`, tracking `-0.025em`): Valor principal do Saldo Consolidado Realizado no topo do Painel e título hero da tela de Autenticação.
- **Headline** (`700` bold, `20px` / `text-xl`, line-height `1.3`, tracking `-0.015em`): Títulos de modais, cabeçalhos de diagnóstico e destaque da regra recomendada pelo Algoritmo Genético.
- **Title** (`700` bold, `16px` / `text-base`, line-height `1.4`): Títulos de cartões (`CardTitle`) e seções funcionais em cada aba.
- **Body** (`400` regular / `600` semibold, `14px` / `text-sm` e `12px` / `text-xs`, line-height `1.5`): Descrições de lançamentos, notas estratégicas da IA, rótulos de campos e textos explicativos.
- **Label** (`700` bold, `10px–11px`, line-height `1.35`, tracking `0.06em`, `uppercase`): Cabeçalhos de métricas ("SALDO CONSOLIDADO REALIZADO", "ENTRADAS", "SAÍDAS"), códigos do ticker de mercado (`USD`, `SELIC`, `IPCA`) e badges de status (`PAGO`, `PENDENTE`, `ATRASADO`, `BLINDADO`).

### Named Rules
**The Tabular Numerals Law.** Todo valor em reais (`R$`), porcentagem (`%`), número de parcela (`2/10`), cotação de mercado e data deve aplicar obrigatoriamente `fontVariant: ['tabular-nums']` (`TABULAR_NUMS`) para impedir oscilação horizontal de dígitos.

**The Privacy Mask Parity Rule.** Quando o Modo Privacidade estiver ativo, todos os valores monetários devem ser substituídos pela máscara `R$ ••••,••` mantendo exatamente o mesmo peso tipográfico, cor semântica e alinhamento do valor original.

## Layout

O layout segue uma arquitetura mobile-first de coluna única otimizada para operação vertical com o polegar, respeitando integralmente as áreas seguras do sistema operacional (`SafeAreaView` no topo e barra de abas fixa de `62px` na base).

- **Estrutura Global da Tela:**
  - **Cabeçalho Persistente (`AppHeader`):** Fixado no topo com padding horizontal de `16px` (`px-4`) e vertical de `12px` (`py-3`), reunindo avatar com iniciais, seletor de competência mensal (`< Out 2026 >`), botões utilitários (Modo Privacidade, Atualizar, Tema) e faixa horizontal rolável de cotações do mercado.
  - **Canvas de Conteúdo (`ScrollView`):** Espaçamento externo de `16px` (`p-4`), espaçamento vertical entre cartões de `12px` a `16px` (`gap-3` / `gap-4`) e respiro inferior de `40px` a `48px` (`pb-10` / `pb-12`) para nunca colidir com a barra de navegação inferior.
- **Grids Internos de Métricas:**
  - **Pulse Grid (2 colunas):** Cartões lado a lado com `flex-1` e `gap-3` (`12px`) para comparar Entradas vs. Saídas ou 4 mini-cards em `flex-wrap` (`min-w-[46%]`) no resumo do Planejador IA (Renda Confiável, Piso Blindado, Reserva Recomendada e Margem Ajustável).
  - **Sub-cartões de Lista:** Linhas de compromissos pendentes, potes orçamentários e contas bancárias usam padding interno compacto de `12px` a `14px` (`p-3` / `p-3.5`) sobre fundo `#080c10` (`bg-background/70`), criando separação visual clara dentro do cartão pai (`#0e141d`).

## Elevation & Depth

O sistema adota **camadas tonais estruturais com bordas hairline de 1px** em vez de sombras projetadas difusas. A hierarquia de profundidade no modo escuro é construída em três níveis cromáticos nítidos: o fundo profundo *Obsidian Vault* (`#080c10`), os contêineres elevados em *Slate Ledger* (`#0e141d`) contornados por *Steel Hairline* (`#1a2332`), e os elementos interativos ou sub-blocos internos que recuam novamente para `#080c10` ou avançam para *Tactical Slate* (`#161f2c`). Sombras são reservadas estritamente para modais e diálogos flutuantes (`Dialog` e `AlertDialog`) sobrepostos ao backdrop escurecido (`bg-black/80`).

### Shadow Vocabulary
- **Card Surface Rest** (`box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05)`): Sombra mínima apenas para suporte estrutural no modo claro; no modo escuro a separação é 100% governada pela borda de `1px solid #1a2332`.
- **Modal Vault Overlay** (`box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.55)`): Elevação exclusiva para diálogos modais (`FinanceFormModal`, confirmação de exclusão e visualizador LGPD) sobre backdrop `rgba(0, 0, 0, 0.80)`.

### Named Rules
**The Structural Hairline Rule.** Nenhum cartão, pílula de cotação ou bloco de resumo flutua solto sobre o fundo sem uma borda explícita de `1px` (`border-border` / `#1a2332` no escuro, `#e2e8f0` no claro).

**The No-Neobrutalism Rule.** Sombras sólidas sem desfoque (offset duro) e bordas espessas pretas são estritamente proibidas em qualquer superfície do Rumvel.

## Shapes

A linguagem formal combina geometria retangular precisa com cantos suavizados de raio moderado, transmitindo solidez técnica sem rigidez cortante:

- **Cartões, Modais e Painéis Principais (`rounded-lg` / `rounded-xl`):** Raio base de `12px` (`0.75rem`) com borda contínua de `1px`.
- **Botões, Inputs e Sub-blocos de Métricas (`rounded-md` / `rounded-lg`):** Raio intermediário de `8px` a `10px` (`calc(var(--radius) - 2px)`), alinhando-se concentricamente quando aninhados dentro de cartões de `12px`.
- **Badges, Avatares e Indicadores de Categoria (`rounded-full`):** Pílulas perfeitamente circulares (`9999px`) para selos de status, pontos de cor de categoria (`10px–12px`) e botões de ícone no cabeçalho.
- **Barras de Progresso (`Progress`):** Trilhos horizontais enxutos de `8px` a `10px` de altura (`h-2` / `h-2.5`) com extremidades arredondadas (`rounded-full`).

## Components

Todos os componentes seguem a filosofia **"Tactile, compact, and instrument-grade"** — resposta imediata ao toque, densidade informacional calibrada e zero ornamento supérfluo.

### Buttons
- **Shape:** Cantos suavizados (`10px` radius), altura padrão de `40px` (`h-10`) e variante compacta de `36px` (`h-9` / `size="sm"`) ou `28px–32px` (`h-7` / `h-8`) para ações inline em listas.
- **Primary:** Fundo *Emerald Vector* (`#00d494`), texto *Primary Ink* (`#041f16`) em negrito (`700`), padding horizontal de `16px`.
- **Hover / Focus / Active:** Redução sutil de opacidade (`active:opacity-90`) no toque nativo e anel de foco `ring-ring` (`#00d494`).
- **Secondary / Outline / Destructive:**
  - *Secondary:* Fundo `#161f2c` ou superfície esmeralda translúcida (`bg-primary/15` com borda `border-primary/40` e texto `#00d494`) para ações de destaque secundário como "+ Receita", "Abrir IA" e "Modo Sandbox".
  - *Outline:* Fundo transparente ou `#0e141d` com borda `#1a2332` e texto `#f3f6fa`, usado em seletores de categoria, conta e filtros.
  - *Destructive:* Fundo *Crimson Alert* (`#f43f5e`) com texto branco em negrito para exclusões confirmadas e ativação do Modo Resgate de Dívidas.

### Chips
- **Style:** Pílulas compactas (`height: 16px–24px`, `padding: 2px 8px`) com tipografia em caixa alta (`9px–10px`, peso `700`).
- **State:**
  - *Status de Lançamento:* `PAGO`/`RECEBIDO` em contorno neutro (`outline`), `PENDENTE` em fundo `#161f2c`, `ATRASADO` em fundo `#f43f5e`.
  - *Proteção IA:* Badge `BLINDADO` com ícone de cadeado, fundo âmbar translúcido (`rgba(245, 158, 11, 0.15)`), borda `rgba(245, 158, 11, 0.40)` e texto `#fbbf24`.
  - *Sandbox:* Badge `SANDBOX` em esmeralda translúcido (`bg-primary/15`, borda `border-primary/30`, texto `#00d494`).

### Cards / Containers
- **Corner Style:** `12px` (`rounded-xl`).
- **Background:** *Slate Ledger* (`#0e141d`) para o cartão principal; sub-itens internos utilizam *Obsidian Vault* (`#080c10` com `60%–70%` de opacidade).
- **Shadow Strategy:** Sem sombra no modo escuro (delimitação por borda hairline); sombra mínima `shadow-sm` no modo claro.
- **Border:** `1px solid #1a2332` (`border-border`), mudando para `border-primary/30` ou `border-primary/40` em cartões de destaque da IA.
- **Internal Padding:** `16px` (`p-4`) em cartões padrão e `14px` (`p-3.5`) em itens densos de extrato.

### Inputs / Fields
- **Style:** Altura de `40px` (`h-10`), raio de `10px` (`rounded-md`), fundo `#080c10` (`bg-background`), borda `1px solid #1a2332` e texto `#f3f6fa` (`14px`). Campos numéricos de moeda aplicam obrigatoriamente `TABULAR_NUMS`.
- **Focus:** Anel de foco esmeralda (`#00d494`) e transição imediata de borda.
- **Error / Disabled:** Opacidade `50%` quando desabilitado; mensagens de erro aparecem em contêiner dedicado com borda `border-destructive/40`, fundo `bg-destructive/10` e texto `#f43f5e`.

### Navigation
- **Bottom Tab Bar (`app/(tabs)/_layout.tsx`):** Barra inferior fixa com `64px` de altura, fundo `#0e141d`, borda superior `1px solid #1a2332`, 5 destinos principais (*Início*, *Lançamentos*, *Planejador*, *Orçamentos*, *Contas*), rótulos em `11px` bold (`700`), indicador pontual esmeralda sob o ícone ativo (`#00d494` no escuro, `#047857` no claro) e inativo em `#64748b`.
- **Segmented Tabs (`components/ui/tabs.tsx`):** Controle segmentado horizontal com fundo `#0e141d` e borda `#1a2332` para alternar sub-visões sem sair da tela (ex.: *Diagnóstico & Perfil* vs. *Plano 9 Potes* no Planejador IA; *Orçamentos* vs. *Metas* vs. *Categorias*).

### Brand Assets, Mascot Showcase & Finance Badges (Paridade Web `Front-Monvix`)
- **`RumvelLogo` (`components/brand/RumvelLogo.tsx`):** Emblema oficial Proposal 03 (texugo-do-mel caminhando sobre o wordmark `rumvel`), alternando automaticamente entre `assets/images/emblem-dark.png` no modo escuro e `assets/images/emblem-light.png` no modo claro, com suporte aos tamanhos `xs`, `sm`, `md`, `lg` e `xl`, além de variante `variant="symbol"` (`favicon-walking.png`).
- **`RumvelShowcase` (`components/brand/RumvelShowcase.tsx`):** Painel editorial da tela de Login/Cadastro (`app/auth.tsx`) exibindo a ilustração oficial *O Companheiro* (`assets/images/companion-saver.png`) sobre disco circular (`#344c32` no escuro / `#dae4c7` no claro) e superfície sálvia/floresta (`#253d2c` no escuro / `#e8eedc` no claro), acompanhada do manifesto *"Rumvel, o texugo das finanças."* e *"O essencial protegido. O seu próximo passo, mais claro."*.
- **`BankBadge` (`components/finance/BankBadge.tsx`):** Emblema quadrado arredondado (`sm`, `md`, `lg`) com detecção automática (`matchBank`) para 17 instituições financeiras brasileiras (Nubank, Itaú, Inter, Bradesco, Santander, Banco do Brasil, Caixa, C6 Bank, BTG Pactual, XP, PicPay, Mercado Pago, PagBank, Neon, Sicoob, Sicredi e Carteira Física) com suas cores e monogramas oficiais.
- **`CategoryBadge` & `CategoryIconPicker` (`components/finance/CategoryBadge.tsx`):** Sistema de 40 ícones vetoriais selecionáveis (`SELECTABLE_ICONS`), 16 cores predefinidas (`PRESET_COLORS`) e mapeamento semântico automático (`EXACT_CATEGORY_MAP` / `getCategoryMeta`) para categorias de despesa e receita em todo o aplicativo.

### Financial Pulse & Allocation Bucket Cards
- **Compromissos 1-Toque:** Linha horizontal combinando badge de status (`ATRASADO`/`PENDENTE`), data tabular, descrição, categoria/conta, valor tabular à direita e botão de ação imediata (`Pagar`/`Receber`) com atualização otimista de saldo.
- **Card de Pote Orçamentário (9 Potes IA):** Bloco estruturado exibindo indicador circular colorido do pote, nome da categoria, badge `BLINDADO` (quando `kind === 'PROTECTED'`), valor em R$ e percentual exato (soma garantida de 100% via Hare-Niemeyer), barra de progresso horizontal e justificativa analítica (`reason`) abaixo.

## Do's and Don'ts

### Do:
- **Do** aplique `TABULAR_NUMS` (`fontVariant: ['tabular-nums']`) em absolutamente todos os valores monetários, percentuais, contadores de parcelas, datas e indicadores do BCB/AwesomeAPI.
- **Do** respeite o Modo Privacidade passando o estado `privateMode` para `formatBrlCurrency(amount, privateMode)` em todas as exibições de dinheiro.
- **Do** mantenha o contraste de texto acima de 4.5:1 e use bordas *hairline* de `1px` (`#1a2332` no escuro, `#e2e8f0` no claro) para separar superfícies tonais.
- **Do** sinalize obrigações protegidas (pensão alimentícia e piso de moradia/sobrevivência) com o badge `BLINDADO` e ícone de cadeado para reforçar a segurança matemática do motor.
- **Do** ofereça ações rápidas de 1 toque (`Pagar`, `Receber`, `Estornar`, `Aplicar 9 Potes aos Orçamentos`) com feedback imediato de estado.

### Don't:
- **Don't** aplique gradientes coloridos sobre textos (*gradient text*) em títulos, saldos ou botões.
- **Don't** utilize elementos de gamificação infantil (confetes, fogos, mascotes caricatos animados ou troféus) ao concluir pagamentos ou metas.
- **Don't** use sombras duras neobrutalistas ou brilhos neon exagerados (`drop-shadow` fluorescente) que comprometam a sobriedade bancária.
- **Don't** exiba percentuais dos 9 potes orçamentários com casas decimais quebradas que não somem exatamente `100%`.
- **Don't** oculte ações críticas de conformidade LGPD (exportação JSON e exclusão definitiva de conta); mantenha-as acessíveis e transparentes na aba *Contas*.
