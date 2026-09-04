![Logo](../../admin/vis-2-widgets-sigenergy.png)
# ioBroker.vis-2-widgets-sigenergy

[![NPM version](https://img.shields.io/npm/v/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
[![Downloads](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
![Number of Installations](https://iobroker.live/badges/vis-2-widgets-sigenergy-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/vis-2-widgets-sigenergy-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy.png?downloads=true)](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy/)

**Tests:** ![Test and Release](https://github.com/ssbingo/ioBroker.vis-2-widgets-sigenergy/workflows/Test%20and%20Release/badge.svg)

## ioBroker 的 vis-2-widgets-sigenergy 适配器

用于 Sigenergy 储能适配器的 VIS-2 小部件集 (`ioBroker.sigenergy`).
包含 8 个小部件,用于可视化和控制能量流、电池状态、实时功率、每日统计、AC 充电器、DC 充电器、逆变器和 SigenMicro 微型逆变器概览。

## 要求

- 已安装并配置 `sigenergy` 适配器的 ioBroker
- ioBroker VIS-2 适配器(≥ 2.0.0)

## 小部件

### 能量流图
Displays the current energy flow between solar panels, battery, grid and house as an animated SVG diagram.
Animated arrows visualise active connections in real time.

**OIDs:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Energy Flow Diagram](../../img/widget-energiefluss.png)

#### Flow directions

| Data point | Value > 0 | Value < 0 |
|---|---|---|
| `essPower` | Battery charging → arrow from centre to battery | Battery discharging → arrow from battery to centre |
| `gridActivePower` | Grid consumption → arrow from grid to centre | Grid feed-in → arrow from centre to grid |
| `pvPower` | PV producing → arrow from PV to centre | — |
| `housePower` | House consuming → arrow from centre to house | — |

### 电池状态与预测
Displays SOC, SOH, charging power and forecasts for time to full charge, remaining runtime, self-consumption and autarky rate.

**OIDs:** `essSoc`, `essSoh`, `essPower`, `batteryTimeToFull`, `batteryTimeRemaining`, `selfConsumptionRate`, `autarkyRate`

![Battery Status & Forecasts](../../img/widget-batterie.png)

### 实时功率
Compact list view of all current power values with colour-coded direction indicators.

**OIDs:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Real-Time Power](../../img/widget-leistung.png)

### 能量统计
Daily overview with autarky rate, self-consumption, SOC history, charge/discharge energy and battery coverage.

**OIDs:** `autarkyRate`, `selfConsumptionRate`, `dayMaxSoc`, `dayMinSoc`, `essDailyChargeEnergy`, `essDailyDischargeEnergy`, `batteryCoverageToday`, `batteryDailyChargeTime`

![Energy Statistics](../../img/widget-statistiken.png)

### AC Charger (Sigen EVAC)
Monitoring and control of the Sigenergy AC charger (EVAC). Shows charging power, system state, rated power, rated current and total energy consumed. Alarms are highlighted in colour. The charging current can be set directly via a slider (6–32 A).

**OIDs:** `acCharger.systemState`, `acCharger.chargingPower`, `acCharger.totalEnergyConsumed`, `acCharger.ratedPower`, `acCharger.ratedCurrent`, `acCharger.alarm1/2/3`, `acCharger.control.startStop`, `acCharger.control.outputCurrent`

![AC Charger](../../img/widget-ac-charger.png)

### DC 充电器
Monitoring and control of the Sigenergy DC charger. Shows output power, vehicle SOC with progress bar, vehicle battery voltage, charging current and the energy and duration of the current charging session.

**OIDs:** `dcCharger.outputPower`, `dcCharger.vehicleSoc`, `dcCharger.vehicleBatteryVoltage`, `dcCharger.chargingCurrent`, `dcCharger.currentChargingCapacity`, `dcCharger.currentChargingDuration`, `dcCharger.control.startStop`

![DC Charger](../../img/widget-dc-charger.png)

### 逆变器
Comprehensive monitoring and control of the inverter with tab navigation. Displays operating state, power data, battery temperatures, phase voltages, all 5 alarm registers and device information (model, serial number, firmware).

| Tab | Content |
|---|---|
| **Power** | Active power, PV power, battery charge/discharge power, power share slider (−100 % to +100 %) |
| **Battery** | SOC & SOH with bars, avg. cell temperature/voltage, max./min. temperature |
| **Grid** | Phase voltages L1/L2/L3, grid frequency, power factor, PCS internal temperature |
| **Alarms** | 5 alarm registers (PCS ×2, ESS, gateway, DC charger) with hex code and colour marking |
| **Info** | Model type, serial number, firmware version, Remote-EMS toggle |

![Inverter](../../img/widget-inverter.png)

**OIDs:** `inverter.activePower`, `inverter.pvPower`, `inverter.essChargeDischargePower`, `inverter.runningState`, `inverter.essBatterySoc/Soh`, `inverter.essAvgCellTemperature/Voltage`, `inverter.phaseA/B/CVoltage`, `inverter.gridFrequency`, `inverter.pcsInternalTemp`, `inverter.alarm1–5`, `inverter.firmwareVersion`, `inverter.modelType`, `inverter.serialNumber`, `inverter.control.startStop`, `inverter.control.remoteEmsDispatchEnable`, `inverter.control.activePowerPercent`

### PV Power
Display of up to 3 PV strings with live power values and animated flow arrows leading to the hybrid inverter. Arrow colours change dynamically based on power level (orange <1 kW, yellow <2 kW, green >2 kW).

#### Widget settings
| Parameter | Type | Default | Description |
|---|---|---|---|
| oid_pv1 … oid_pv3 | OID | sigenergy.0.plant.pv1Power … pv3Power | PV string power OIDs |
| oid_pvtotal | OID | sigenergy.0.plant.pvPower | Total PV power OID |
| sig_title | text | PV Power | Widget title |
| sig_name1 … sig_name3 | text | String 1 … String 3 | Configurable names per string |
| sig_darkmode | checkbox | true | Dark / Light mode |

![PV Power](../../img/PV-PowerOverview.png)

**OIDs:** `plant.pv1Power`, `plant.pv2Power`, `plant.pv3Power`, `plant.pvPower`

### SigenMicro 概览
Overview and detail view of all SigenMicro micro-inverters connected via Modbus. Tab 1 shows all devices as an animated network segment (Ethernet bus topology with vertical drop lines). Each additional tab shows all 15 registers of the respective device in ascending order.

| Tab | Content |
|---|---|
| **Overview** | All devices as animated bus topology, aggregate tiles (total power, daily yield, lifetime yield, online count) |
| **Device 01–20** | Device image top-left (10 px offset), model/serial/firmware/status badge, all 15 registers (01–15) with value, unit and OID path |

#### Network segment animation
The horizontal backbone line and the vertical drop lines show animated dashes that flow along the cables when a device is active (Running). Inactive devices (Standby/Fault) show only the dark base line without animation.

#### Dynamic layout
| Devices | Rows | Image size |
|---|---|---|
| 1–5 | 1 row | 80 × 90 px |
| 6–10 | 1 row | 52 × 60 px |
| 11–15 | 2 rows | 46 × 52 px |
| 16–20 | 2 rows | 40 × 46 px |

#### Widget settings
| Parameter | Type | Default | Description |
|---|---|---|---|
| micro_count | number (1–20) | 3 | Number of micro-inverters to display |
| sig_title | text | SigenMicro Micro-Inverter | Widget title |
| sig_darkmode | checkbox | true | Dark / Light mode |
| oid_micro1 … oid_micro20 | OID | — | Anchor OID per device (e.g. sigenergy.0.sigenmicro.11.outputPower) |

![SigenMicro Übersicht — Übersichts-Tab](../../img/widget-microinverter_01.png)

![SigenMicro Übersicht — Detail-Tab](../../img/widget-microinverter_02.png)

**OIDs (per device, prefix sigenergy.0.sigenmicro.<slaveId>):**
modelType, serialNumber, firmwareVersion, runningState, outputPower, gridFrequency, temperature, mppt1Voltage, mppt1Current, mppt1Power, mppt2Voltage, mppt2Current, mppt2Power, dailyYield, totalYield

### 车辆电量显示 (EV SOC)
将可配置的车辆图片（如 Fiat 500e）作为中心视觉元素显示。右上角的彩色徽章显示闪电符号、当前电量百分比和标签"LADESTAND"。底部的进度条反映当前 SOC。当可选充电状态激活时，徽章会发出绿色脉冲光晕。

#### 颜色逻辑
| 电量 | 颜色 |
|---|---|
| ≤ 15 % | 红色 (#f87171) |
| ≤ 35 % | 黄色 (#fbbf24) |
| > 35 % | 绿色 (#4ade80) |

#### 控件设置
| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| oid_ev_soc | OID | — | 电量 0–100 |
| oid_charging | OID | — | 充电状态（可选）— 充电时绿色光晕 |
| sig_title | 文本 | Fahrzeug-Ladestand | 图片下方显示的车辆名称 |
| sig_car_image | 图片 | — | 来自 ioBroker 文件浏览器的车辆图片（如 /vis-2/img/） |
| sig_darkmode | 复选框 | true | 深色 / 浅色模式 |

![Fahrzeug-Ladestand Widget](../../img/widget-autoLadestand.png)

**OIDs:** `oid_ev_soc`, `oid_charging`

## 外观

所有小部件均支持**浅色和深色模式**,可通过小部件设置 `Dark mode` 切换。

## 更新日志
### 1.8.4 (2026-09-04)
* (ssbingo) 最低 admin 要求降至 >=7.8.23（不再需要 admin 8）
* (ssbingo) CI：ioBroker/testing-action-deploy 锁定为主版本 v1；修复 Dependabot 自动合并工作流
* (ssbingo) 更新依赖：@tsconfig/node22 22.0.6、@alcalzone/release-script-plugin-license 5.2.2

### 1.8.3 (2026-08-05)
* (ssbingo) 已声明最低要求：js-controller >=6.0.11、admin >=8.0.0、Node.js >=22
* (ssbingo) 更新依赖：actions/checkout 7.0.1、ioBroker/testing-action-deploy 1.5.2、@iobroker/testing 5.3.0

### 1.8.2 (2026-06-28)
* (ssbingo) 更新 CI actions：actions/checkout 至 v7.0.0，ioBroker/testing-action-deploy 至 v1.5.0

### 1.8.1 (2026-06-08)
* (ssbingo) 修复 io-package.json 中的 JSON 语法错误；文档中添加了控件截图

### 1.8.0 (2026-06-08)
* (ssbingo) 新控件：「车辆电量显示」——显示可配置的电动汽车图片，带动画 SOC 进度条、颜色编码电量（红/黄/绿）和可选闪烁充电徽章

### 1.7.9 (2026-05-27)
* (ssbingo) 删除了过时的 .eslintrc.json 和 .prettierignore

### 1.7.8 (2026-05-27)
* (ssbingo) 添加了 ESLint 代码检查，CI 更新至 Node.js 24；适配器需要 node.js >= 22

### 1.7.7 (2026-04-20)
* (ssbingo) 文本在非等比缩放时不再变形 — 字母保持原有比例,同时容器继续填满小部件区域

### 1.7.6 (2026-04-20)
* (ssbingo) 缩放现在是非等比的:宽度和高度独立响应容器变化,两个轴可分别调节

### 1.7.5 (2026-04-20)
* (ssbingo) 小部件缩放现在也会响应高度变化 — 内容在两个轴上按比例缩放并在小部件中居中

### 1.7.4 (2026-04-20)
* (ssbingo) 所有 9 个小部件现在会随着小部件大小响应式地缩放其内容(字体、间距、SVG、图像)

### 1.7.3 (2026-04-20)
* (ssbingo) 所有 9 个小部件现在共享基于 PV-Power 小部件设计的统一背景

## Documentation

- 🇬🇧 [English](README.md) — this file
- 🇩🇪 [Deutsch](doc/de/README.md)
- 🇷🇺 [Русский](doc/ru/README.md)
- 🇳🇱 [Nederlands](doc/nl/README.md)
- 🇫🇷 [Français](doc/fr/README.md)
- 🇮🇹 [Italiano](doc/it/README.md)
- 🇪🇸 [Español](doc/es/README.md)
- 🇵🇱 [Polski](doc/pl/README.md)
- 🇵🇹 [Português](doc/pt/README.md)

## License
MIT License

Copyright (c) 2026 ssbingo <s.sternitzke@online.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
