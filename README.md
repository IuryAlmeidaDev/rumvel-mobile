# Rumvel Mobile (MVP)

Aplicativo mobile oficial do ecossistema **Rumvel** (*Committed Banking Precision*), construído com **React Native (Expo Router)**, **NativeWind v4** e a biblioteca completa de componentes do **[React Native Reusables](https://reactnativereusables.com/)**.

Integra todas as rotas e regras de negócio dos três repositórios do ecossistema:
- **Backend API (`IuryAlmeidaDev/rumvel-api`)**: Autenticação JWT + Refresh Token + OTP, Contas, Saldos Realizados/Projetados, Lançamentos, Transferências, Parcelamentos (2x–120x), Recorrências, Orçamentos, Metas de Receita, Categorias, Tags e Portabilidade/Exclusão LGPD.
- **Motor IA / Algoritmo Genético (`IuryAlmeidaDev/rumvel-ga-engine`)**: Otimização orçamentária em 9 potes (`housing`, `food`, `transport`, `health`, `family`, `lifestyle`, `debt`, `emergency`, `investments`) com blindagem de pensão alimentícia e obrigações essenciais, arredondamento exato de 100% pelo método de **Hare-Niemeyer** e provisionamento automático de orçamentos em 1 toque.
- **Design System & Produto (`IuryAlmeidaDev/rumvel-web`)**: Paleta Dark-First (`#080c10` background, `#0e141d` surface, `#00d494` Emerald Vector), algarismos tabulares (`tabular-nums`), Modo Privacidade (`R$ ••••,••`), Modo Sandbox Offline/Demo pré-populado e indicadores de mercado em tempo real (`AwesomeAPI` + `BrasilAPI`).

## Como Executar

```bash
cd C:\Users\03573608183\rumvel-mobile

# Iniciar no Expo (Android / iOS / Web)
npm run dev

# Executar checagem estática de tipos (TypeScript)
npm run typecheck

# Executar suíte de testes automatizados (Vitest)
npm run test:run
```

## Variáveis de Ambiente (Opcional)

Por padrão, o app aponta para `https://rumvel.me` e também oferece o **Modo Sandbox (Demonstração)** direto na tela de login para uso completo sem necessidade de backend local rodando. Para apontar para um backend local:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080
EXPO_PUBLIC_AUTH_API_URL=http://10.0.2.2:8080/api/auth
EXPO_PUBLIC_FINANCE_API_URL=http://10.0.2.2:8080/api/finance
EXPO_PUBLIC_GA_API_URL=http://10.0.2.2:8000/api/ai
```
