# Modelo de datos

La migracion inicial crea `workspace_states` para borradores y tarifario del usuario, y `quote_versions` para snapshots inmutables. Los usuarios y sesiones pertenecen al esquema administrado `neon_auth`.

Ambas tablas de aplicacion guardan `user_id`, habilitan RLS y aplican politicas con `auth.user_id()`. El rol `authenticated` recibe permisos solo sobre estas tablas; las solicitudes sin sesion no tienen acceso.

La siguiente fase debe normalizar el nucleo comercial en `contacts`, `prospects`, `pipeline_events`, `intake_sessions`, `hardware_devices`, `modules`, `module_dependencies`, `module_price_history`, `pricing_config`, `rules`, `quotes`, `quote_items`, `quote_phases`, `negotiations`, `payments`, `projects`, `crm_sync_jobs` y `audit_logs`.

Las cotizaciones aceptadas, pagos y proyectos deben usar borrado logico. Cada version guarda snapshots de precio, horas, complejidad, valor/hora, margen, arquitectura, reglas y texto comercial para que el tarifario vivo no reescriba el pasado.

Indices requeridos: codigo comercial, email normalizado, telefono, RUC, estado, fecha, `deleted_at` y claves externas del CRM.
