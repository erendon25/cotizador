import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageOpen,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  RotateCcw,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  calculatePrice,
  discountStatus,
  effectiveQuotedPrice,
  proposePhases,
  recommendArchitecture,
  resolveDependencies,
  type Intake,
  type ModuleDefinition,
} from './domain';
import { initialModules, pricingConfig } from './data';
import { useAuth } from './auth';
import { loadWorkspace, saveQuoteSnapshot, saveWorkspaceState } from './storage';

type View = 'dashboard' | 'prospects' | 'quotes' | 'catalog';
type Step = 0 | 1 | 2 | 3;

interface QuoteDraft {
  client: string;
  company: string;
  project: string;
  budget: number;
  problem: string;
  intake: Intake;
  selectedIds: string[];
  quotedPrice: number | null;
}

const emptyDraft: QuoteDraft = {
  client: '',
  company: '',
  project: '',
  budget: 0,
  problem: '',
  intake: {
    branches: 1,
    devices: 1,
    users: 1,
    ramGb: 4,
    internet: 'INESTABLE',
    offlineRequired: true,
    remoteAccess: false,
    acceptsMonthlyCosts: false,
  },
  selectedIds: [],
  quotedPrice: null,
};

const money = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(value);

const navItems = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'prospects' as View, label: 'Prospectos', icon: Users },
  { id: 'quotes' as View, label: 'Cotizaciones', icon: FileText },
  { id: 'catalog' as View, label: 'Tarifario', icon: BookOpen },
];

function App() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<View>('dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState<QuoteDraft>(emptyDraft);
  const [modules, setModules] = useState<ModuleDefinition[]>(initialModules);
  const [savedQuotes, setSavedQuotes] = useState<Array<Record<string, unknown>>>([]);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'loading' | 'saving' | 'saved' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    setWorkspaceReady(false);
    setSyncStatus('loading');
    loadWorkspace<QuoteDraft>().then((workspace) => {
      if (!active) return;
      setDraft(workspace.draft
        ? { ...emptyDraft, ...workspace.draft, quotedPrice: workspace.draft.quotedPrice || null }
        : emptyDraft);
      setModules(workspace.modules ?? initialModules);
      setSavedQuotes(workspace.quotes);
      setWorkspaceReady(true);
      setSyncStatus('saved');
    }).catch((error: Error) => {
      if (!active) return;
      setNotice(`No se pudo cargar Neon: ${error.message}`);
      setSyncStatus('error');
    });
    return () => { active = false; };
  }, [user.id]);

  useEffect(() => {
    if (!workspaceReady) return;
    setSyncStatus('saving');
    const timeout = window.setTimeout(() => {
      saveWorkspaceState('draft', draft)
        .then(() => setSyncStatus('saved'))
        .catch((error: Error) => { setSyncStatus('error'); setNotice(`Error al guardar: ${error.message}`); });
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [draft, workspaceReady]);

  useEffect(() => {
    if (!workspaceReady) return;
    setSyncStatus('saving');
    const timeout = window.setTimeout(() => {
      saveWorkspaceState('modules', modules)
        .then(() => setSyncStatus('saved'))
        .catch((error: Error) => { setSyncStatus('error'); setNotice(`Error al guardar: ${error.message}`); });
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [modules, workspaceReady]);

  const resolvedIds = useMemo(
    () => resolveDependencies(draft.selectedIds, modules),
    [draft.selectedIds, modules],
  );
  const pricing = useMemo(
    () => calculatePrice(resolvedIds, modules, pricingConfig),
    [resolvedIds, modules],
  );
  const recommendation = useMemo(() => recommendArchitecture(draft.intake), [draft.intake]);
  const currentPrice = effectiveQuotedPrice(draft.quotedPrice, pricing.suggestedPrice);
  const discount = discountStatus(pricing.suggestedPrice, currentPrice, pricingConfig);
  const phases = useMemo(
    () => proposePhases(resolvedIds, modules, draft.budget),
    [resolvedIds, modules, draft.budget],
  );

  const startQuote = () => {
    setDraft(emptyDraft);
    setStep(0);
    setView('quotes');
    setMobileNav(false);
  };

  const updateIntake = <K extends keyof Intake>(key: K, value: Intake[K]) => {
    setDraft((current) => ({ ...current, intake: { ...current.intake, [key]: value } }));
  };

  const toggleModule = (id: string) => {
    setDraft((current) => ({
      ...current,
      quotedPrice: null,
      selectedIds: current.selectedIds.includes(id)
        ? current.selectedIds.filter((moduleId) => moduleId !== id)
        : [...current.selectedIds, id],
    }));
  };

  const saveQuote = async () => {
    if (!draft.client.trim() || !draft.project.trim() || resolvedIds.length === 0) {
      setNotice('Completa el cliente, el proyecto y al menos un modulo antes de guardar.');
      return;
    }
    const version = savedQuotes.filter((quote) => quote.project === draft.project).length + 1;
    const snapshot = {
      id: `COT-${String(savedQuotes.length + 1).padStart(5, '0')}`,
      version: `V${version}`,
      createdAt: new Date().toISOString(),
      ...draft,
      selectedIds: resolvedIds,
      recommendation,
      pricing: { ...pricing, quotedPrice: currentPrice },
      moduleSnapshots: modules.filter((module) => resolvedIds.includes(module.id)),
    };
    try {
      setSyncStatus('saving');
      await saveQuoteSnapshot(snapshot);
      setSavedQuotes((current) => [...current, snapshot]);
      setSyncStatus('saved');
      setNotice(`${snapshot.id} ${snapshot.version} guardada en Neon como version inmutable.`);
    } catch (error) {
      setSyncStatus('error');
      setNotice(`No se pudo guardar la version: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const renderPage = () => {
    if (view === 'dashboard') return <Dashboard onNew={startQuote} onCatalog={() => setView('catalog')} savedQuotes={savedQuotes} userName={user.name} draft={draft} currentPrice={currentPrice} activeModules={resolvedIds.length} />;
    if (view === 'prospects') return <Prospects onNew={startQuote} />;
    if (view === 'catalog') return <Catalog modules={modules} setModules={setModules} query={query} onTariffChange={() => setDraft((current) => ({ ...current, quotedPrice: null }))} />;
    return (
      <QuoteWorkspace
        draft={draft}
        setDraft={setDraft}
        step={step}
        setStep={setStep}
        modules={modules}
        resolvedIds={resolvedIds}
        pricing={pricing}
        currentPrice={currentPrice}
        discount={discount}
        recommendation={recommendation}
        phases={phases}
        updateIntake={updateIntake}
        toggleModule={toggleModule}
        saveQuote={saveQuote}
      />
    );
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark">C</div>
          <div><strong>Cotiza</strong><span>Operacion comercial</span></div>
          <button className="icon-button mobile-only" onClick={() => setMobileNav(false)} aria-label="Cerrar menu"><X size={18} /></button>
        </div>
        <nav className="main-nav" aria-label="Navegacion principal">
          <p>OPERACION</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? 'active' : ''}
              onClick={() => { setView(item.id); setMobileNav(false); }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.id === 'quotes' && savedQuotes.length > 0 ? <small>{savedQuotes.length}</small> : null}
            </button>
          ))}
          <p>GESTION</p>
          <button><BriefcaseBusiness size={18} /><span>Proyectos</span></button>
          <button><CircleDollarSign size={18} /><span>Pagos</span></button>
          <button><BarChart3 size={18} /><span>Metricas</span></button>
        </nav>
        <div className="sidebar-bottom">
          <button><Settings size={18} /><span>Configuracion</span></button>
          <div className="user-card">
            {user.image ? <img className="avatar avatar-image" src={user.image} alt="" /> : <div className="avatar">{user.name?.slice(0, 2).toUpperCase()}</div>}
            <div><strong>{user.name}</strong><span>{user.email}</span></div>
            <button className="logout-button" onClick={() => void signOut()} title="Cerrar sesion" aria-label="Cerrar sesion"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileNav(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          <div className="global-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente, RUC, cotizacion..." /><kbd>Ctrl K</kbd></div>
          <div className="top-actions">
            <span className={`sync-state ${syncStatus}`}><i />{syncStatus === 'loading' ? 'Cargando Neon' : syncStatus === 'saving' ? 'Guardando...' : syncStatus === 'error' ? 'Error de sincronizacion' : 'Guardado en Neon'}</span>
            <button className="icon-button" aria-label="Notificaciones"><Bell size={19} /><i /></button>
            <button className="primary-button" onClick={startQuote}><Plus size={18} />Nueva cotizacion</button>
          </div>
        </header>
        <div className="page">{renderPage()}</div>
      </main>

      {notice ? (
        <div className="toast" role="status"><Check size={18} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Cerrar"><X size={16} /></button></div>
      ) : null}
    </div>
  );
}

function Dashboard({ onNew, onCatalog, savedQuotes, userName, draft, currentPrice, activeModules }: { onNew: () => void; onCatalog: () => void; savedQuotes: Array<Record<string, unknown>>; userName: string; draft: QuoteDraft; currentPrice: number; activeModules: number }) {
  const firstName = userName.trim().split(/\s+/)[0] || 'usuario';
  const date = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase();
  const quotedTotal = savedQuotes.reduce((sum, quote) => {
    const quotePricing = quote.pricing as { quotedPrice?: unknown } | undefined;
    return sum + (typeof quotePricing?.quotedPrice === 'number' ? quotePricing.quotedPrice : 0);
  }, 0);
  const draftAmount = activeModules > 0 ? currentPrice : 0;

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">{date}</p><h1>Buenos dias, {firstName}</h1><p>Este es el pulso comercial de tu negocio.</p></div>
        <button className="secondary-button"><SlidersHorizontal size={17} />Este mes</button>
      </div>
      <section className="metric-grid">
        <Metric label="Presupuesto del borrador" value={money(draft.budget)} detail="Monto declarado por el cliente" icon={Gauge} />
        <Metric label="Precio actual" value={money(draftAmount)} detail={`${activeModules} modulos habilitados`} icon={CircleDollarSign} />
        <Metric label="Versiones guardadas" value={String(savedQuotes.length)} detail="Snapshots inmutables" icon={FileText} />
        <Metric label="Monto versionado" value={money(quotedTotal)} detail="Suma de versiones guardadas" icon={BarChart3} />
      </section>
      <div className="dashboard-grid">
        <section className="panel pipeline-panel">
          <div className="section-heading"><div><h2>Pipeline comercial</h2><p>Valor por etapa durante el mes</p></div></div>
          <div className="empty-state">
            <span><Gauge size={22} /></span>
            <h3>Sin oportunidades registradas</h3>
            <p>El pipeline comenzara a reflejar actividad cuando registres operaciones reales.</p>
            <button className="secondary-button" onClick={onNew}><Plus size={16} />Nueva cotizacion</button>
          </div>
        </section>
        <section className="panel quick-panel">
          <div className="section-heading"><div><h2>Acciones rapidas</h2><p>Continua donde lo dejaste</p></div></div>
          <button onClick={onNew} className="quick-action featured"><span><Plus size={20} /></span><div><strong>Nueva cotizacion</strong><small>Inicia el levantamiento guiado</small></div><ChevronRight size={18} /></button>
          <button className="quick-action" onClick={onCatalog}><span><PackageOpen size={20} /></span><div><strong>Actualizar tarifario</strong><small>Revisa modulos, horas y precios</small></div><ChevronRight size={18} /></button>
        </section>
      </div>
      <section className="panel activity-panel">
        <div className="section-heading"><div><h2>Proximos seguimientos</h2><p>Oportunidades que requieren tu atencion</p></div></div>
        <div className="empty-state compact"><span><ClipboardList size={20} /></span><h3>Sin seguimientos pendientes</h3></div>
      </section>
    </>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Gauge }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><i><Icon size={18} /></i></div><div className="metric-value"><strong>{value}</strong></div><p>{detail}</p></article>;
}

function Prospects({ onNew }: { onNew: () => void }) {
  return <><div className="page-heading"><div><p className="eyebrow">PIPELINE</p><h1>Prospectos</h1><p>Oportunidades activas y proximos contactos.</p></div><button className="primary-button" onClick={onNew}><Plus size={18} />Nueva cotizacion</button></div><section className="panel empty-panel"><div className="section-heading"><div><h2>0 prospectos activos</h2><p>No hay actividad comercial registrada.</p></div></div><div className="empty-state"><span><Users size={22} /></span><h3>Sin prospectos</h3><p>Los nuevos prospectos apareceran aqui cuando se registren.</p></div></section></>;
}

function Catalog({ modules, setModules, query, onTariffChange }: { modules: ModuleDefinition[]; setModules: React.Dispatch<React.SetStateAction<ModuleDefinition[]>>; query: string; onTariffChange: () => void }) {
  const filtered = modules.filter((module) => `${module.name} ${module.category}`.toLowerCase().includes(query.toLowerCase()));
  const activeCount = modules.filter((module) => module.active).length;
  const updateModule = (id: string, changes: Partial<Pick<ModuleDefinition, 'price' | 'active'>>) => {
    setModules((current) => current.map((module) => module.id === id ? { ...module, ...changes } : module));
    onTariffChange();
  };

  return <><div className="page-heading"><div><p className="eyebrow">CONFIGURACION COMERCIAL</p><h1>Tarifario</h1><p>Precios base, horas y dependencias. Los cambios actualizan borradores, no snapshots guardados.</p></div><button className="primary-button"><Plus size={18} />Nuevo modulo</button></div><section className="panel"><div className="section-heading catalog-heading"><div><h2>{activeCount} modulos habilitados</h2><p>Valor hora interno: {money(pricingConfig.hourlyRate)} · Margen objetivo: {pricingConfig.targetMargin * 100}%</p></div></div><div className="responsive-table"><table><thead><tr><th>Modulo</th><th>Estado</th><th>Complejidad</th><th>Horas</th><th>Dependencias</th><th>Precio base</th></tr></thead><tbody>{filtered.map((module) => <tr key={module.id} className={module.active ? '' : 'inactive-row'}><td><strong>{module.name}</strong><small>{module.category} · {module.priority}</small></td><td><label className="catalog-toggle"><input type="checkbox" checked={module.active} onChange={(event) => updateModule(module.id, { active: event.target.checked })} /><i /><span>{module.active ? 'Habilitado' : 'Deshabilitado'}</span></label></td><td><span className="status neutral">{module.complexity.replace('_', ' ')}</span></td><td>{module.hours} h</td><td>{module.dependencies.length ? module.dependencies.join(', ') : 'Ninguna'}</td><td><label className="price-input"><span>S/</span><input type="number" min="0" value={module.price} disabled={!module.active} onChange={(event) => updateModule(module.id, { price: Math.max(0, Number(event.target.value)) })} /></label></td></tr>)}</tbody></table></div></section></>;
}

interface QuoteWorkspaceProps {
  draft: QuoteDraft;
  setDraft: React.Dispatch<React.SetStateAction<QuoteDraft>>;
  step: Step;
  setStep: (step: Step) => void;
  modules: ModuleDefinition[];
  resolvedIds: string[];
  pricing: ReturnType<typeof calculatePrice>;
  currentPrice: number;
  discount: ReturnType<typeof discountStatus>;
  recommendation: ReturnType<typeof recommendArchitecture>;
  phases: ReturnType<typeof proposePhases>;
  updateIntake: <K extends keyof Intake>(key: K, value: Intake[K]) => void;
  toggleModule: (id: string) => void;
  saveQuote: () => void;
}

function QuoteWorkspace(props: QuoteWorkspaceProps) {
  const { draft, setDraft, step, setStep, modules, resolvedIds, pricing, currentPrice, discount, recommendation, phases, updateIntake, toggleModule, saveQuote } = props;
  const stepNames = ['Cliente', 'Operacion', 'Modulos', 'Precio'];
  const selectedModules = modules.filter((module) => resolvedIds.includes(module.id));
  const dependenciesAdded = resolvedIds.filter((id) => !draft.selectedIds.includes(id)).length;

  return <div className="quote-page">
    <div className="quote-heading"><div><p className="eyebrow">NUEVA COTIZACION · BORRADOR</p><h1>{draft.project || 'Proyecto sin nombre'}</h1><p><span className="save-dot" />Guardado automaticamente en Neon</p></div><div><button className="secondary-button" onClick={() => window.print()}><FileText size={17} />Vista comercial</button><button className="primary-button" onClick={saveQuote}><Check size={17} />Guardar version</button></div></div>
    <div className="stepper">{stepNames.map((name, index) => <button key={name} className={`${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} onClick={() => setStep(index as Step)}><span>{index < step ? <Check size={15} /> : index + 1}</span><strong>{name}</strong><small>{['Prospecto y problema', 'Hardware e Internet', 'Alcance y dependencias', 'Propuesta y fases'][index]}</small></button>)}</div>
    <div className="quote-layout">
      <section className="panel quote-form">
        {step === 0 && <ClientStep draft={draft} setDraft={setDraft} />}
        {step === 1 && <OperationStep draft={draft} updateIntake={updateIntake} recommendation={recommendation} />}
        {step === 2 && <ModuleStep modules={modules} draft={draft} resolvedIds={resolvedIds} toggleModule={toggleModule} dependenciesAdded={dependenciesAdded} />}
        {step === 3 && <PriceStep draft={draft} setDraft={setDraft} pricing={pricing} currentPrice={currentPrice} discount={discount} phases={phases} modules={modules} />}
        <div className="form-footer"><button className="secondary-button" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1) as Step)}>Anterior</button><span>Paso {step + 1} de 4</span>{step < 3 ? <button className="primary-button" onClick={() => setStep((step + 1) as Step)}>Continuar <ChevronRight size={17} /></button> : <button className="primary-button" onClick={saveQuote}><Check size={17} />Guardar version</button>}</div>
      </section>
      <aside className="quote-summary">
        <div className="summary-header"><div><span>Resumen actual</span><strong>{selectedModules.length} modulos</strong></div><ClipboardList size={20} /></div>
        <div className="client-summary"><small>CLIENTE</small><strong>{draft.company || draft.client || 'Sin seleccionar'}</strong><span>Presupuesto: {money(draft.budget)}</span></div>
        <dl><div><dt>Costo tecnico</dt><dd>{money(pricing.technicalCost)}</dd></div><div><dt>Precio minimo</dt><dd>{money(pricing.minimumPrice)}</dd></div><div className="suggested"><dt>Precio sugerido</dt><dd>{money(pricing.suggestedPrice)}</dd></div><div className="current"><dt>Precio cotizado</dt><dd>{money(currentPrice)}</dd></div></dl>
        <div className={`budget-gap ${draft.budget >= currentPrice ? 'positive' : ''}`}><span>{draft.budget >= currentPrice ? 'Dentro del presupuesto' : 'Diferencia con presupuesto'}</span><strong>{money(Math.abs(draft.budget - currentPrice))}</strong></div>
        <div className="architecture-summary"><small>ARQUITECTURA RECOMENDADA</small><strong><Sparkles size={16} />{recommendation.architecture.replace('_', ' ')}</strong><p>{recommendation.reason}</p></div>
        <div className="summary-foot"><span>{pricing.totalHours} h estimadas</span><span>{pricing.estimatedWeeks} semanas</span></div>
      </aside>
    </div>
  </div>;
}

function ClientStep({ draft, setDraft }: { draft: QuoteDraft; setDraft: React.Dispatch<React.SetStateAction<QuoteDraft>> }) {
  const update = (key: keyof QuoteDraft, value: string | number) => setDraft((current) => ({ ...current, [key]: value }));
  return <div className="form-content"><div className="form-title"><span><UserRound size={20} /></span><div><h2>Cliente y oportunidad</h2><p>Identifica para quien cotizas y que problema necesita resolver.</p></div></div><div className="field-grid"><label><span>Nombre del contacto</span><input value={draft.client} onChange={(event) => update('client', event.target.value)} placeholder="Ej. Maria Fernandez" /></label><label><span>Empresa o negocio</span><input value={draft.company} onChange={(event) => update('company', event.target.value)} placeholder="Ej. Bodega Central" /></label><label className="full"><span>Nombre del proyecto</span><input value={draft.project} onChange={(event) => update('project', event.target.value)} placeholder="Ej. Sistema de ventas e inventario" /></label><label><span>Presupuesto declarado</span><div className="money-field"><span>S/</span><input type="number" min="0" value={draft.budget} onChange={(event) => update('budget', Number(event.target.value))} /></div><small>No cambia el valor real del alcance.</small></label><label className="full"><span>Problema principal</span><textarea value={draft.problem} onChange={(event) => update('problem', event.target.value)} placeholder="Describe la operacion actual, los errores y el resultado esperado." rows={4} /></label></div></div>;
}

function OperationStep({ draft, updateIntake, recommendation }: { draft: QuoteDraft; updateIntake: QuoteWorkspaceProps['updateIntake']; recommendation: ReturnType<typeof recommendArchitecture> }) {
  const { intake } = draft;
  return <div className="form-content"><div className="form-title"><span><Gauge size={20} /></span><div><h2>Operacion y continuidad</h2><p>Las respuestas activan reglas deterministicas y explicables.</p></div></div><div className="field-grid compact"><label><span>Sucursales</span><input type="number" min="1" value={intake.branches} onChange={(event) => updateIntake('branches', Number(event.target.value))} /></label><label><span>Equipos</span><input type="number" min="1" value={intake.devices} onChange={(event) => updateIntake('devices', Number(event.target.value))} /></label><label><span>Usuarios</span><input type="number" min="1" value={intake.users} onChange={(event) => updateIntake('users', Number(event.target.value))} /></label><label><span>RAM del equipo principal</span><select value={intake.ramGb} onChange={(event) => updateIntake('ramGb', Number(event.target.value))}><option value={4}>4 GB o menos</option><option value={8}>8 GB</option><option value={16}>16 GB o mas</option></select></label><label><span>Calidad de Internet</span><select value={intake.internet} onChange={(event) => updateIntake('internet', event.target.value as Intake['internet'])}><option>ESTABLE</option><option>REGULAR</option><option>INESTABLE</option><option>INEXISTENTE</option></select></label></div><div className="toggle-list"><Toggle label="Debe operar sin Internet" checked={intake.offlineRequired} onChange={(value) => updateIntake('offlineRequired', value)} /><Toggle label="Necesita acceso remoto" checked={intake.remoteAccess} onChange={(value) => updateIntake('remoteAccess', value)} /><Toggle label="Acepta costos mensuales" checked={intake.acceptsMonthlyCosts} onChange={(value) => updateIntake('acceptsMonthlyCosts', value)} /></div><div className="recommendation"><div><Sparkles size={19} /><strong>{recommendation.architecture.replace('_', ' ')} · {recommendation.modality.replace('_', ' ')}</strong></div><p>{recommendation.reason}</p><ul>{recommendation.considerations.map((item) => <li key={item}>{item}</li>)}</ul></div></div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="toggle-row"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i /></label>;
}

function ModuleStep({ modules, draft, resolvedIds, toggleModule, dependenciesAdded }: { modules: ModuleDefinition[]; draft: QuoteDraft; resolvedIds: string[]; toggleModule: (id: string) => void; dependenciesAdded: number }) {
  const enabledModules = modules.filter((module) => module.active);
  const categories = [...new Set(enabledModules.map((module) => module.category))];
  return <div className="form-content"><div className="form-title"><span><PackageOpen size={20} /></span><div><h2>Alcance por modulos</h2><p>Selecciona necesidades; las dependencias tecnicas se incorporan al calculo.</p></div></div>{dependenciesAdded > 0 ? <div className="inline-alert"><Check size={18} /><span>Se agregaron {dependenciesAdded} dependencias necesarias. Estan marcadas como incluidas.</span></div> : null}<div className="module-groups">{categories.map((category) => <div key={category}><h3>{category}</h3><div className="module-grid">{enabledModules.filter((module) => module.category === category).map((module) => { const direct = draft.selectedIds.includes(module.id); const dependency = resolvedIds.includes(module.id) && !direct; return <button key={module.id} className={`module-option ${direct || dependency ? 'selected' : ''}`} onClick={() => toggleModule(module.id)}><span className="check-box">{direct || dependency ? <Check size={15} /> : null}</span><span><strong>{module.name}</strong><small>{module.hours} h · {module.complexity.replace('_', ' ')}</small></span><em>{dependency ? 'Dependencia' : money(module.price)}</em></button>; })}</div></div>)}</div></div>;
}

function PriceStep({ draft, setDraft, pricing, currentPrice, discount, phases, modules }: { draft: QuoteDraft; setDraft: React.Dispatch<React.SetStateAction<QuoteDraft>>; pricing: ReturnType<typeof calculatePrice>; currentPrice: number; discount: ReturnType<typeof discountStatus>; phases: ReturnType<typeof proposePhases>; modules: ModuleDefinition[] }) {
  const underBudget = draft.budget < pricing.suggestedPrice;
  return <div className="form-content"><div className="form-title"><span><CircleDollarSign size={20} /></span><div><h2>Precio y estrategia comercial</h2><p>El presupuesto orienta las fases, pero no redefine el valor del trabajo.</p></div></div><div className="price-breakdown"><div><span>Subtotal por modulos</span><strong>{money(pricing.moduleSubtotal)}</strong></div><div><span>Costo interno</span><strong>{money(pricing.technicalCost)}</strong></div><div><span>Minimo con margen</span><strong>{money(pricing.minimumPrice)}</strong></div><div className="highlight"><span>Precio sugerido</span><strong>{money(pricing.suggestedPrice)}</strong></div></div><label className="quoted-field"><span>Precio a cotizar</span><div className="quoted-input-row"><div className="money-field"><span>S/</span><input type="number" min="0" value={currentPrice} onChange={(event) => setDraft((current) => ({ ...current, quotedPrice: Number(event.target.value) }))} /></div><button type="button" className="icon-button" onClick={() => setDraft((current) => ({ ...current, quotedPrice: null }))} title="Usar precio sugerido actualizado" aria-label="Usar precio sugerido actualizado"><RotateCcw size={16} /></button></div><small>{draft.quotedPrice === null ? 'Sincronizado con el tarifario actual' : 'Ajuste comercial manual'}</small><small className={discount.label.toLowerCase()}>Descuento {discount.percent.toFixed(1)}% · Estado {discount.label}</small></label>{underBudget ? <div className="budget-warning"><strong>El presupuesto no cubre el alcance completo</strong><p>Faltan {money(pricing.suggestedPrice - draft.budget)}. No se aplico ningun descuento automatico: la opcion responsable es conservar el precio y dividir el alcance.</p></div> : null}<div className="phase-list"><div className="phase-heading"><h3>Propuesta por fases</h3><span>Total preservado: {money(phases.reduce((sum, phase) => sum + phase.amount, 0))}</span></div>{phases.map((phase) => <article key={phase.name}><div><span>{phase.name}</span><strong>{money(phase.amount)}</strong></div><p>{phase.moduleIds.map((id) => modules.find((module) => module.id === id)?.name).filter(Boolean).join(' · ')}</p></article>)}</div></div>;
}

export default App;
