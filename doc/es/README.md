![Logo](../../admin/vis-2-widgets-sigenergy.png)
# ioBroker.vis-2-widgets-sigenergy

[![Versión NPM](https://img.shields.io/npm/v/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
[![Descargas](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
![Número de instalaciones](https://iobroker.live/badges/vis-2-widgets-sigenergy-installed.svg)
![Versión actual en el repositorio estable](https://iobroker.live/badges/vis-2-widgets-sigenergy-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy.png?downloads=true)](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy/)

**Pruebas:** ![Prueba y publicación](https://github.com/ssbingo/ioBroker.vis-2-widgets-sigenergy/workflows/Test%20and%20Release/badge.svg)

## Adaptador vis-2-widgets-sigenergy para ioBroker

Conjunto de widgets VIS-2 para el adaptador de almacenamiento de energía Sigenergy (`ioBroker.sigenergy`).
Contiene 8 widgets para la visualización y control del flujo de energía, estado de la batería, potencia en tiempo real, estadísticas diarias, cargador AC, cargador DC, inversor y vista general de los microinversores SigenMicro. para la visualización y el control del flujo de energía, el estado de la batería, la potencia en tiempo real, las estadísticas diarias, el cargador AC, el cargador DC y el inversor.

## Requisitos

- ioBroker con el adaptador `sigenergy` instalado y configurado
- Adaptador ioBroker VIS-2 (≥ 2.0.0)

## Widgets

### Diagrama de flujo de energía
Muestra el flujo de energía actual entre los paneles solares, la batería, la red y el hogar como un diagrama SVG animado.
Las flechas animadas visualizan las conexiones activas en tiempo real.

**OIDs:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Diagrama de flujo de energía](../../img/widget-energiefluss.png)

#### Direcciones del flujo

| Punto de datos | Valor > 0 | Valor < 0 |
|---|---|---|
| `essPower` | Batería cargándose → flecha del centro a la batería | Batería descargándose → flecha de la batería al centro |
| `gridActivePower` | Consumo de red → flecha de la red al centro | Inyección a la red → flecha del centro a la red |
| `pvPower` | PV produciendo → flecha del PV al centro | — |
| `housePower` | Hogar consumiendo → flecha del centro al hogar | — |

### Estado de la batería y previsiones
Muestra SOC, SOH, potencia de carga y previsiones de tiempo de carga completa, autonomía restante, autoconsumo y tasa de autarquía.

**OIDs:** `essSoc`, `essSoh`, `essPower`, `batteryTimeToFull`, `batteryTimeRemaining`, `selfConsumptionRate`, `autarkyRate`

![Estado de la batería y previsiones](../../img/widget-batterie.png)

### Potencia en tiempo real
Vista de lista compacta de todos los valores de potencia actuales con indicadores de dirección codificados por colores.

**OIDs:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Potencia en tiempo real](../../img/widget-leistung.png)

### Estadísticas de energía
Resumen diario con tasa de autarquía, autoconsumo, historial de SOC, energía de carga/descarga y cobertura de la batería.

**OIDs:** `autarkyRate`, `selfConsumptionRate`, `dayMaxSoc`, `dayMinSoc`, `essDailyChargeEnergy`, `essDailyDischargeEnergy`, `batteryCoverageToday`, `batteryDailyChargeTime`

![Estadísticas de energía](../../img/widget-statistiken.png)

### Cargador AC (Sigen EVAC)
Monitorización y control del cargador AC Sigenergy (EVAC). Muestra la potencia de carga, el estado del sistema, la potencia nominal, la corriente nominal y el consumo total de energía. Las alarmas se resaltan con colores. La corriente de carga se puede ajustar directamente mediante un control deslizante (6–32 A).

**OIDs:** `acCharger.systemState`, `acCharger.chargingPower`, `acCharger.totalEnergyConsumed`, `acCharger.ratedPower`, `acCharger.ratedCurrent`, `acCharger.alarm1/2/3`, `acCharger.control.startStop`, `acCharger.control.outputCurrent`

![Cargador AC](../../img/widget-ac-charger.png)

### Cargador DC
Monitorización y control del cargador DC Sigenergy. Muestra la potencia de salida, el SOC del vehículo con barra de progreso, la tensión de la batería del vehículo, la corriente de carga y la energía y duración de la sesión de carga actual.

**OIDs:** `dcCharger.outputPower`, `dcCharger.vehicleSoc`, `dcCharger.vehicleBatteryVoltage`, `dcCharger.chargingCurrent`, `dcCharger.currentChargingCapacity`, `dcCharger.currentChargingDuration`, `dcCharger.control.startStop`

![Cargador DC](../../img/widget-dc-charger.png)

### Inversor
Monitorización y control completos del inversor con navegación por pestañas. Muestra el estado operativo, los datos de potencia, las temperaturas de la batería, las tensiones de fase, los 5 registros de alarma y la información del dispositivo (modelo, número de serie, firmware).

| Pestaña | Contenido |
|---|---|
| **Potencia** | Potencia activa, potencia PV, potencia de carga/descarga de batería, control deslizante de cuota de potencia (de −100 % a +100 %) |
| **Batería** | SOC y SOH con barras, temperatura/tensión media de celdas, temperatura máx./mín. |
| **Red** | Tensiones de fase L1/L2/L3, frecuencia de red, factor de potencia, temperatura interna PCS |
| **Alarmas** | 5 registros de alarma (PCS ×2, ESS, pasarela, cargador DC) con código hex y marcado de color |
| **Info** | Tipo de modelo, número de serie, versión de firmware, interruptor Remote-EMS |

![Inversor](../../img/widget-inverter.png)

**OIDs:** `inverter.activePower`, `inverter.pvPower`, `inverter.essChargeDischargePower`, `inverter.runningState`, `inverter.essBatterySoc/Soh`, `inverter.essAvgCellTemperature/Voltage`, `inverter.phaseA/B/CVoltage`, `inverter.gridFrequency`, `inverter.pcsInternalTemp`, `inverter.alarm1–5`, `inverter.firmwareVersion`, `inverter.modelType`, `inverter.serialNumber`, `inverter.control.startStop`, `inverter.control.remoteEmsDispatchEnable`, `inverter.control.activePowerPercent`

### PV Power
Visualización de hasta 3 strings PV con valores de potencia en vivo y flechas de flujo animadas hacia el inversor híbrido. Los colores de las flechas cambian dinámicamente según la potencia (naranja <1 kW, amarillo <2 kW, verde >2 kW).

#### Configuración del widget
| Parámetro | Tipo | Predeterminado | Descripción |
|---|---|---|---|
| oid_pv1 … oid_pv3 | OID | sigenergy.0.plant.pv1Power … pv3Power | OIDs de potencia por cadena PV |
| oid_pvtotal | OID | sigenergy.0.plant.pvPower | OID de potencia PV total |
| sig_title | texto | PV Power | Título del widget |
| sig_name1 … sig_name3 | texto | String 1 … String 3 | Nombres configurables por cadena |
| sig_darkmode | checkbox | true | Modo oscuro / claro |

![PV Power](../../img/PV-PowerOverview.png)

**OIDs:** `plant.pv1Power`, `plant.pv2Power`, `plant.pv3Power`, `plant.pvPower`

### Vista general SigenMicro
Vista general y detallada de todos los microinversores SigenMicro en el bus Modbus. La pestaña 1 muestra todos los dispositivos como segmento de red animado (topología de bus Ethernet con derivaciones verticales).

#### Diseño dinámico
| Dispositivos | Filas | Tamaño imagen |
|---|---|---|
| 1–5 | 1 fila | 80 × 90 px |
| 6–10 | 1 fila | 52 × 60 px |
| 11–15 | 2 filas | 46 × 52 px |
| 16–20 | 2 filas | 40 × 46 px |

### Nivel de carga del vehículo (EV SOC)
Muestra una imagen de vehículo configurable (p. ej. Fiat 500e) como elemento visual central. Un badge de color en la esquina superior derecha muestra un símbolo de rayo, el nivel de carga actual en porcentaje y la etiqueta «LADESTAND». Una barra de progreso en la parte inferior refleja el SOC actual. Cuando el estado de carga opcional está activo, el badge emite un brillo verde pulsante.

#### Lógica de colores
| Nivel de carga | Color |
|---|---|
| ≤ 15 % | Rojo (#f87171) |
| ≤ 35 % | Amarillo (#fbbf24) |
| > 35 % | Verde (#4ade80) |

![Fahrzeug-Ladestand Widget](../../img/widget-autoLadestand.png)

**OIDs:** `oid_ev_soc`, `oid_charging`

## Apariencia

Todos los widgets admiten un **modo claro y oscuro**, conmutable mediante el ajuste de widget `Modo oscuro`.

## Changelog
### 1.8.3 (2026-08-05)
* (ssbingo) Requisitos mínimos declarados: js-controller >=6.0.11, admin >=8.0.0, Node.js >=22
* (ssbingo) Dependencias actualizadas: actions/checkout 7.0.1, ioBroker/testing-action-deploy 1.5.2, @iobroker/testing 5.3.0

### 1.8.2 (2026-06-28)
* (ssbingo) Acciones CI actualizadas: actions/checkout a v7.0.0, ioBroker/testing-action-deploy a v1.5.0

### 1.8.1 (2026-06-08)
* (ssbingo) Corregido error de sintaxis JSON en io-package.json; captura de pantalla del widget añadida a la documentación

### 1.8.0 (2026-06-08)
* (ssbingo) Nuevo widget: "Nivel de carga del vehículo" — muestra una imagen EV configurable con barra SOC animada, nivel de carga en color (rojo/amarillo/verde) y badge de carga parpadeante opcional

### 1.7.9 (2026-05-27)
* (ssbingo) Eliminados .eslintrc.json y .prettierignore obsoletos

### 1.7.8 (2026-05-27)
* (ssbingo) ESLint añadido, CI actualizado a Node.js 24; el adaptador requiere node.js >= 22

### 1.7.7 (2026-04-20)
* (ssbingo) El texto ya no se distorsiona con el escalado no uniforme — las letras mantienen sus proporciones mientras los contenedores siguen ocupando el área del widget

### 1.7.6 (2026-04-20)
* (ssbingo) El escalado ahora es no uniforme: ancho y alto reaccionan de forma independiente a los cambios del contenedor, ambos ejes siguen siendo ajustables por separado

### 1.7.5 (2026-04-20)
* (ssbingo) El escalado de los widgets ahora también reacciona a los cambios de altura — el contenido se escala proporcionalmente en ambos ejes y se centra en el widget

### 1.7.4 (2026-04-20)
* (ssbingo) Los 9 widgets ahora escalan su contenido de forma adaptable al tamaño del widget (fuentes, espaciados, SVG, imágenes)

### 1.7.3 (2026-04-20)
* (ssbingo) Los 9 widgets ahora comparten un fondo unificado basado en el diseño del widget PV-Power

## Licencia
MIT License

Copyright (c) 2026 ssbingo <s.sternitzke@online.de>

Por la presente se concede permiso, de forma gratuita, a cualquier persona que obtenga
una copia de este software y de los archivos de documentación asociados (el «Software»),
para utilizar el Software sin restricciones, incluyendo sin limitación los derechos a usar,
copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del Software,
y para permitir a las personas a quienes se les proporcione el Software que lo hagan,
sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias
o partes sustanciales del Software.

EL SOFTWARE SE PROPORCIONA «TAL CUAL», SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA,
INCLUYENDO PERO NO LIMITADO A LAS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO
PARTICULAR Y NO INFRACCIÓN.

## Documentación

- 🇪🇸 [Español](../../doc/es/README.md) — este archivo
- 🇩🇪 [Deutsch](../../doc/de/README.md)
- 🇬🇧 [English](../../README.md)
- 🇷🇺 [Русский](../../doc/ru/README.md)
- 🇳🇱 [Nederlands](../../doc/nl/README.md)
- 🇫🇷 [Français](../../doc/fr/README.md)
- 🇮🇹 [Italiano](../../doc/it/README.md)
- 🇵🇱 [Polski](../../doc/pl/README.md)
- 🇵🇹 [Português](../../doc/pt/README.md)
