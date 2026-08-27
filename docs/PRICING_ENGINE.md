# Motor de precios

Las formulas viven en `src/domain.ts` y no dependen de la interfaz.

```text
subtotal_modulos = suma(precio_tarifario_snapshot)
costo_tecnico = horas_snapshot * valor_hora_snapshot
precio_por_margen = costo_tecnico / (1 - margen_objetivo)
precio_minimo = max(costo_tecnico, precio_por_margen)
precio_automatico = subtotal_modulos
```

El margen se calcula sobre la venta, no como markup sobre costo. El precio automatico respeta exactamente el tarifario vigente, incluidas las dependencias seleccionadas. El precio minimo es un control de riesgo visible: si el tarifario queda por debajo, se advierte la diferencia sin reemplazar silenciosamente el precio configurado. El precio cotizado puede editarse y el sistema calcula su descuento.

Mientras una cotizacion sea un borrador, sus precios automaticos se recalculan con los modulos habilitados y las tarifas vigentes. Un ajuste comercial manual se representa por separado y se invalida cuando cambia el alcance o el tarifario. Al guardar una version se persisten el calculo y los modulos como snapshot; los cambios posteriores del tarifario no reescriben esa version.

Cuando el presupuesto es menor, `proposePhases` distribuye modulos completos en fases por prioridad y conserva el total. El presupuesto nunca se usa para reducir automaticamente todos los precios.
