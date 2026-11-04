---
target: app/(tabs)/index.tsx
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\03573608183\\Documents\\GitHub\\rumvel-mobile\\app\\(tabs)\\index.tsx"
target_fingerprint: "sha256:ed8a87d3bf673c0cbf1f2a3ad2d36551f6a6353be3e4b2b97ccd7a836028d361"
target_path: "C:\\Users\\03573608183\\Documents\\GitHub\\rumvel-mobile\\app\\(tabs)\\index.tsx"
timestamp: 2026-11-04T18-49-16Z
slug: app-tabs-index-tsx
---
Method: dual-agent (A: 64dedbfc-0c06-4d21-abab-8c67b67f1464 · B: b67fe0d5-f65e-49b0-8fa4-9eba0632c714)

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3 | Bons esqueletos de carregamento e baixa otimista em 1 toque, mas o badge `DEMO` e o nome do usuário no `AppHeader` colapsam para `IA ...` em telas de 360dp–390dp. |
| 2 | Match System / Real World | 3 | Vocabulário financeiro brasileiro autêntico (`CLT`, `PJ`, `Selic`, `IPCA`, `Pensão Alimentícia`, 17 bancos), mas o `FinanceFormModal` exige digitação de data em formato ISO `AAAA-MM-DD`. |
| 3 | User Control and Freedom | 2 | Tocar em `Efetivar` em "Próximos lançamentos" remove o item imediatamente sem toast de "Desfazer"; excluir orçamento, meta, categoria ou conta bancária ocorre instantaneamente sem diálogo de confirmação. |
| 4 | Consistency and Standards | 3 | `DESIGN.md` define o app como *Dark-First* (`#080c10`) e o Saldo Realizado em escala *Display* (`30px`), mas o app inicializa no Modo Claro no Android e nivela o saldo principal em `18px` (`text-lg`). |
| 5 | Error Prevention | 2 | Botões destrutivos de lixeira com `24dp–28dp` (`h-6 w-6` / `h-7 w-7`) ficam a apenas `4dp` do botão de edição em `budgets.tsx` e `accounts.tsx` sem confirmação (`AlertDialog`). |
| 6 | Recognition Rather Than Recall | 3 | `BankBadge` e `CategoryBadge` tornam o reconhecimento imediato, mas o seletor de contas no modal de lançamento não exibe o saldo atual de cada conta. |
| 7 | Flexibility and Efficiency | 3 | Atalhos excelentes (Sandbox em 1 toque, sincronização de renda no Planejador, cópia de orçamento para o próximo mês), mas o filtro de `transactions.tsx` mistura Tipo e Status no mesmo estado. |
| 8 | Aesthetic and Minimalist Design | 2 | `AppHeader` espreme 7 elementos em uma única linha (`IA ...`); `auth.tsx` exibe 3 botões sociais permanentemente desativados; subtítulos do grid 2×2 truncam no meio da palavra (`incluíd...`, `perí...`). |
| 9 | Error Recovery | 4 | Banners claros de erro com ação direta (`Tentar novamente` no Dashboard, alerta tático de déficit com botão `Ativar Modo Quitação de Dívidas` no Planejador). |
| 10 | Help and Documentation | 3 | Subtítulos autoexplicativos, modal LGPD transparente na autenticação e justificativa analítica (`reason`) abaixo de cada um dos 9 potes do Algoritmo Genético. |
| **Total** | | **28/40** | **Good (Base sólida de domínio, mas com atritos importantes de adaptação mobile e prevenção de erros)** |

---

### Design Specificity Verdict

**LLM assessment**: O **Rumvel Mobile** possui forte especificidade de domínio brasileiro quando comparado a rastreadores genéricos: os monogramas oficiais de 17 bancos nacionais (`BankBadge`), os 40 ícones semânticos (`CategoryBadge`), a blindagem matemática de *Pensão Alimentícia* e *Moradia* pelo Algoritmo Genético (Hare-Niemeyer com soma exata de 100%) e a calculadora de 12 meses CDI (líquido de 17,5% de IR) vs. IPCA + Poupança ancoram o produto no mundo real. Além disso, o emblema do texugo-do-mel (`RumvelLogo`) e o painel editorial *O Companheiro* (`RumvelShowcase`) conferem personalidade própria. Porém, essa especificidade sofre em dois pontos: (1) a direção *Dark-First* (*The Tactical Vault* sobre `#080c10`) documentada no `DESIGN.md` não aparece por padrão porque `app/_layout.tsx` herda `'light'` do sistema Android, entregando uma folha clara com barras de progresso pretas (`#0f172a`) que destoam dos ícones pastéis; e (2) várias estruturas foram portadas diretamente da ergonomia desktop/web (`Front-Monvix`) sem adaptação para a largura de 360dp–390dp do celular.

**Deterministic scan**: O scanner estático (`impeccable detect --json`) retornou código `0` (0 erros bloqueantes), registrando **2 avisos (`advisory`)** no alvo primário `app/(tabs)/index.tsx` e **77 avisos (`advisory`)** no escopo completo `app/` + `components/`:
- **`design-system-color` (42 avisos — Falsos Positivos):** 16 cores hexadecimais em `components/finance/BankBadge.tsx` (linhas 31–181) e 26 ocorrências em `components/finance/CategoryBadge.tsx` (linhas 166–262). São **falsos positivos**: tratam-se das cores oficiais das instituições bancárias (Nubank `#820ad1`, Itaú `#ec7000`, etc.) e da paleta semântica de categorias documentadas na prosa do `DESIGN.md` (linhas 244–245), mas ausentes do bloco YAML frontmatter `colors:`.
- **`design-system-font-size` (35 avisos — Misto de Drift de Frontmatter e Achados Reais):**
  - *Falsos positivos por drift de frontmatter (26 avisos):* 25 ocorrências de `text-[10px]` (incluindo `app/(tabs)/index.tsx:448` e `725`) e 1 de `text-[12px]` (`app/auth.tsx:646`), tamanhos explicitamente permitidos no corpo do `DESIGN.md` (linhas 164–165 e 219), mas não listados no YAML frontmatter escalar.
  - *Achados reais capturados pelo detector que escapam à leitura rápida (9 avisos):* Uso de micro-tipografia abaixo do piso de legibilidade (`text-[8px]` para o badge `DEMO` em `components/finance/AppHeader.tsx:91` e `text-[9px]` em `budgets.tsx:543`, `planner.tsx:718`, `transactions.tsx:349, 357`) e tamanho fora da escala (`text-[13px]` em `app/auth.tsx:389, 420, 490, 624`).

**Visual overlays**: Como o alvo é um aplicativo nativo React Native / Expo renderizado na hierarquia de views do Android (`emulator-5554`) e não em um DOM HTML/CSS de navegador, não há overlay `detect.js` injetável em navegador; a evidência visual foi coletada diretamente das 5 capturas nativas do emulador Android (`1080×2400`), que confirmaram e ampliaram os achados da revisão de código.

---

### Overall Impression

A conversão da identidade do site para o aplicativo deu ao **Rumvel Mobile** uma presença visual autêntica — especialmente na tela de Login com o mascote *O Companheiro* e nos selos de bancos e categorias. No entanto, o porte direto de layouts web para uma tela de celular de 360dp–390dp criou **compressão severa no topo (`AppHeader` truncando o nome do usuário para `IA ...`), colisão da barra de abas inferior com a pílula de gestos do Android, barras de progresso pretas no Modo Claro e perda da hierarquia do Saldo Realizado + Saldo Projetado**. A maior oportunidade agora é adaptar a ergonomia dessas superfícies para o polegar mobile e blindar ações destrutivas.

---

### What's Working

1. **Autenticidade de Domínio Financeiro Brasileiro (`BankBadge.tsx`, `CategoryBadge.tsx`, `planner.tsx`):** O reconhecimento automático de 17 bancos nacionais com seus monogramas oficiais, somado aos 40 ícones de categorias e à proteção explícita (`Protegido` com cadeado) para *Pensão Alimentícia* e *Moradia* no motor Hare-Niemeyer, transmite respeito imediato pela realidade financeira do usuário.
2. **Rigor Contábil com Algarismos Tabulares e Paridade de Privacidade (`lib/formatters.ts`):** Todos os saldos, percentuais dos 9 potes, contadores de parcelas (`1/10`) e cotações de mercado aplicam `TABULAR_NUMS` (`fontVariant: ['tabular-nums']`) e respeitam a máscara `R$ ••••,••` em 1 toque sem deslocar o layout.
3. **Ciclo Fechado entre Diagnóstico IA e Execução Mensal (`planner.tsx` → `budgets.tsx`):** A capacidade de simular os 9 potes orçamentários e provisionar automaticamente os tetos mensais de categorias em 1 toque (`Aplicar aos Orçamentos`) transforma recomendação analítica em controle prático imediato.

---

### Priority Issues

- **[P0] What**: **`AppHeader` em linha única esmaga a identidade do usuário para `IA ...`, oculta o badge `DEMO` e corta a faixa de mercado** (`components/finance/AppHeader.tsx:68-181`, visível em `screen-inside-top.png`).
  - **Why it matters**: Empilhar `RumvelLogo` (`68dp`) + divisor + Avatar (`28dp`) + Nome + badge `DEMO` (`8px`) + seletor `< Nov de 2026 >` + 3 botões de ícone na mesma linha deixa menos de `15dp` para o nome do usuário, renderizando literalmente `IA ...` em todas as telas do app. Além disso, a faixa horizontal de cotações (`ScrollView`) não aplica sangria (`-mx-4 px-4`), cortando o card `SELIC` ao meio (`"SE"`) a 16dp da borda direita.
  - **Fix**: Reorganizar o `AppHeader` em duas faixas limpas para mobile: (1) Linha superior com `RumvelLogo size="xs"`, badge `DEMO` legível (`10px`) à esquerda e os controles utilitários (`Eye`, `Refresh`, `Theme` + Avatar `IA` acionável) à direita; (2) Incorporar o seletor de competência `< Nov de 2026 >` alinhado à direita do título da página ou em uma barra de contexto dedicada, e aplicar `-mx-4 px-4` no `ScrollView` de indicadores de mercado.
  - **Suggested command**: `/impeccable adapt`

- **[P1] What**: **Colisão da Barra de Abas Inferior (`_layout.tsx`) com a Pílula de Gestos do Android e Alvos de Toque Destrutivos Sem Confirmação (`24dp–28dp`)** (`app/(tabs)/_layout.tsx:26-33`, `app/(tabs)/budgets.tsx:343-366`, `app/(tabs)/accounts.tsx:272-280`).
  - **Why it matters**: Nas capturas do emulador (`screen-inside-top.png`), `tabBarStyle` usa `height: 64` fixo sem somar `useSafeAreaInsets().bottom`, fazendo a barra de gestos do Android riscar os rótulos *"Lançamentos"*, *"Planejador"* e *"Orçamentos"*. Além disso, em `budgets.tsx` e `accounts.tsx`, os botões de excluir têm apenas `24dp–28dp` (`h-6 w-6` / `h-7 w-7`), ficam a `4dp` do botão Editar e **disparam exclusão imediata (`DELETE`) sem diálogo de confirmação**, causando perda acidental de dados com o polegar.
  - **Fix**: (1) Em `app/(tabs)/_layout.tsx`, ler `const insets = useSafeAreaInsets()` e definir `height: 58 + insets.bottom` e `paddingBottom: Math.max(8, insets.bottom)`; (2) Adicionar `AlertDialog` de confirmação antes de excluir qualquer Orçamento, Meta, Categoria, Tag ou Conta Bancária; (3) Ampliar os botões de ação em listas para no mínimo `h-8 w-8` com `hitSlop={8}` e `gap-1.5`.
  - **Suggested command**: `/impeccable harden`

- **[P1] What**: **App "Dark-First" inicializa no Modo Claro no Android e renderiza barras de progresso quase pretas (`#0f172a`) em "Despesas por categoria"** (`app/_layout.tsx:56-62`, `components/ui/progress.tsx:74`, `app/(tabs)/index.tsx:454`, visível em `screen-inside-banks.png`).
  - **Why it matters**: `app/_layout.tsx` verifica `if (!colorScheme) setColorScheme('dark')`, mas como o React Native no Android já inicializa `colorScheme` como `'light'`, o app abre sempre no Modo Claro em vez da atmosfera *The Tactical Vault* (`#080c10`). Pior: em `components/ui/progress.tsx:74`, o `NativeIndicator` usa `bg-foreground` (`#0f172a`) como padrão (enquanto o `WebIndicator` usa `bg-primary`), gerando 5 barras pretas pesadas sob os ícones coloridos de `CategoryBadge`.
  - **Fix**: (1) Em `app/_layout.tsx`, inicializar explicitamente `setColorScheme('dark')` na primeira montagem via `useRef(false)`; (2) Em `components/ui/progress.tsx:74`, alinhar o padrão do `NativeIndicator` para `bg-primary` e permitir cor dinâmica da categoria em `index.tsx:454`; (3) Em `planner.tsx`, trocar `text-amber-400` e `text-sky-400` por pares adaptativos (`text-amber-600 dark:text-amber-400`, `text-sky-600 dark:text-sky-400`).
  - **Suggested command**: `/impeccable colorize`

- **[P2] What**: **Achatamento da hierarquia no Dashboard, ausência do Saldo Projetado e truncamento de frases no grid 2×2 e em "Próximos lançamentos"** (`app/(tabs)/index.tsx:198-346, 585-633`, visível em `screen-inside-top.png` e `screen-inside-categories.png`).
  - **Why it matters**: O `Saldo realizado` (`R$ 39.979,50`) está espremido em `18px` (`text-lg`) dentro de um mini-card de 2 colunas com o mesmo peso visual de "Média de gasto diário", enquanto o `Saldo projetado` (prometido no `PRODUCT.md`) não aparece no Dashboard e 3 dos 4 subtítulos cortam no meio da palavra (`"Saldo atual das contas incluíd..."`, `"Efetivadas e previstas no perí..."`). Em "Próximos lançamentos", colocar ícone + título/conta + valor + botão `Efetivar` na mesma linha trunca quase todas as descrições (`"Energia Elétrica + Fibra Ó..."`).
  - **Fix**: (1) Transformar o `Saldo Consolidado Realizado` em um card Hero de largura total no topo com tipografia *Display* (`text-3xl font-extrabold`), exibindo logo abaixo o `Saldo Projetado` e a `Média Diária`; (2) Deixar `Entradas do mês` e `Saídas do mês` em 2 colunas com legendas concisas que nunca truncam (`"Recebidas e previstas"`, `"Pagas e pendentes"`); (3) Ocultar/compactar o banner do Planejador IA quando o usuário já possui orçamentos ativos no mês.
  - **Suggested command**: `/impeccable layout`

- **[P2] What**: **Botões de Login Social desativados na porta de entrada (`auth.tsx`), filtros de lançamentos misturados (`transactions.tsx`) e data ISO manual no modal (`FinanceFormModal.tsx`)** (`app/auth.tsx:264, 631-652`, `app/(tabs)/transactions.tsx:182-207`, `components/finance/FinanceFormModal.tsx:501-579`).
  - **Why it matters**: Exibir 3 botões grandes (Apple, Google, Meta) apenas para dizer *"indisponíveis no momento"* logo abaixo transmite sensação de app inacabado (além de repetir o botão de Demonstração duas vezes na mesma tela). Já em `transactions.tsx`, misturar Natureza (`Despesas`) e Status (`Atrasados`) no mesmo estado impede filtrar "Despesas Atrasadas", e em `FinanceFormModal.tsx` exigir `AAAA-MM-DD` e limitar `CategoryIconPicker` a `.slice(0, 18)` (escondendo 22 dos 40 ícones) cria atrito desnecessário.
  - **Fix**: (1) Em `auth.tsx`, remover ou recolher os botões sociais indisponíveis e unificar o CTA de Sandbox; (2) Em `transactions.tsx`, separar o filtro de Tipo (`Todos | Receitas | Despesas | Transf.`) do filtro de Status (`Todos | Pendentes | Atrasados | Pagos`); (3) Em `FinanceFormModal.tsx`, aceitar formato brasileiro `DD/MM/AAAA` com chips rápidos (`Hoje`, `Ontem`, `Amanhã`) e exibir todos os 40 ícones no `CategoryIconPicker`.
  - **Suggested command**: `/impeccable polish`

---

### Persona Red Flags

- **Alex (Impatient Power User)**:
  - Não consegue combinar filtros em [`transactions.tsx`](file:///C:/Users/03573608183/Documents/GitHub/rumvel-mobile/app/%28tabs%29/transactions.tsx#L182-L207) para ver apenas **Despesas Atrasadas**, porque tipo e status disputam o mesmo estado `activeFilter`.
  - Ao lançar uma despesa de ontem no [`FinanceFormModal.tsx`](file:///C:/Users/03573608183/Documents/GitHub/rumvel-mobile/components/finance/FinanceFormModal.tsx#L501-L510), precisa editar manualmente uma string ISO `2026-11-04` sem atalhos de 1 toque (`Hoje` / `Ontem`).
  - Na criação de categoria ([`CategoryBadge.tsx`](file:///C:/Users/03573608183/Documents/GitHub/rumvel-mobile/components/finance/CategoryBadge.tsx#L444)), vê apenas 18 dos 40 ícones disponíveis por causa de um `.slice(0, 18)` fixo.

- **Sam (Accessibility-Dependent User)**:
  - Alvos de toque de `24dp × 24dp` (`h-6 w-6`) em [`transactions.tsx`](file:///C:/Users/03573608183/Documents/GitHub/rumvel-mobile/app/%28tabs%29/transactions.tsx#L425-L441) e `28dp × 28dp` (`h-7 w-7`) em [`budgets.tsx`](file:///C:/Users/03573608183/Documents/GitHub/rumvel-mobile/app/%28tabs%29/budgets.tsx#L343-L366) ficam muito abaixo do mínimo de `44×44dp`, com risco crítico de toque acidental.
  - Textos em `8px` (`DEMO` em [`AppHeader.tsx`](file:///C:/Users/03573608183/Documents/GitHub/rumvel-mobile/components/finance/AppHeader.tsx#L91)) e `9px` violam o piso de legibilidade mobile, e truncamentos forçados com `numberOfLines={1}` (`"IA ..."`, `"incluíd..."`, `"perí..."`) cortam informação essencial sem alternativa de leitura.

- **Casey (Distracted Mobile User — Uso com Uma Mão no Transporte)**:
  - Rolando o card "Próximos lançamentos" com o polegar direito, um toque acidental em `Efetivar` ([`index.tsx`](file:///C:/Users/03573608183/Documents/GitHub/rumvel-mobile/app/%28tabs%29/index.tsx#L619-L630)) baixa a conta e a faz sumir da lista imediatamente sem aviso ou botão "Desfazer".
  - Na barra inferior ([`_layout.tsx`](file:///C:/Users/03573608183/Documents/GitHub/rumvel-mobile/app/%28tabs%29/_layout.tsx#L26-L33)), a pílula de gestos do Android se sobrepõe aos rótulos das abas centrais, facilitando gestos acidentais de minimizar o app ao tentar trocar para *Planejador*.

- **Marcos / Helena (Chefe de Família com Obrigações Blindadas — Persona do `PRODUCT.md`)**:
  - Sente confiança imediata ao ver *Pensão Alimentícia* e *Moradia* tratadas como piso `Protegido` no Planejador IA, mas ao abrir a tela inicial ([`index.tsx`](file:///C:/Users/03573608183/Documents/GitHub/rumvel-mobile/app/%28tabs%29/index.tsx#L253-L346)) sente falta do **Saldo Projetado do Mês** ao lado do Saldo Realizado para saber quanto restará após pagar os compromissos pendentes (*Plano de Saúde Unimed*, *Energia Elétrica*).

---

### Minor Observations

- **Duplicidade de CTA Demo em `auth.tsx`**: O botão "Modo Demonstração" aparece no topo direito (`linha 264`) e novamente no rodapé do card como "Explorar Ambiente Demonstração (Sandbox)" (`linha 652`).
- **Cor Semântica do IPCA no Ticker (`AppHeader.tsx:202`)**: O código pinta o `IPCA` em verde esmeralda (`text-primary`), o que sugere visualmente "ganho/alta positiva" para um índice de inflação.
- **Drift entre Frontmatter e Prosa no `DESIGN.md`**: O bloco YAML no topo do `DESIGN.md` lista apenas 5 tamanhos escalares de fonte, enquanto a documentação textual autoriza `10px` e `12px`, gerando 26 avisos falsos-positivos no `impeccable detect`.

---

### Questions to Consider

- *"Se o Rumvel Mobile foi concebido como 'The Tactical Vault' (Dark-First sobre `#080c10`), por que a primeira experiência de qualquer usuário no Android ainda é uma tela branca com barras de progresso pretas?"*
- *"Depois que o usuário já configurou e aplicou seus 9 potes orçamentários, o banner promocional do Planejador IA ainda merece ocupar o espaço mais nobre acima do Saldo Realizado em todas as aberturas do app?"*
- *"Vale a pena exibir três botões grandes de login social desativados ('Apple, Google e Meta indisponíveis no momento') na porta de entrada de um cofre financeiro, ou a tela ganha muito mais autoridade exibindo apenas o que funciona com precisão?"*
