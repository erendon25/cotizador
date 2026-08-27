# Arquitectura

## Estado actual

El MVP es una aplicacion React + TypeScript compilada con Vite. La interfaz consume funciones puras del dominio y persiste borradores, configuracion y snapshots mediante la Data API de Neon. Managed Better Auth protege el acceso con Google. No usa servicios de IA.

```text
React UI -> Managed Better Auth -> Neon Data API -> PostgreSQL + RLS
         -> casos de uso -> dominio puro
                         -> adaptadores futuros: PDF, CRM
```

`src/domain.ts` contiene reglas, formulas, dependencias y generacion de fases. `src/data.ts` contiene semillas configurables. `src/storage.ts` encapsula la persistencia. `src/auth.tsx` gestiona la sesion y el acceso.

## Evolucion propuesta

La siguiente fase debe mantener un monolito modular y agregar una API del mismo producto, PostgreSQL, sesiones seguras y RBAC. El dominio puro se reutiliza en el servidor; las decisiones de precio nunca deben confiar en datos calculados solo por el navegador.

```text
UI -> API/casos de uso -> dominio -> repositorios PostgreSQL
                              \-> adaptadores PDF y CRM
```

## Riesgos

- Managed Better Auth y Data API estan en Beta y requieren seguimiento de cambios.
- No hay CRM identificado; cualquier mapeo actual seria ficticio.
- PDF por impresion del navegador no reemplaza el documento comercial controlado.
- Los datos de demostracion no deben confundirse con actividad comercial real.
