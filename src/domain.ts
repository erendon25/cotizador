export type Architecture = 'LOCAL' | 'LOCAL_CON_BACKUP' | 'CLOUD' | 'HIBRIDA';
export type InternetQuality = 'ESTABLE' | 'REGULAR' | 'INESTABLE' | 'INEXISTENTE';
export type Complexity = 'BAJA' | 'MEDIA' | 'ALTA' | 'MUY_ALTA';
export type Priority = 'CRITICO' | 'IMPORTANTE' | 'OPCIONAL' | 'FUTURO';

export interface ModuleDefinition {
  id: string;
  name: string;
  category: string;
  price: number;
  hours: number;
  complexity: Complexity;
  priority: Priority;
  dependencies: string[];
  active: boolean;
}

export interface Intake {
  branches: number;
  devices: number;
  users: number;
  ramGb: number;
  internet: InternetQuality;
  offlineRequired: boolean;
  remoteAccess: boolean;
  acceptsMonthlyCosts: boolean;
}

export interface Recommendation {
  architecture: Architecture;
  modality: 'LOCAL_WEB' | 'CLOUD_WEB' | 'PWA' | 'HIBRIDO';
  reason: string;
  considerations: string[];
}

export interface PricingConfig {
  hourlyRate: number;
  targetMargin: number;
  warningDiscount: number;
  criticalDiscount: number;
  weeklyCapacity: number;
  deliveryBuffer: number;
}

export interface PriceResult {
  technicalCost: number;
  moduleSubtotal: number;
  minimumPrice: number;
  suggestedPrice: number;
  totalHours: number;
  estimatedWeeks: number;
}

export interface Phase {
  name: string;
  moduleIds: string[];
  amount: number;
}

export interface QuoteVersionSummary {
  count: number;
  total: number;
  average: number;
  highest: number;
}

export const COMPLEXITY_MULTIPLIER: Record<Complexity, number> = {
  BAJA: 1,
  MEDIA: 1.15,
  ALTA: 1.3,
  MUY_ALTA: 1.5,
};

export function recommendArchitecture(intake: Intake): Recommendation {
  if (intake.offlineRequired && intake.branches > 1) {
    return {
      architecture: 'HIBRIDA',
      modality: 'HIBRIDO',
      reason: 'Hay varias sucursales y la operacion debe continuar durante cortes de Internet.',
      considerations: ['Sincronizacion con control de conflictos', 'Base local por sede', 'Backups en nube'],
    };
  }

  if (intake.branches > 1 && intake.internet === 'ESTABLE') {
    return {
      architecture: 'CLOUD',
      modality: 'CLOUD_WEB',
      reason: 'Las sedes necesitan compartir datos y cuentan con una conexion estable.',
      considerations: ['Acceso centralizado', 'Backups administrados', 'Costo recurrente de infraestructura'],
    };
  }

  if (
    intake.branches === 1 &&
    intake.devices === 1 &&
    !intake.remoteAccess &&
    !intake.acceptsMonthlyCosts
  ) {
    return {
      architecture: 'LOCAL',
      modality: 'LOCAL_WEB',
      reason: 'Opera en un solo equipo, no requiere acceso remoto y evita costos mensuales.',
      considerations: ['Backup externo obligatorio', 'Migracion prevista si aumenta la concurrencia'],
    };
  }

  if (intake.offlineRequired || intake.internet === 'INESTABLE' || intake.internet === 'INEXISTENTE') {
    return {
      architecture: 'LOCAL_CON_BACKUP',
      modality: intake.devices > 1 ? 'PWA' : 'LOCAL_WEB',
      reason: 'La continuidad operativa pesa mas que el acceso remoto por la calidad de la conexion.',
      considerations: ['Restauracion verificada', 'Historial de backups', 'Migracion futura a nube'],
    };
  }

  return {
    architecture: 'CLOUD',
    modality: 'CLOUD_WEB',
    reason: 'El acceso remoto y la conectividad disponible favorecen una operacion centralizada.',
    considerations: ['Monitorear limites del proveedor', 'Definir responsable de costos recurrentes'],
  };
}

export function resolveDependencies(selectedIds: string[], modules: ModuleDefinition[]): string[] {
  const byId = new Map(modules.map((module) => [module.id, module]));
  const resolved = new Set<string>();

  const visit = (id: string, chain: Set<string>): boolean => {
    if (resolved.has(id)) return true;
    if (chain.has(id)) return false;
    const module = byId.get(id);
    if (!module || !module.active) return false;
    const nextChain = new Set(chain).add(id);
    if (!module.dependencies.every((dependency) => visit(dependency, nextChain))) return false;
    resolved.add(id);
    return true;
  };

  selectedIds.forEach((id) => visit(id, new Set()));
  return [...resolved];
}

export function calculatePrice(
  selectedIds: string[],
  modules: ModuleDefinition[],
  config: PricingConfig,
): PriceResult {
  const selected = modules.filter((module) => module.active && selectedIds.includes(module.id));
  const moduleSubtotal = selected.reduce(
    (total, module) => total + module.price * COMPLEXITY_MULTIPLIER[module.complexity],
    0,
  );
  const totalHours = selected.reduce((total, module) => total + module.hours, 0);
  const technicalCost = totalHours * config.hourlyRate;
  const priceByMargin = config.targetMargin >= 1 ? technicalCost : technicalCost / (1 - config.targetMargin);
  const minimumPrice = Math.max(technicalCost, priceByMargin);
  const suggestedPrice = Math.ceil(Math.max(moduleSubtotal, minimumPrice) / 50) * 50;
  const rawWeeks = config.weeklyCapacity > 0 ? totalHours / config.weeklyCapacity : 0;

  return {
    technicalCost,
    moduleSubtotal,
    minimumPrice,
    suggestedPrice,
    totalHours,
    estimatedWeeks: Math.max(1, Math.ceil(rawWeeks * (1 + config.deliveryBuffer))),
  };
}

export function effectiveQuotedPrice(quotedPrice: number | null, suggestedPrice: number): number {
  return quotedPrice ?? suggestedPrice;
}

export function parseMoneyInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;
  const amount = Number(digits);
  return Number.isSafeInteger(amount) ? amount : 0;
}

export function summarizeQuoteVersions(quotes: Array<Record<string, unknown>>): QuoteVersionSummary {
  const amounts = quotes.map((quote) => {
    const pricing = quote.pricing;
    if (!pricing || typeof pricing !== 'object') return 0;
    const quotedPrice = (pricing as Record<string, unknown>).quotedPrice;
    return typeof quotedPrice === 'number' && Number.isFinite(quotedPrice) ? quotedPrice : 0;
  });
  const total = amounts.reduce((sum, amount) => sum + amount, 0);

  return {
    count: quotes.length,
    total,
    average: quotes.length > 0 ? total / quotes.length : 0,
    highest: amounts.length > 0 ? Math.max(...amounts) : 0,
  };
}

const PRIORITY_WEIGHT: Record<Priority, number> = {
  CRITICO: 0,
  IMPORTANTE: 1,
  OPCIONAL: 2,
  FUTURO: 3,
};

export function proposePhases(
  selectedIds: string[],
  modules: ModuleDefinition[],
  budget: number,
): Phase[] {
  const selected = modules
    .filter((module) => selectedIds.includes(module.id))
    .sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]);
  if (!selected.length) return [];

  const phases: Phase[] = [];
  let current: Phase = { name: 'Fase 1', moduleIds: [], amount: 0 };

  selected.forEach((module) => {
    const amount = module.price * COMPLEXITY_MULTIPLIER[module.complexity];
    const shouldStartNext = budget > 0 && current.moduleIds.length > 0 && current.amount + amount > budget;
    if (shouldStartNext) {
      phases.push(current);
      current = { name: `Fase ${phases.length + 1}`, moduleIds: [], amount: 0 };
    }
    current.moduleIds.push(module.id);
    current.amount += amount;
  });
  if (current.moduleIds.length) phases.push(current);
  return phases;
}

export function discountStatus(suggested: number, quoted: number, config: PricingConfig) {
  if (suggested <= 0) return { percent: 0, label: 'NORMAL' as const };
  const percent = Math.max(0, ((suggested - quoted) / suggested) * 100);
  const label = percent >= config.criticalDiscount * 100
    ? 'CRITICO' as const
    : percent >= config.warningDiscount * 100
      ? 'ADVERTENCIA' as const
      : 'NORMAL' as const;
  return { percent, label };
}
