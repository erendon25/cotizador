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
