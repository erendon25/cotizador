# Motor de reglas

Las reglas actuales se evaluan de mayor a menor prioridad:

1. Varias sucursales y operacion offline obligatoria: `HIBRIDA`.
2. Varias sucursales con Internet estable: `CLOUD`.
3. Una sucursal, un equipo, sin acceso remoto ni mensualidades: `LOCAL`.
4. Internet inestable o continuidad offline: `LOCAL_CON_BACKUP`.
5. Caso general con conectividad: `CLOUD`.

Cada resultado contiene arquitectura, modalidad, motivo y consideraciones. En la fase de backend estas reglas deben persistirse como definiciones versionadas con prioridad, condiciones, resultado, mensaje, estado y estrategia explicita de desempate.
