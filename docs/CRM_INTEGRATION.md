# Integracion CRM

## Estado

Bloqueada por falta de identificacion y contrato del CRM. No se ha creado una integracion simulada.

## Informacion necesaria

- Repositorio o URL del CRM y propietario tecnico.
- Modelo de cliente, oportunidad, proyecto, pago y actividad.
- Mecanismo de autenticacion y autorizacion.
- API disponible o repositorios internos autorizados.
- Fuente de verdad para contactos, montos, estados y pagos.
- Clave externa estable y reglas reales de deduplicacion.

## Contrato previsto

Al cerrar una version, el adaptador usara `quote_version_id + evento` como clave idempotente. Primero resolvera el contacto por ID externo y claves normalizadas; luego creara o actualizara el trato/proyecto con el snapshot aprobado. Un trabajo solo se marcara sincronizado tras confirmacion del CRM. Los errores conservaran estado, intento, fecha, respuesta sanitizada y opcion de reintento seguro.
