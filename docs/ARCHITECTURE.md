# Arquitectura: inspección y propuesta

## 1. Resultado de la inspección

La inspección del repositorio del cotizador muestra un repositorio vacío: no hay
código fuente, manifiestos de dependencias, migraciones, modelos, variables de
entorno, infraestructura, pruebas ni documentación del CRM. Tampoco hay un
remoto Git configurado desde el cual inferir otro proyecto relacionado.

En consecuencia, **no es posible identificar todavía**:

- el lenguaje y framework del CRM;
- el motor y esquema de su base de datos;
- sus tablas o colecciones de clientes, negocios y actividades;
- su autenticación y autorización;
- la clave de deduplicación de clientes;
- si admite extensiones internas, acceso directo a datos, webhooks o API.

Crear ahora tablas definitivas o un conector supondría adivinar contratos y
podría producir precisamente la segunda fuente de verdad que se quiere evitar.

## 2. Arquitectura candidata (sujeta a inspección del CRM)

Se propone un **monolito modular privado**, no microservicios. La tecnología
concreta debe alinearse con el CRM para reutilizar conocimiento, despliegue,
autenticación y acceso a datos. Sus límites internos serían:

1. **Identidad y permisos**: usuarios, roles, protección de rutas y auditoría.
2. **Prospectos**: cliente, empresa, estado y levantamiento comercial/técnico.
3. **Tarifario**: módulos, versiones de precio, complejidades y dependencias.
4. **Reglas**: condiciones configurables, prioridad, vigencia y resultado.
5. **Cotizaciones**: cálculo, snapshots inmutables, fases y pagos.
6. **Negociación**: eventos cronológicos; nunca sobrescribe valores anteriores.
7. **Cierre/CRM**: validación transaccional y adaptador idempotente al CRM.
8. **Métricas**: lecturas agregadas sobre datos operativos, inicialmente sin un
   almacén analítico separado.

El frontend consume únicamente servicios del backend. Las reglas comerciales,
precios y secretos permanecen en servidor. El motor recibe una entrada
normalizada y una versión de configuración, y devuelve resultados explicables:
reglas activadas, fórmula aplicada, advertencias y recomendación.

## 3. Flujo determinístico propuesto

```text
levantamiento validado
  -> normalización de variables
  -> evaluación ordenada de reglas de arquitectura
  -> resolución de dependencias de módulos
  -> cálculo técnico con configuración versionada
  -> precio mínimo y sugerido
  -> validación contra presupuesto
  -> cotización completa o propuesta por fases
  -> snapshot inmutable de versión
```

La evaluación no contiene IA. Las reglas tendrán prioridad explícita para que,
por ejemplo, `offline requerido + varias sucursales` prevalezca sobre la regla
general que recomienda nube por cantidad de sucursales.

## 4. Estrategia de integración pendiente

Después de inspeccionar el CRM se elegirá, en este orden:

1. **Mismo modelo y misma base de datos**, si el cotizador puede ser un módulo
   seguro del CRM. Se referencia el identificador de cliente existente.
2. **API oficial del CRM**, con una clave idempotente por cierre y búsqueda antes
   de crear clientes.
3. **Adaptador transaccional controlado**, solo si el CRM no tiene API y su
   contrato de datos está documentado.

No se copiará el maestro de clientes sin una decisión explícita. El cierre debe
registrar estado de sincronización, identificador remoto, intentos y error
sanitizado, de modo que un reintento no duplique el negocio.

## 5. Seguridad mínima

- autenticación reutilizada del CRM cuando sea viable;
- autorización backend por capacidades, no solo ocultamiento de interfaz;
- validación de todas las entradas y protección CSRF según el framework;
- secretos exclusivamente en variables de entorno o gestor del despliegue;
- auditoría append-only para precios, reglas, permisos, cierre y sincronización;
- snapshots públicos de cotización separados de datos internos de margen.
