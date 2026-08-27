# Plan previo a implementación

## 1. Modelo conceptual propuesto

Este modelo es deliberadamente conceptual hasta conocer el CRM.

| Área | Entidades principales | Invariantes |
| --- | --- | --- |
| CRM | referencia de cliente, referencia de negocio, sincronización | el CRM conserva la identidad maestra |
| Prospectos | prospecto, empresa, transición de estado, observación | transiciones y cambios sensibles auditados |
| Levantamiento | negocio, dispositivo, conectividad, requisito | datos de entrada conservados por revisión |
| Tarifario | módulo, categoría, versión de precio, dependencia | una versión usada nunca se reescribe |
| Configuración | multiplicador, regla de precio, regla de arquitectura | vigencia, prioridad y versión explícitas |
| Cotización | cotización, versión, línea snapshot, fase, pago | versiones emitidas inmutables |
| Negociación | evento, proponente, monto, comentario | historial append-only |
| Ejecución | horas reales por módulo/proyecto | separado de la estimación congelada |

Cada línea de cotización debe copiar nombre, precio, complejidad, cantidad,
fórmula y versión de configuración utilizados. Así, modificar el tarifario no
altera documentos históricos.

Los cinco importes (`costo técnico`, `mínimo`, `sugerido`, `cotizado` y
`cerrado`) serán campos distintos o eventos distintos según el modelo final;
nunca aliases de un único campo mutable.

## 2. Reglas iniciales que validará el diseño

- Una sucursal, un equipo, sin acceso remoto ni mensualidades: arquitectura
  local, aunque el hardware sea antiguo.
- Varias sucursales con Internet estable y acceso remoto: arquitectura cloud.
- Varias sucursales con operación offline obligatoria: arquitectura híbrida y
  sincronización, con prioridad superior a la regla cloud.
- Si el presupuesto es inferior al precio completo: conservar el precio total y
  proponer fases por prioridad/dependencias; nunca crear un descuento automático.
- Si el cerrado o cotizado queda bajo el mínimo: permitirlo solo con advertencia
  visible y auditoría de la decisión comercial.

La división por fases deberá respetar dependencias, elementos indivisibles y un
alcance mínimo funcional. No debe presentarse como un problema de “llenar” el
presupuesto exactamente si ello produce una fase incoherente.

## 3. Fases propuestas

### Paso previo — desbloqueo del CRM

1. Obtener repositorio, rama, esquema/migraciones y ejemplo anonimizado.
2. Ejecutar el CRM y sus pruebas sin modificarlo.
3. documentar identidad de cliente, negocio/proyecto, autenticación y extensión.
4. Acordar estrategia de deduplicación (por ID, RUC normalizado, correo u otra).
5. Registrar una decisión arquitectónica y pedir aprobación.

### Fase 1 — núcleo cotizable

- modelo persistente compatible con el CRM;
- autenticación/autorización reutilizada;
- prospectos y clientes referenciados;
- CRUD de tarifario, historial y dependencias;
- motor básico de precios puro y probado;
- borrador de cotización con los cinco importes separados.

**Criterio de salida:** se puede crear una cotización reproducible a partir de
datos configurables, sin IA y sin alterar cotizaciones anteriores.

### Fase 2 — levantamiento y recomendación

- asistente de negocio, hardware e Internet;
- clasificación configurable de hardware;
- motor central de reglas con prioridades y explicación;
- arquitecturas local, local con backup, cloud e híbrida;
- pruebas de los casos A, B y C.

### Fase 3 — presupuesto y negociación

- versiones inmutables `COT-n Vn`;
- eventos de negociación;
- descuento e impacto contra mínimo;
- propuesta de fases dependiente de prioridades;
- prueba del caso D.

### Fase 4 — documento, cierre e integración

- plantilla pública sin información interna y exportación PDF;
- esquemas de pago configurables;
- validación y confirmación de trato cerrado;
- integración idempotente con el CRM e historial de sincronización.

### Fase 5 — aprendizaje operativo

- dashboard y métricas;
- horas reales;
- regla determinística de posible subvaloración;
- rentabilidad estimada y comparación cotizado/cerrado.

## 4. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| CRM no disponible | bloquea modelo e integración confiables | no programar el conector; solicitar acceso primero |
| Duplicación de clientes | dos fuentes de verdad | referencia al ID maestro y operación idempotente |
| Reglas contradictorias | recomendación imprevisible | prioridades, validación y traza de reglas activadas |
| Cambios de tarifario | altera históricos | snapshots y configuración versionada |
| Dependencias circulares | módulos imposibles de resolver | validación de ciclos al guardar y prueba del grafo |
| Fases comercialmente inútiles | mala propuesta al presupuesto | prioridad, dependencias y alcance mínimo funcional |
| Datos internos en PDF | exposición de margen | DTO/plantilla pública separada y pruebas de contrato |
| Sincronización parcial | cierre duplicado o perdido | estado durable, idempotencia y reintentos auditados |

## 5. Decisiones solicitadas

Antes de implementar cambios estructurales se requiere:

1. acceso o ruta al CRM existente y, si aplica, instrucciones para ejecutarlo;
2. aprobación del monolito modular como dirección inicial;
3. confirmación de que el CRM será la fuente maestra de clientes;
4. aprobación del alcance y criterio de salida de la Fase 1;
5. definición de moneda, impuestos y política de redondeo, que afectan el motor.
