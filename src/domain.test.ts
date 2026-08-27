import { describe, expect, it } from 'vitest';
import { calculatePrice, proposePhases, recommendArchitecture, resolveDependencies } from './domain';
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
});
