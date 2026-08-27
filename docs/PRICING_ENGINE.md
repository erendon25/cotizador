# Motor de precios

Las formulas viven en `src/domain.ts` y no dependen de la interfaz.

```text
subtotal_modulos = suma(precio_base_snapshot * multiplicador_complejidad)
costo_tecnico = horas_snapshot * valor_hora_snapshot
precio_por_margen = costo_tecnico / (1 - margen_objetivo)
precio_minimo = max(costo_tecnico, precio_por_margen)
precio_sugerido = redondear_a_50(max(subtotal_modulos, precio_minimo))
```

El margen se calcula sobre la venta, no como markup sobre costo. El precio cotizado puede editarse, pero el sistema calcula su descuento y lo clasifica como normal, advertencia o critico.

Cuando el presupuesto es menor, `proposePhases` distribuye modulos completos en fases por prioridad y conserva el total. El presupuesto nunca se usa para reducir automaticamente todos los precios.
