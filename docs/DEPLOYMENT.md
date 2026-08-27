# Despliegue

El MVP puede ejecutarse localmente con Node.js 20 o posterior. Requiere `VITE_NEON_DATABASE_URL`, Managed Better Auth, Data API y la migracion inicial aplicada.

Para Google OAuth de desarrollo se pueden usar las credenciales compartidas de Neon. En produccion se deben registrar credenciales propias, usar `{NEON_AUTH_BASE_URL}/callback/google` como redirect autorizado y agregar el dominio de la aplicacion a los dominios confiables de Neon.

Antes de produccion se requieren ambientes separados, migraciones repetibles, secretos fuera del frontend, HTTPS, sesiones seguras, proteccion de rutas, backups cifrados, restauraciones verificadas, logs sanitizados y rollback documentado. El proveedor debe elegirse despues de conocer el CRM y el volumen real; un plan gratuito no debe tratarse como garantia permanente.
