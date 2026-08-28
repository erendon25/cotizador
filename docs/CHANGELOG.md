# Changelog

## 0.1.0 - 2026-08-27

- Dashboard comercial responsive.
- Flujo guiado de cotizacion en cuatro etapas.
- Motor deterministico de arquitectura y explicaciones.
- Tarifario editable, dependencias transitivas y complejidades.
- Calculo separado de costo, minimo, sugerido y cotizado.
- Propuesta por fases ante presupuesto insuficiente.
- Snapshots locales inmutables y pruebas de casos obligatorios.

## 0.2.0 - 2026-08-27

- Login obligatorio con Google mediante Managed Better Auth de Neon.
- Control Recordar cuenta que conserva solo perfil visible, nunca credenciales.
- Persistencia de borradores, tarifario y versiones en Neon Data API.
- Esquema PostgreSQL con indices, RLS y aislamiento por usuario.
- Estado visible de sincronizacion con Neon y cierre de sesion.

## 0.2.1 - 2026-08-27

- Recalculo inmediato de borradores al editar precios o habilitar modulos del tarifario.
- Separacion explicita entre precio sugerido automatico y ajuste comercial manual.
- Metricas del dashboard derivadas del borrador y de snapshots reales.
- Exclusion de modulos deshabilitados y de dependientes con requisitos inactivos.

## 0.2.2 - 2026-08-27

- Normalizacion consistente de presupuesto, precio cotizado y precios del tarifario.
- Soporte para montos escritos con separadores como `2.500`, `2,500` y `S/ 2 500`.
- Actualizacion inmediata del presupuesto declarado en el resumen y dashboard.

## 0.2.3 - 2026-08-27

- Navegacion funcional para Proyectos, Pagos, Metricas y Configuracion.
- Metricas calculadas exclusivamente desde snapshots guardados en Neon.
- Configuracion con estado de cuenta, sincronizacion y acceso al tarifario.
- Estados vacios reales para proyectos y pagos sin registros.

## 0.2.4 - 2026-08-27

- Precio automatico igual a la suma exacta del tarifario y sus dependencias.
- Eliminacion de multiplicadores y redondeos ocultos sobre precios editados.
- Minimo tecnico convertido en advertencia visible, sin sustituir el tarifario.
- Precio visible para cada dependencia incorporada al alcance.

## 0.2.5 - 2026-08-28

- Creacion funcional de modulos desde el tarifario.
- Edicion completa de nombre, categoria, precio, horas, complejidad, prioridad, dependencias y estado.
- Identificadores unicos generados automaticamente para modulos nuevos.
- Prevencion de ciclos de dependencias antes de guardar cambios.
- Nombres legibles de dependencias y acciones de edicion accesibles en la tabla.
