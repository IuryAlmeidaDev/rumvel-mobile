import React from 'react';
import { Pressable, View } from 'react-native';
import {
  AppleIcon,
  BabyIcon,
  BookOpenIcon,
  BriefcaseIcon,
  Building2Icon,
  BusIcon,
  CarIcon,
  CarTaxiFrontIcon,
  CheckIcon,
  CircleDollarSignIcon,
  CircleParkingIcon,
  CoffeeIcon,
  CoinsIcon,
  CreditCardIcon,
  DropletsIcon,
  DumbbellIcon,
  FileTextIcon,
  FilmIcon,
  FlameIcon,
  FuelIcon,
  Gamepad2Icon,
  GiftIcon,
  GraduationCapIcon,
  HeadphonesIcon,
  HeartPulseIcon,
  HomeIcon,
  HospitalIcon,
  LayersIcon,
  type LucideIcon,
  MusicIcon,
  PawPrintIcon,
  PencilIcon,
  PercentIcon,
  PiggyBankIcon,
  PillIcon,
  PizzaIcon,
  PlaneIcon,
  ReceiptIcon,
  RepeatIcon,
  ScaleIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  ShirtIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SmartphoneIcon,
  SparklesIcon,
  StethoscopeIcon,
  TrendingUpIcon,
  TvIcon,
  UtensilsIcon,
  WalletIcon,
  WifiIcon,
  WrenchIcon,
  ZapIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export interface CategoryIconMeta {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

export interface SelectableIcon {
  slug: string;
  name: string;
  keywords: string;
  icon: LucideIcon;
  defaultColor: string;
}

export const PRESET_COLORS = [
  '#10b981', // Esmeralda / Verde
  '#059669', // Verde Floresta
  '#0284c7', // Azul Oceano
  '#3b82f6', // Azul Cobalto
  '#6366f1', // Índigo / Roxo Azulado
  '#8b5cf6', // Violeta / Roxo
  '#ec4899', // Rosa
  '#f43f5e', // Cereja / Vermelho Rosado
  '#f59e0b', // Âmbar / Laranja
  '#ef4444', // Vermelho Alerta
  '#64748b', // Ardósia / Neutro
];

export const SELECTABLE_ICONS: SelectableIcon[] = [
  { slug: 'utensils', name: 'Alimentação', keywords: 'comida restaurante almoco janta prato refeicao', icon: UtensilsIcon, defaultColor: '#10b981' },
  { slug: 'shopping-cart', name: 'Supermercado', keywords: 'mercado compras feira carrinho compras', icon: ShoppingCartIcon, defaultColor: '#059669' },
  { slug: 'coffee', name: 'Café / Lanches', keywords: 'cafe padaria lanche copo barista bebida', icon: CoffeeIcon, defaultColor: '#f59e0b' },
  { slug: 'pizza', name: 'Delivery / Pizza', keywords: 'comida rapida pizza lanche ifood hamburger', icon: PizzaIcon, defaultColor: '#f59e0b' },
  { slug: 'apple', name: 'Hortifruti', keywords: 'fruta feira verdura saude legumes natural', icon: AppleIcon, defaultColor: '#10b981' },
  { slug: 'home', name: 'Moradia', keywords: 'casa apartamento aluguel residencia lar', icon: HomeIcon, defaultColor: '#6366f1' },
  { slug: 'building-2', name: 'Condomínio', keywords: 'predio edificio condominio apartamento', icon: Building2Icon, defaultColor: '#6366f1' },
  { slug: 'zap', name: 'Energia / Luz', keywords: 'eletricidade conta luz energia eletrica', icon: ZapIcon, defaultColor: '#eab308' },
  { slug: 'droplets', name: 'Água / Saneamento', keywords: 'agua saneamento conta gotas sabesp', icon: DropletsIcon, defaultColor: '#06b6d4' },
  { slug: 'wifi', name: 'Internet / Rede', keywords: 'wifi banda larga internet conexao fibra', icon: WifiIcon, defaultColor: '#3b82f6' },
  { slug: 'car', name: 'Transporte / Carro', keywords: 'carro automovel veiculo transporte', icon: CarIcon, defaultColor: '#0284c7' },
  { slug: 'fuel', name: 'Combustível', keywords: 'gasolina etanol diesel posto abastecer alcool', icon: FuelIcon, defaultColor: '#0284c7' },
  { slug: 'bus', name: 'Transporte Público', keywords: 'onibus metro trem transporte conducao passagem', icon: BusIcon, defaultColor: '#0284c7' },
  { slug: 'circle-parking', name: 'Estacionamento', keywords: 'estacionamento vaga garagem park', icon: CircleParkingIcon, defaultColor: '#3b82f6' },
  { slug: 'wrench', name: 'Manutenção', keywords: 'oficina mecanico reparo conserto ferramenta reforma', icon: WrenchIcon, defaultColor: '#64748b' },
  { slug: 'heart-pulse', name: 'Saúde', keywords: 'saude medico consulta exame hospital checkup', icon: HeartPulseIcon, defaultColor: '#f43f5e' },
  { slug: 'pill', name: 'Farmácia', keywords: 'remedio medicamento farmacia pilula remedios', icon: PillIcon, defaultColor: '#f43f5e' },
  { slug: 'dumbbell', name: 'Academia / Esporte', keywords: 'musculacao exercicio esporte fitness treino crossfit', icon: DumbbellIcon, defaultColor: '#06b6d4' },
  { slug: 'graduation-cap', name: 'Educação', keywords: 'curso faculdade escola universidade estudo pos', icon: GraduationCapIcon, defaultColor: '#3b82f6' },
  { slug: 'book-open', name: 'Livros / Cursos', keywords: 'livro material leitura estudo apostila', icon: BookOpenIcon, defaultColor: '#3b82f6' },
  { slug: 'briefcase', name: 'Trabalho', keywords: 'trabalho emprego servico escritorio consultoria', icon: BriefcaseIcon, defaultColor: '#3b82f6' },
  { slug: 'wallet', name: 'Salário / Renda', keywords: 'salario dinheiro carteira receita ganho pagamento', icon: WalletIcon, defaultColor: '#10b981' },
  { slug: 'piggy-bank', name: 'Poupança / Reserva', keywords: 'cofrinho reserva economia guardar poupanca fundo', icon: PiggyBankIcon, defaultColor: '#10b981' },
  { slug: 'trending-up', name: 'Investimentos', keywords: 'acoes rendimento bolsa fii cdb lucro aportes', icon: TrendingUpIcon, defaultColor: '#8b5cf6' },
  { slug: 'coins', name: 'Rendimentos / Moedas', keywords: 'dividendos juros rendimento moedas pro-labore', icon: CoinsIcon, defaultColor: '#8b5cf6' },
  { slug: 'receipt', name: 'Contas / Faturas', keywords: 'boleto fatura cobranca imposto tributo darf', icon: ReceiptIcon, defaultColor: '#ef4444' },
  { slug: 'credit-card', name: 'Cartão de Crédito', keywords: 'cartao anuidade credito fatura banco nubank', icon: CreditCardIcon, defaultColor: '#ef4444' },
  { slug: 'shield-check', name: 'Seguros', keywords: 'seguro protecao apolice seguranca vida auto', icon: ShieldCheckIcon, defaultColor: '#059669' },
  { slug: 'gamepad-2', name: 'Jogos / Games', keywords: 'games jogo videogame lazer steam playstation', icon: Gamepad2Icon, defaultColor: '#ec4899' },
  { slug: 'film', name: 'Cinema / Vídeos', keywords: 'filme cinema streaming lazer pipoca', icon: FilmIcon, defaultColor: '#ec4899' },
  { slug: 'tv', name: 'Streaming / Assinaturas', keywords: 'netflix tv assinaturas streaming entretenimento', icon: TvIcon, defaultColor: '#8b5cf6' },
  { slug: 'music', name: 'Música / Shows', keywords: 'musica spotify show entretenimento concerto', icon: MusicIcon, defaultColor: '#ec4899' },
  { slug: 'smartphone', name: 'Celular / Telefone', keywords: 'celular telefone smartphone plano dados vivo claro', icon: SmartphoneIcon, defaultColor: '#8b5cf6' },
  { slug: 'plane', name: 'Viagens', keywords: 'viagem voo aviao hotel turismo passagens ferias', icon: PlaneIcon, defaultColor: '#06b6d4' },
  { slug: 'shopping-bag', name: 'Vestuário / Compras', keywords: 'roupa shopping compras calcados bolsa acessorios', icon: ShoppingBagIcon, defaultColor: '#f43f5e' },
  { slug: 'gift', name: 'Presentes / Doações', keywords: 'presente aniversario lembranca doacao ajuda natal', icon: GiftIcon, defaultColor: '#ec4899' },
  { slug: 'paw-print', name: 'Pets / Animais', keywords: 'pet cachorro gato veterinario racao animal banho', icon: PawPrintIcon, defaultColor: '#f97316' },
  { slug: 'baby', name: 'Crianças / Bebê', keywords: 'filho crianca fralda bebe berco escola infantil', icon: BabyIcon, defaultColor: '#f43f5e' },
  { slug: 'sparkles', name: 'Beleza / Cuidados', keywords: 'cabelo salao maquiagem estetica beleza barbeiro', icon: SparklesIcon, defaultColor: '#ec4899' },
  { slug: 'layers', name: 'Outros', keywords: 'geral outros diverso varios avulso', icon: LayersIcon, defaultColor: '#94a3b8' },
];

export const ICON_BY_SLUG: Record<string, LucideIcon> = Object.fromEntries(
  SELECTABLE_ICONS.map((i) => [i.slug, i.icon])
);

const NORMALIZE_MAP: Record<string, string> = {
  á: 'a',
  à: 'a',
  ã: 'a',
  â: 'a',
  é: 'e',
  ê: 'e',
  í: 'i',
  ó: 'o',
  ô: 'o',
  õ: 'o',
  ú: 'u',
  ç: 'c',
};

function normalizeKey(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('')
    .map((c) => NORMALIZE_MAP[c] || c)
    .join('')
    .trim();
}

const EXACT_CATEGORY_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  // Moradia
  moradia: { icon: HomeIcon, color: '#6366f1' },
  aluguel: { icon: HomeIcon, color: '#6366f1' },
  condominio: { icon: Building2Icon, color: '#6366f1' },
  luz: { icon: ZapIcon, color: '#eab308' },
  agua: { icon: DropletsIcon, color: '#06b6d4' },
  gas: { icon: FlameIcon, color: '#f97316' },
  internet: { icon: WifiIcon, color: '#3b82f6' },

  // Alimentação
  alimentacao: { icon: UtensilsIcon, color: '#10b981' },
  supermercado: { icon: ShoppingCartIcon, color: '#059669' },
  feira: { icon: AppleIcon, color: '#10b981' },
  'restaurantes/delivery': { icon: PizzaIcon, color: '#f59e0b' },
  restaurante: { icon: PizzaIcon, color: '#f59e0b' },
  delivery: { icon: PizzaIcon, color: '#f59e0b' },

  // Transporte
  transporte: { icon: CarIcon, color: '#0284c7' },
  combustivel: { icon: FuelIcon, color: '#0284c7' },
  'transporte publico': { icon: BusIcon, color: '#0284c7' },
  'uber/99': { icon: CarTaxiFrontIcon, color: '#f59e0b' },
  uber: { icon: CarTaxiFrontIcon, color: '#f59e0b' },
  estacionamento: { icon: CircleParkingIcon, color: '#3b82f6' },
  'manutencao veicular': { icon: WrenchIcon, color: '#64748b' },
  manutencao: { icon: WrenchIcon, color: '#64748b' },
  ipva: { icon: FileTextIcon, color: '#ef4444' },

  // Saúde
  saude: { icon: HeartPulseIcon, color: '#f43f5e' },
  'plano de saude': { icon: HospitalIcon, color: '#f43f5e' },
  farmacia: { icon: PillIcon, color: '#f43f5e' },
  'consultas/exames': { icon: StethoscopeIcon, color: '#f43f5e' },
  consultas: { icon: StethoscopeIcon, color: '#f43f5e' },
  exames: { icon: StethoscopeIcon, color: '#f43f5e' },
  academia: { icon: DumbbellIcon, color: '#06b6d4' },

  // Educação
  educacao: { icon: GraduationCapIcon, color: '#3b82f6' },
  'cursos/faculdade': { icon: GraduationCapIcon, color: '#3b82f6' },
  cursos: { icon: GraduationCapIcon, color: '#3b82f6' },
  faculdade: { icon: GraduationCapIcon, color: '#3b82f6' },
  livros: { icon: BookOpenIcon, color: '#3b82f6' },
  material: { icon: PencilIcon, color: '#3b82f6' },

  // Lazer
  lazer: { icon: Gamepad2Icon, color: '#f59e0b' },
  'lazer & estilo de vida': { icon: Gamepad2Icon, color: '#f59e0b' },
  viagens: { icon: PlaneIcon, color: '#06b6d4' },
  viagem: { icon: PlaneIcon, color: '#06b6d4' },
  passeios: { icon: FilmIcon, color: '#f59e0b' },
  shows: { icon: MusicIcon, color: '#ec4899' },
  jogos: { icon: Gamepad2Icon, color: '#ec4899' },

  // Pessoal
  pessoal: { icon: SparklesIcon, color: '#ec4899' },
  vestuario: { icon: ShirtIcon, color: '#f43f5e' },
  roupas: { icon: ShirtIcon, color: '#f43f5e' },
  beleza: { icon: ScissorsIcon, color: '#ec4899' },
  cuidados: { icon: SparklesIcon, color: '#ec4899' },
  eletronicos: { icon: SmartphoneIcon, color: '#8b5cf6' },

  // Assinaturas
  assinaturas: { icon: RepeatIcon, color: '#8b5cf6' },
  streaming: { icon: TvIcon, color: '#8b5cf6' },
  musica: { icon: HeadphonesIcon, color: '#8b5cf6' },
  software: { icon: SmartphoneIcon, color: '#8b5cf6' },

  // Dívidas & Pensão
  dividas: { icon: ReceiptIcon, color: '#ef4444' },
  divida: { icon: ReceiptIcon, color: '#ef4444' },
  emprestimo: { icon: ReceiptIcon, color: '#ef4444' },
  financiamento: { icon: ReceiptIcon, color: '#ef4444' },
  'cartao de credito': { icon: ReceiptIcon, color: '#ef4444' },
  fatura: { icon: ReceiptIcon, color: '#ef4444' },
  'juros/multas': { icon: PercentIcon, color: '#ef4444' },
  'pensao alimenticia': { icon: ScaleIcon, color: '#e11d48' },

  // Reserva de Emergência
  'reserva de emergencia': { icon: ShieldCheckIcon, color: '#14b8a6' },
  reserva: { icon: ShieldCheckIcon, color: '#14b8a6' },

  // Investimentos
  investimentos: { icon: TrendingUpIcon, color: '#8b5cf6' },
  investimento: { icon: TrendingUpIcon, color: '#8b5cf6' },
  'renda fixa': { icon: TrendingUpIcon, color: '#8b5cf6' },
  'renda variavel': { icon: TrendingUpIcon, color: '#8b5cf6' },
  acoes: { icon: TrendingUpIcon, color: '#8b5cf6' },
  fii: { icon: TrendingUpIcon, color: '#8b5cf6' },
  cripto: { icon: CoinsIcon, color: '#f59e0b' },

  // Receitas
  salario: { icon: WalletIcon, color: '#10b981' },
  freelance: { icon: BriefcaseIcon, color: '#3b82f6' },
  rendimentos: { icon: CoinsIcon, color: '#8b5cf6' },
  rendimento: { icon: CoinsIcon, color: '#8b5cf6' },
  cashback: { icon: PercentIcon, color: '#10b981' },
  presentes: { icon: GiftIcon, color: '#ec4899' },
  presente: { icon: GiftIcon, color: '#ec4899' },
  outros: { icon: LayersIcon, color: '#94a3b8' },
  'ajuste de saldo': { icon: ScaleIcon, color: '#64748b' },
  'nao categorizado': { icon: LayersIcon, color: '#94a3b8' },
};

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(99, 102, 241, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getCategoryMeta(
  name?: string,
  parentName?: string,
  type?: string,
  iconSlug?: string,
  customColor?: string
): CategoryIconMeta {
  let resolvedIcon: LucideIcon | null = null;
  let resolvedColor =
    customColor && /^#[0-9A-Fa-f]{6}$/.test(customColor) ? customColor : null;

  if (iconSlug && ICON_BY_SLUG[iconSlug]) {
    resolvedIcon = ICON_BY_SLUG[iconSlug];
  }

  const normName = normalizeKey(name ?? '');
  const normParent = normalizeKey(parentName ?? '');

  if ((!resolvedIcon || !resolvedColor) && EXACT_CATEGORY_MAP[normName]) {
    const meta = EXACT_CATEGORY_MAP[normName];
    if (!resolvedIcon) resolvedIcon = meta.icon;
    if (!resolvedColor) resolvedColor = meta.color;
  }

  if ((!resolvedIcon || !resolvedColor) && normParent && EXACT_CATEGORY_MAP[normParent]) {
    const meta = EXACT_CATEGORY_MAP[normParent];
    if (!resolvedIcon) resolvedIcon = meta.icon;
    if (!resolvedColor) resolvedColor = meta.color;
  }

  if (!resolvedIcon || !resolvedColor) {
    if (normName.includes('casa') || normName.includes('ap') || normName.includes('morad')) {
      if (!resolvedIcon) resolvedIcon = HomeIcon;
      if (!resolvedColor) resolvedColor = '#6366f1';
    } else if (normName.includes('mercado') || normName.includes('comida') || normName.includes('lanche') || normName.includes('aliment')) {
      if (!resolvedIcon) resolvedIcon = UtensilsIcon;
      if (!resolvedColor) resolvedColor = '#10b981';
    } else if (normName.includes('carro') || normName.includes('veiculo') || normName.includes('moto') || normName.includes('transp')) {
      if (!resolvedIcon) resolvedIcon = CarIcon;
      if (!resolvedColor) resolvedColor = '#0284c7';
    } else if (normName.includes('medico') || normName.includes('hospital') || normName.includes('dentista') || normName.includes('saud')) {
      if (!resolvedIcon) resolvedIcon = HeartPulseIcon;
      if (!resolvedColor) resolvedColor = '#f43f5e';
    } else if (normName.includes('faculdade') || normName.includes('estudo') || normName.includes('livro') || normName.includes('educ')) {
      if (!resolvedIcon) resolvedIcon = GraduationCapIcon;
      if (!resolvedColor) resolvedColor = '#3b82f6';
    } else if (normName.includes('fatura') || normName.includes('cartao') || normName.includes('juro') || normName.includes('divid')) {
      if (!resolvedIcon) resolvedIcon = ReceiptIcon;
      if (!resolvedColor) resolvedColor = '#ef4444';
    } else if (normName.includes('acao') || normName.includes('fii') || normName.includes('cripto') || normName.includes('cdb') || normName.includes('invest')) {
      if (!resolvedIcon) resolvedIcon = TrendingUpIcon;
      if (!resolvedColor) resolvedColor = '#8b5cf6';
    } else if (normName.includes('lazer') || normName.includes('viag') || normName.includes('jogo')) {
      if (!resolvedIcon) resolvedIcon = Gamepad2Icon;
      if (!resolvedColor) resolvedColor = '#f59e0b';
    } else if (normName.includes('reserva') || normName.includes('emerg')) {
      if (!resolvedIcon) resolvedIcon = ShieldCheckIcon;
      if (!resolvedColor) resolvedColor = '#14b8a6';
    }
  }

  if (!resolvedIcon) {
    resolvedIcon = type?.toUpperCase() === 'INCOME' ? WalletIcon : CircleDollarSignIcon;
  }
  if (!resolvedColor) {
    resolvedColor = type?.toUpperCase() === 'INCOME' ? '#10b981' : '#6366f1';
  }

  return {
    icon: resolvedIcon,
    color: resolvedColor,
    bg: hexToRgba(resolvedColor, 0.15),
    border: hexToRgba(resolvedColor, 0.28),
  };
}

export interface CategoryBadgeProps {
  name?: string;
  parentName?: string;
  type?: string;
  iconSlug?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryBadge({
  name,
  parentName,
  type,
  iconSlug,
  color,
  size = 'md',
  className,
}: CategoryBadgeProps) {
  const meta = getCategoryMeta(name, parentName, type, iconSlug, color);
  const IconComp = meta.icon;

  const dims = {
    xs: { box: 22, radius: 6, icon: 12 },
    sm: { box: 28, radius: 8, icon: 14 },
    md: { box: 36, radius: 11, icon: 17 },
    lg: { box: 44, radius: 14, icon: 21 },
  }[size];

  return (
    <View
      accessible
      accessibilityLabel={name ?? 'Categoria'}
      style={{
        width: dims.box,
        height: dims.box,
        borderRadius: dims.radius,
        backgroundColor: meta.bg,
        borderColor: meta.border,
        borderWidth: 1,
      }}
      className={cn('items-center justify-center', className)}>
      <IconComp size={dims.icon} color={meta.color} />
    </View>
  );
}

export function CategoryIconPicker({
  selectedSlug,
  selectedColor,
  onSelectIcon,
  onSelectColor,
}: {
  selectedSlug?: string | null;
  selectedColor?: string | null;
  onSelectIcon: (slug: string) => void;
  onSelectColor: (color: string) => void;
}) {
  return (
    <View className="gap-3">
      {/* Color Swatches */}
      <View className="gap-1.5">
        <Text className="text-xs font-medium text-muted-foreground">Cor do badge</Text>
        <View className="flex-row flex-wrap items-center gap-2">
          {PRESET_COLORS.map((c) => {
            const isSelected = (selectedColor ?? '').toLowerCase() === c.toLowerCase();
            return (
              <Pressable
                key={c}
                onPress={() => onSelectColor(c)}
                accessibilityLabel={`Selecionar cor ${c}`}
                style={{
                  backgroundColor: c,
                  borderColor: isSelected ? '#ffffff' : hexToRgba(c, 0.5),
                  borderWidth: isSelected ? 2 : 1,
                }}
                className="h-6 w-6 items-center justify-center rounded-full">
                {isSelected ? <CheckIcon size={12} color="#ffffff" /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Icon Grid */}
      <View className="gap-1.5">
        <Text className="text-xs font-medium text-muted-foreground">Ícone da categoria</Text>
        <View className="flex-row flex-wrap gap-1.5 rounded-xl border border-border bg-background/60 p-2">
          {SELECTABLE_ICONS.slice(0, 18).map((item) => {
            const IconComp = item.icon;
            const isSelected = selectedSlug === item.slug;
            return (
              <Pressable
                key={item.slug}
                onPress={() => {
                  onSelectIcon(item.slug);
                  if (!selectedColor) {
                    onSelectColor(item.defaultColor);
                  }
                }}
                accessibilityLabel={item.name}
                className={cn(
                  'h-9 w-9 items-center justify-center rounded-lg border',
                  isSelected
                    ? 'border-primary bg-primary/20'
                    : 'border-border bg-card'
                )}>
                <IconComp
                  size={16}
                  color={isSelected ? '#00d494' : item.defaultColor}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
