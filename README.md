# Cotiza

MVP de un sistema privado de cotizacion de software y operacion comercial. El producto aplica reglas deterministicas para recomendar arquitectura, resolver dependencias, calcular precios y proponer fases cuando el presupuesto no cubre el alcance.

## Alcance actual

- Dashboard comercial con estados vacios y metricas derivadas de datos reales.
- Registro guiado de cliente, operacion, hardware y conectividad.
- Tarifario editable con precios, horas, complejidad, prioridad y dependencias.
- Recomendacion explicable de arquitectura local, cloud o hibrida.
- Costo tecnico, precio minimo por margen, precio sugerido y cotizado.
- Ajuste por fases sin reducir automaticamente el precio total.
- Login privado con Google mediante Managed Better Auth de Neon.
- Opcion de recordar cuenta sin almacenar tokens ni credenciales de Google.
- Borradores, tarifario y versiones persistidos en Neon con aislamiento por usuario.
- Interfaz responsive para escritorio, tablet y telefono.

## Desarrollo

```bash
npm install
npm run dev
```

Pruebas y compilacion:

```bash
npm test
npm run build
```

## Neon y autenticacion

1. Aplica `db/migrations/0001_initial.sql` al proyecto Neon.
2. Activa Managed Better Auth y la Data API con Neon Auth.
3. Define `VITE_NEON_DATABASE_URL` usando `.env.example` como referencia.
4. En produccion configura credenciales propias de Google y dominios confiables en Neon.

Las tablas usan Row-Level Security y `auth.user_id()` para aislar los datos de cada cuenta. La aplicacion no contiene ni expone la cadena PostgreSQL con contraseña.

## Produccion

La aplicacion esta desplegada en Vercel: https://cotizador-taupe-psi.vercel.app

## Limites conscientes del MVP

Managed Better Auth y la Data API de Neon estan marcados como Beta por el proveedor. Antes de produccion se necesitan pruebas de restauracion, controles administrativos, auditoria completa y las credenciales OAuth definitivas de Google.

La integracion CRM no puede implementarse de forma responsable sin identificar el CRM, sus tablas o API, autenticacion y fuente de verdad. El contrato pendiente esta en `docs/CRM_INTEGRATION.md`.
