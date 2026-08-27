# Cotizador de proyectos

Este repositorio está en **fase de descubrimiento**. Todavía no contiene una
aplicación ni una integración con CRM. La primera inspección encontró únicamente
el historial de Git y un archivo marcador; por tanto, no existe código, esquema
de base de datos, configuración de despliegue ni CRM que se pueda reutilizar en
este repositorio.

No se implementará una arquitectura estructural hasta que se confirme dónde se
encuentra el CRM existente y se apruebe la propuesta técnica.

## Principios acordados

- El motor de precios y recomendaciones será totalmente determinístico. No se
  incorporarán APIs de IA, servicios de IA de pago ni LLM locales.
- La falta de presupuesto reducirá alcance o generará fases; nunca cambiará por
  sí sola el valor del trabajo completo.
- Precios, multiplicadores, reglas y dependencias serán datos configurables y
  conservarán historial.
- Las versiones emitidas de una cotización serán inmutables.
- Se priorizará un monolito modular, software libre y una única fuente de verdad.

## Documentos de descubrimiento

- [Arquitectura actual y propuesta](docs/ARCHITECTURE.md)
- [Plan de ejecución, modelo conceptual y riesgos](docs/DISCOVERY_PLAN.md)

## Decisiones pendientes antes de programar

1. Facilitar la ubicación o acceso al repositorio del CRM existente.
2. Confirmar su tecnología, base de datos, modelos de cliente y mecanismo de
   autenticación.
3. Elegir, a partir de esa inspección, entre ampliar el CRM o integrar un módulo
   del cotizador en el mismo despliegue.
4. Aprobar el alcance de la Fase 1 descrito en el plan.
