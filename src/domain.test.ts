import { describe, expect, it } from 'vitest';
import { calculatePrice, createModuleId, effectiveQuotedPrice, hasDependencyCycle, parseMoneyInput, proposePhases, recommendArchitecture, resolveDependencies, summarizeQuoteVersions } from './domain';
import { initialModules, pricingConfig } from './data';

describe('motor de arquitectura', () => {
  it('recomienda local para una PC, internet inestable y sin mensualidades', () => {
    const result = recommendArchitecture({
      branches: 1, devices: 1, users: 1, ramGb: 4, internet: 'INESTABLE',
      offlineRequired: true, remoteAccess: false, acceptsMonthlyCosts: false,
    });
    expect(result.architecture).toBe('LOCAL');
  });

  it('recomienda cloud para varias sedes con internet estable', () => {
    const result = recommendArchitecture({
      branches: 3, devices: 6, users: 8, ramGb: 8, internet: 'ESTABLE',
      offlineRequired: false, remoteAccess: true, acceptsMonthlyCosts: true,
    });
    expect(result.architecture).toBe('CLOUD');
  });

  it('recomienda hibrida para varias sedes con operacion offline', () => {
    const result = recommendArchitecture({
      branches: 3, devices: 6, users: 8, ramGb: 8, internet: 'INESTABLE',
      offlineRequired: true, remoteAccess: true, acceptsMonthlyCosts: true,
    });
    expect(result.architecture).toBe('HIBRIDA');
  });
});

describe('precios y alcance', () => {
  it('resuelve dependencias transitivas antes de calcular', () => {
    const selected = resolveDependencies(['pos'], initialModules);
    expect(selected).toEqual(expect.arrayContaining(['pos', 'ventas', 'caja', 'productos']));
  });

  it('calcula margen sobre venta, no markup', () => {
    const result = calculatePrice(['ventas'], initialModules, pricingConfig);
    expect(result.minimumPrice).toBeCloseTo((15 * 30) / (1 - 0.35), 4);
  });

  it('un presupuesto bajo crea fases y no devalua el total', () => {
    const selected = resolveDependencies(['pos', 'inventario', 'clientes', 'dashboard'], initialModules);
    const phases = proposePhases(selected, initialModules, 1000);
    const phasedTotal = phases.reduce((total, phase) => total + phase.amount, 0);
    const full = calculatePrice(selected, initialModules, pricingConfig).moduleSubtotal;
    expect(phases.length).toBeGreaterThan(1);
    expect(phasedTotal).toBeCloseTo(full, 4);
  });

  it('recalcula un borrador con la tarifa vigente cuando no hay ajuste manual', () => {
    const original = calculatePrice(['ventas'], initialModules, pricingConfig);
    const updatedModules = initialModules.map((module) => module.id === 'ventas' ? { ...module, price: 900 } : module);
    const updated = calculatePrice(['ventas'], updatedModules, pricingConfig);

    expect(updated.suggestedPrice).toBeGreaterThan(original.suggestedPrice);
    expect(effectiveQuotedPrice(null, updated.suggestedPrice)).toBe(updated.suggestedPrice);
    expect(effectiveQuotedPrice(750, updated.suggestedPrice)).toBe(750);
  });

  it('respeta el precio exacto del tarifario sin recargos ocultos ni minimo forzado', () => {
    const module = { ...initialModules[0], id: 'exacto', price: 35, hours: 80, complexity: 'MUY_ALTA' as const };
    const result = calculatePrice(['exacto'], [module], pricingConfig);
    const phases = proposePhases(['exacto'], [module], 1000);

    expect(result.moduleSubtotal).toBe(35);
    expect(result.suggestedPrice).toBe(35);
    expect(result.minimumPrice).toBeGreaterThan(result.suggestedPrice);
    expect(phases[0].amount).toBe(35);
  });

  it('excluye modulos deshabilitados y sus dependientes del alcance vivo', () => {
    const modules = initialModules.map((module) => module.id === 'productos' ? { ...module, active: false } : module);
    const selected = resolveDependencies(['pos'], modules);

    expect(selected).not.toContain('productos');
    expect(selected).not.toContain('ventas');
    expect(selected).not.toContain('pos');
    expect(calculatePrice(['productos'], modules, pricingConfig).suggestedPrice).toBe(0);
  });

  it('normaliza montos escritos con separadores habituales', () => {
    expect(parseMoneyInput('2500')).toBe(2500);
    expect(parseMoneyInput('2.500')).toBe(2500);
    expect(parseMoneyInput('2,500')).toBe(2500);
    expect(parseMoneyInput('S/ 2 500')).toBe(2500);
    expect(parseMoneyInput('')).toBe(0);
  });

  it('resume solo montos validos de versiones guardadas', () => {
    const result = summarizeQuoteVersions([
      { pricing: { quotedPrice: 1200 } },
      { pricing: { quotedPrice: 1800 } },
      { pricing: { quotedPrice: 'invalido' } },
    ]);

    expect(result).toEqual({ count: 3, total: 3000, average: 1000, highest: 1800 });
    expect(summarizeQuoteVersions([])).toEqual({ count: 0, total: 0, average: 0, highest: 0 });
  });
});

describe('administracion del tarifario', () => {
  it('genera identificadores estables y unicos para modulos nuevos', () => {
    expect(createModuleId('Gestion de almacenes', [])).toBe('gestion-de-almacenes');
    expect(createModuleId('Gestion de almacenes', ['gestion-de-almacenes'])).toBe('gestion-de-almacenes-2');
    expect(createModuleId('Áreas y categorías', [])).toBe('areas-y-categorias');
  });

  it('detecta dependencias circulares antes de guardar el tarifario', () => {
    const modules = [
      { ...initialModules[0], id: 'a', dependencies: ['b'] },
      { ...initialModules[1], id: 'b', dependencies: ['a'] },
    ];

    expect(hasDependencyCycle(modules)).toBe(true);
    expect(hasDependencyCycle(initialModules)).toBe(false);
  });
});
