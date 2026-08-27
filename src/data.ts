import type { ModuleDefinition, PricingConfig } from './domain';

export const pricingConfig: PricingConfig = {
  hourlyRate: 30,
  targetMargin: 0.35,
  warningDiscount: 0.1,
  criticalDiscount: 0.2,
  weeklyCapacity: 20,
  deliveryBuffer: 0.2,
};

export const initialModules: ModuleDefinition[] = [
  { id: 'login', name: 'Login', category: 'Base', price: 150, hours: 5, complexity: 'BAJA', priority: 'CRITICO', dependencies: [], active: true },
  { id: 'usuarios', name: 'Usuarios', category: 'Base', price: 200, hours: 7, complexity: 'BAJA', priority: 'IMPORTANTE', dependencies: ['login'], active: true },
  { id: 'roles', name: 'Roles y permisos', category: 'Base', price: 250, hours: 9, complexity: 'MEDIA', priority: 'IMPORTANTE', dependencies: ['usuarios'], active: true },
  { id: 'clientes', name: 'Clientes', category: 'Comercial', price: 200, hours: 7, complexity: 'BAJA', priority: 'IMPORTANTE', dependencies: [], active: true },
  { id: 'productos', name: 'Productos', category: 'Operaciones', price: 250, hours: 9, complexity: 'BAJA', priority: 'CRITICO', dependencies: [], active: true },
  { id: 'categorias', name: 'Categorias', category: 'Operaciones', price: 100, hours: 3, complexity: 'BAJA', priority: 'IMPORTANTE', dependencies: ['productos'], active: true },
  { id: 'proveedores', name: 'Proveedores', category: 'Compras', price: 200, hours: 7, complexity: 'BAJA', priority: 'IMPORTANTE', dependencies: [], active: true },
  { id: 'inventario', name: 'Inventario basico', category: 'Operaciones', price: 350, hours: 13, complexity: 'MEDIA', priority: 'CRITICO', dependencies: ['productos'], active: true },
  { id: 'kardex', name: 'Kardex', category: 'Operaciones', price: 350, hours: 13, complexity: 'MEDIA', priority: 'IMPORTANTE', dependencies: ['inventario'], active: true },
  { id: 'compras', name: 'Compras', category: 'Compras', price: 300, hours: 11, complexity: 'MEDIA', priority: 'IMPORTANTE', dependencies: ['proveedores', 'inventario'], active: true },
  { id: 'ventas', name: 'Ventas', category: 'Comercial', price: 400, hours: 15, complexity: 'MEDIA', priority: 'CRITICO', dependencies: ['productos'], active: true },
  { id: 'caja', name: 'Caja', category: 'Comercial', price: 400, hours: 15, complexity: 'MEDIA', priority: 'CRITICO', dependencies: ['ventas'], active: true },
  { id: 'pos', name: 'Punto de venta', category: 'Comercial', price: 500, hours: 18, complexity: 'ALTA', priority: 'CRITICO', dependencies: ['ventas', 'caja', 'productos'], active: true },
  { id: 'reportes', name: 'Reportes basicos', category: 'Analitica', price: 250, hours: 9, complexity: 'MEDIA', priority: 'IMPORTANTE', dependencies: [], active: true },
  { id: 'dashboard', name: 'Dashboard', category: 'Analitica', price: 300, hours: 11, complexity: 'MEDIA', priority: 'OPCIONAL', dependencies: ['reportes'], active: true },
  { id: 'pdf', name: 'Exportacion PDF', category: 'Integraciones', price: 150, hours: 5, complexity: 'BAJA', priority: 'OPCIONAL', dependencies: [], active: true },
  { id: 'auditoria', name: 'Auditoria', category: 'Seguridad', price: 350, hours: 13, complexity: 'ALTA', priority: 'IMPORTANTE', dependencies: ['usuarios'], active: true },
  { id: 'multi-almacen', name: 'Multi-almacen', category: 'Escala', price: 400, hours: 15, complexity: 'ALTA', priority: 'FUTURO', dependencies: ['inventario'], active: true },
  { id: 'multi-sucursal', name: 'Multi-sucursal', category: 'Escala', price: 600, hours: 22, complexity: 'MUY_ALTA', priority: 'FUTURO', dependencies: ['usuarios', 'roles', 'inventario'], active: true },
  { id: 'sincronizacion', name: 'Sincronizacion', category: 'Escala', price: 700, hours: 26, complexity: 'MUY_ALTA', priority: 'FUTURO', dependencies: ['multi-sucursal'], active: true },
  { id: 'offline', name: 'Funcionamiento offline', category: 'Escala', price: 500, hours: 18, complexity: 'ALTA', priority: 'FUTURO', dependencies: [], active: true },
  { id: 'backups', name: 'Backups automaticos', category: 'Seguridad', price: 250, hours: 8, complexity: 'MEDIA', priority: 'IMPORTANTE', dependencies: [], active: true },
];
