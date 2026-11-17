![Logo](../../admin/vis-2-widgets-sigenergy.png)
# ioBroker.vis-2-widgets-sigenergy

[![NPM version](https://img.shields.io/npm/v/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
[![Downloads](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
![Number of Installations](https://iobroker.live/badges/vis-2-widgets-sigenergy-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/vis-2-widgets-sigenergy-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy.png?downloads=true)](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy/)

**Tests:** ![Test and Release](https://github.com/ssbingo/ioBroker.vis-2-widgets-sigenergy/workflows/Test%20and%20Release/badge.svg)

## Адаптер vis-2-widgets-sigenergy для ioBroker

Набір віджетів VIS-2 для адаптера накопичувача енергії Sigenergy (`ioBroker.sigenergy`).
Містить 10 віджетів для візуалізації та керування потоком енергії, статусом батареї, миттєвою потужністю, щоденною статистикою, AC-зарядним пристроєм, DC-зарядним пристроєм, інвертором, оглядом мікроінверторів SigenMicro, PV-стрінгами та рівнем заряду автомобіля.

Починаючи з версії 2.0.0 віджети є нативним набором React-віджетів для vis-2 (React 19, MUI 9).

## Вимоги

- ioBroker зі встановленим і налаштованим адаптером `sigenergy`
- Адаптер ioBroker VIS-2 (≥ 2.20.0) — vis-2 2.20 є першою версією на основі React 19 та MUI 9
- Класичний VIS (vis-1) не підтримується

## Оновлення з версії 1.x

- Наявні віджети продовжують працювати без повторного розміщення: ідентифікатори віджетів і всі налаштування (ідентифікатори об'єктів, заголовки, темний режим, назви) залишилися такими самими, як раніше.
- Спочатку потрібно оновити vis-2 до версії 2.20.0 або новішої. Старіші версії vis-2 працюють на React 18 і не можуть завантажити цей набір віджетів.
- Усі тексти відображаються мовою vis-2 (11 мов). Власноруч введені заголовки зберігаються; порожній заголовок показує стандартний заголовок мовою користувача.
- Пояснення статусу (AC/DC-зарядний пристрій) відображаються у спливаючій підказці, яку віджет більше не обрізає і яка залишається читабельною за будь-якого розміру віджета.

## Віджети

### Діаграма потоку енергії
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

### Статус батареї та прогнози
Displays SOC, SOH, charging power and forecasts for time to full charge, remaining runtime, self-consumption and autarky rate.

**OIDs:** `essSoc`, `essSoh`, `essPower`, `batteryTimeToFull`, `batteryTimeRemaining`, `selfConsumptionRate`, `autarkyRate`

![Battery Status & Forecasts](../../img/widget-batterie.png)

### Потужність у реальному часі
Compact list view of all current power values with colour-coded direction indicators.

**OIDs:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Real-Time Power](../../img/widget-leistung.png)

### Статистика енергії
Daily overview with autarky rate, self-consumption, SOC history, charge/discharge energy and battery coverage.

**OIDs:** `autarkyRate`, `selfConsumptionRate`, `dayMaxSoc`, `dayMinSoc`, `essDailyChargeEnergy`, `essDailyDischargeEnergy`, `batteryCoverageToday`, `batteryDailyChargeTime`

![Energy Statistics](../../img/widget-statistiken.png)

### AC Charger (Sigen EVAC)
Monitoring and control of the Sigenergy AC charger (EVAC). Shows charging power, system state, rated power, rated current and total energy consumed. Alarms are highlighted in colour. The state badge shows the simplified charging state according to IEC 61851-1 (Initialising, Free, Connected, Charging, Error); hovering over it reveals a detailed explanation of the current state. The charging current can be set directly via a slider (6 A up to the charger's rated current); the upper limit can additionally be capped with the widget setting `sig_maxCurrent`. While charging is active, the Start button is locked and the Stop button is highlighted.

**OIDs:** `acCharger.systemState`, `acCharger.chargingPower`, `acCharger.totalEnergyConsumed`, `acCharger.ratedPower`, `acCharger.ratedCurrent`, `acCharger.alarm1/2/3`, `acCharger.control.startStop`, `acCharger.control.outputCurrent`

![AC Charger](../../img/widget-ac-charger.png)

### DC-зарядний пристрій
Monitoring and control of the Sigenergy DC charger. Shows output power, vehicle SOC with progress bar, vehicle battery voltage, charging current and the energy and duration of the current charging session. The state badge shows the operating state of the charging station (`dcCharger.runningState`: free, connected/preparing, scheduled, charging, discharging, ended, warning, fault/unavailable); hovering over it reveals a detailed explanation. While charging or discharging is active, the Start button is locked and the Stop button is highlighted. If the state OID is not set, it is derived from the output power OID; without a state value the badge falls back to the output power and the tooltip explains why, depending on the protocol version detected by the adapter.

**OIDs:** `dcCharger.runningState`, `dcCharger.outputPower`, `dcCharger.vehicleSoc`, `dcCharger.vehicleBatteryVoltage`, `dcCharger.chargingCurrent`, `dcCharger.currentChargingCapacity`, `dcCharger.currentChargingDuration`, `dcCharger.control.startStop`, `info.protocolVersion` (`oid_protocol`)

![DC Charger](../../img/widget-dc-charger.png)

### Інвертор
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

### Огляд SigenMicro
Огляд і детальне представлення мікроінверторів SigenMicro. Починаючи з `ioBroker.sigenergy` 3.5.0 адаптер зчитує їх через хмару Sigenergy (вкладка «SigenMicro (Cloud)» у налаштуваннях адаптера) і створює для кожного мікроінвертора пристрій у `sigenergy.0.sigenmicro.<серійний номер>`. **Потрібен `ioBroker.sigenergy` ≥ 3.5.0 з увімкненою хмарою.** Хмара опитується кожні 300 с (OpenAPI) або 60 с (інтерфейс застосунку), тому віджет не може оновлюватися частіше.

| Вкладка | Вміст |
|---|---|
| **Overview** | Усі пристрої у вигляді анімованої шини змінного струму зі станом кожного пристрою; плитки: потужність AC (сума адаптера `sigenmicro.totalPower`, інакше сума пристроїв), вироблення за сьогодні, вироблення за весь час і кількість пристроїв у мережі |
| **по вкладці на пристрій** | Зображення, назва, номінальна потужність, серійний номер, прошивка, час останнього оновлення з хмари, значок стану, усі поточні значення з одиницями та OID, а також повідомлені адаптером входи PV pv1 … pv4 |

#### Стан
| Стан | Умова | Відображення |
|---|---|---|
| Producing | `online` = true, `activePower` > 0 | зелений, шина анімована |
| Online | `online` = true, `activePower` = 0 | синій |
| Offline | `online` = false — уночі це нормально | сірий |
| No data | значення ще не отримано | сірий |

Якщо `info.cloudConnection` дорівнює `false`, віджет показує попередження «Cloud connection lost», оскільки значення можуть бути застарілими.

#### Динамічне компонування
| Пристрої | Ряди | Розмір зображення |
|---|---|---|
| 1–5 | 1 ряд | 80 × 90 px |
| 6–10 | 1 ряд | 52 × 60 px |
| 11–15 | 2 ряди | 46 × 52 px |
| 16–20 | 2 ряди | 40 × 46 px |

#### Налаштування віджета
| Параметр | Тип | Типово | Опис |
|---|---|---|---|
| micro_count | число (1–20) | 3 | Кількість мікроінверторів для відображення |
| sig_title | текст | SigenMicro Micro-Inverter | Заголовок віджета |
| sig_darkmode | checkbox | true | Темний / світлий режим |
| micro_device1 … micro_device20 | вибір | — | Мікроінвертор зі списку пристроїв SigenMicro екземплярів sigenergy (серійний номер і назва). Віджет сам зчитує всі стани пристрою. Віджети з 1.x зберігають попередній вибір стану |
| micro_take_all | кнопка | — | Одразу бере всі пристрої SigenMicro облікового запису (кількість і вибір) |
| micro_name1 … micro_name20 | текст | — | Відображувана назва пристрою (типово: Micro 01, Micro 02, …) |

![Огляд SigenMicro — Overview](../../img/widget-microinverter_01.png)

![Огляд SigenMicro — Деталі](../../img/widget-microinverter_02.png)

**Стани пристрою (`sigenergy.0.sigenmicro.<serial>`):**
online, activePower, reactivePower, pvPower, pv1…pv4.voltage / current / power, gridVoltage, gridCurrent, gridFrequency, powerFactor, temperature, insulationResistance, dailyYield, totalYield, serialNumber, firmware, ratedPower, lastUpdate

**Додатково:** `sigenergy.0.sigenmicro.totalPower`, `sigenergy.0.info.cloudConnection` — екземпляр береться з вибраного OID

> **Оновлення з 1.8.x:** колишніх станів Modbus (`runningState`, `outputPower`, `mppt*`, `modelType` …) в адаптері більше немає. Знову виберіть мікроінвертори в налаштуваннях віджета — зі списку або кнопкою «Взяти всі SigenMicro».

### Рівень заряду автомобіля (EV SOC)
Відображає налаштовуване зображення автомобіля (наприклад, Fiat 500e) як центральний візуальний елемент. Кольоровий значок у правому верхньому куті показує символ блискавки, поточний рівень заряду у відсотках і напис «ЗАРЯД» (перекладається). Смуга прогресу внизу відображає поточний SOC. Коли опціональний стан зарядки активний, значок пульсує зеленим світінням.

#### Кольорова логіка
| Рівень заряду | Колір |
|---|---|
| ≤ 15 % | Червоний (#f87171) |
| ≤ 35 % | Жовтий (#fbbf24) |
| > 35 % | Зелений (#4ade80) |

#### Налаштування віджету
| Параметр | Тип | За замовчуванням | Опис |
|---|---|---|---|
| oid_ev_soc | OID | — | Рівень заряду 0–100 |
| oid_charging | OID | — | Стан зарядки (опційно) — зелений glow при активній зарядці |
| sig_title | текст | — (порожній: «Рівень заряду автомобіля», перекладається) | Назва автомобіля під зображенням |
| sig_car_image | зображення | — | Зображення автомобіля з файлового браузера ioBroker (напр. /vis-2/img/) |
| sig_darkmode | прапорець | true | Темний / Світлий режим |

![EV SOC](../../img/widget-autoLadestand.png)

**OIDs:** `oid_ev_soc`, `oid_charging`

## Зовнішній вигляд

Усі віджети підтримують **світлий і темний режим**, що перемикається через налаштування `Dark mode`. Віджети масштабуються разом зі своїм розміром: ширина й висота змінюються разом із віджетом незалежно одна від одної, а текст зберігає свої пропорції.

## Журнал змін
### 2.0.1 (2026-11-17)
* (ssbingo) Оновлено знімки екрана в README: усі віджети в тому вигляді, в якому їх показує набір React-віджетів у vis-2 2.20, з англійськими текстами
* (ssbingo) Оновлено залежності (vite 7.3.8, `@iobroker/gui-components` 10.4.6, `@iobroker/testing` 6.3.2)

### 2.0.0 (2026-11-17)
* (ssbingo) **Breaking:** віджети тепер є нативним набором React-віджетів для vis-2 (React 19, MUI 9) і потребують vis-2 2.20.0 або новішої версії. Класичний VIS (vis-1) більше не підтримується
* (ssbingo) Наявні віджети продовжують працювати без повторного розміщення: ідентифікатори віджетів і всі налаштування не змінилися
* (ssbingo) Усі тексти перекладено 11 мовами ioBroker (раніше переважно німецькою). Введені заголовки зберігаються; порожній заголовок показує стандартний заголовок мовою користувача
* (ssbingo) AC/DC-зарядний пристрій: пояснення статусу — це спливаюча підказка MUI, яку віджет більше не обрізає; струм зарядки та частка потужності EMS — це повзунки MUI, які записують значення після відпускання
* (ssbingo) З редактора vis-2 більше не надсилаються команди; клік у ньому лише виділяє віджет
* (ssbingo) Потік енергії: налаштування «Анімований потік» тепер діє
* (ssbingo) SigenMicro: вкладка деталей показує значення у трьох стовпцях, ідентифікатор об'єкта — в одному рядку
* (ssbingo) SigenMicro: мікроінвертори вибираються в редакторі за пристроєм (серійний номер і назва) з пристроїв SigenMicro екземплярів sigenergy; віджет сам зчитує всі стани. Нова кнопка «Взяти всі SigenMicro» одразу бере всі пристрої. Віджети з 1.x працюють далі з попереднім вибором стану
* (ssbingo) Збірка за допомогою Vite та федерації модулів; віджети протестовано у vis-2 2.20.11

### 1.9.1 (2026-11-17)
* (ssbingo) vis-2 2.20.x: віджети знову самі задають `box-sizing: border-box` для власного вмісту. vis-2 2.20 більше не завантажує `CssBaseline` з MUI, який раніше перемикав увесь документ на border-box, через що картки, плитки й кнопки з відступами могли ставати ширшими, ніж задумано. Правило діє лише для цього набору віджетів; набір не містить коду React/MUI і працює як класичний набір віджетів vis у vis-2 2.20 (React 19, MUI 9)

### 1.9.0 (2026-11-17)
* (ssbingo) **Огляд SigenMicro перероблено під нове хмарне підключення `ioBroker.sigenergy` 3.5.0.** Віджет тепер читає `sigenergy.0.sigenmicro.<серійний номер>.*` (online, activePower, pvPower, входи PV pv1…pv4, параметри мережі, температура, опір ізоляції, вироблення, прошивка, номінальна потужність, останнє оновлення), суму облікового запису `sigenmicro.totalPower` та `info.cloudConnection`. Колишню модель регістрів Modbus (`runningState`, `outputPower`, `mppt*`, `modelType`) вилучено
* (ssbingo) SigenMicro: стан визначається за `online` і потужністю AC (Producing / Online / Offline / No data), попередження при втраті зв'язку з хмарою, час останнього оновлення з хмари та номінальна потужність на вкладці пристрою, входи PV показуються лише за наявності даних, нова необов'язкова відображувана назва для кожного пристрою (`micro_nameN`), усі тексти віджета англійською
* (ssbingo) SigenMicro: опорним OID може бути будь-який стан мікроінвертора; похідні стани тепер підписуються через `vis.conn.subscribe` (VIS підписує лише OID з атрибутів) і звільняються під час видалення віджета. **Після оновлення знову виберіть для кожного `oid_microN` стан у `sigenergy.0.sigenmicro.<серійний номер>`**
* (ssbingo) CI: workflow автозлиття Dependabot оновлено за шаблоном ioBroker — використовується `pull_request` замість `pull_request_target` (#46, #47); `@iobroker/testing` оновлено з 6.2.1 до 6.3.1

### 1.8.11 (2026-09-12)
* (ssbingo) CI: тести пакета тепер виконуються на Node.js 22, 24 і 26 (нове завдання `adapter-tests`, repository checker #41); `@iobroker/testing` оновлено з 5.3.0 до 6.2.1

### 1.8.10 (2026-09-07)
* (ssbingo) Запис `admin` видалено з `globalDependencies`: набір віджетів не має інтерфейсу адміністратора, тому вимагати версію admin не потрібно (repository checker S1091)

### 1.8.9 (2026-09-07)
* (ssbingo) DC-зарядний пристрій: станція, що позначає регістр робочого стану як недійсний, більше не відображається з червоним значком «Unbekannt». Протокол Sigenergy позначає «регістр недійсний» встановленням усіх бітів, і SigenStor EC **з** DC-зарядним пристроєм відповідає так для регістра 31513, тоді як сусідні регістри (номінальна потужність, виробіток PV, лічильники) читаються нормально. У цьому випадку значок визначається за вихідною потужністю, а підказка пояснює, що це не проблема адаптера чи конфігурації
* (ssbingo) DC-зарядний пристрій: розпізнається й сире значення 65535, тому значок коректний і з версіями адаптера до 3.3.1, які передають це значення замість відсутності значення
* (ssbingo) DC-зарядний пристрій: нове налаштування OID `oid_protocol` (за замовчуванням `sigenergy.0.info.protocolVersion`). Раніше версія протоколу виводилася лише з префікса екземпляра; такий OID VIS не підписує, `vis.states` залишався порожнім, і підказка стверджувала «версію протоколу ще не визначено», хоча адаптер визначив V2.9 під час запуску. Оголошена як звичайний атрибут `/id`, вона підписується як будь-який інший OID
* (ssbingo) DC-зарядний пристрій: якщо версію протоколу не можна прочитати, підказка більше не стверджує, що її не визначено, а повідомляє, що тут вона недоступна для читання, і вказує на нове налаштування
* (ssbingo) DC-зарядний пристрій: переформульовано підказку, яка показується, коли адаптер не повідомляє стан, хоча пристрій оголошує протокол V2.8 або новіший; вона більше не стверджує, що потрібне оновлення адаптера, оскільки сама станція може позначити регістр як недійсний

### 1.8.8 (2026-09-07)
* (ssbingo) DC-зарядний пристрій: якщо OID стану не задано, він виводиться з OID вихідної потужності (…dcCharger.outputPower → …dcCharger.runningState), тому віджети, розміщені до 1.8.7, показують робочий стан без редагування
* (ssbingo) DC-зарядний пристрій: якщо робочий стан недоступний, підказка пояснює причину залежно від версії протоколу, визначеної адаптером (`info.protocolVersion` / `info.protocolLevel`): регістр 31513 потребує протоколу Sigenergy V2.8; починаючи з V2.8 вона відсилає до журналу адаптера або оновлення адаптера; від'ємна вихідна потужність відображається як розряджання

### 1.8.7 (2026-09-07)
* (ssbingo) DC-зарядний пристрій: новий OID стану `dcCharger.runningState` (за замовчуванням) – значок стану тепер показує робочий стан зарядної станції (вільно, підключено/підготовка, заплановано, заряджання, розряджання, завершено, попередження, помилка/недоступно) з докладним поясненням у підказці; без OID значок, як і раніше, визначається за вихідною потужністю
* (ssbingo) DC-зарядний пристрій: під час активного заряджання або розряджання кнопка Start заблокована, а кнопка Stop виділена; від'ємна вихідна потужність (розряджання) відображається фіолетовим

### 1.8.6 (2026-09-07)
* (ssbingo) AC-зарядний пристрій: підказка на значку стану тепер відображається як окреме спливаюче вікно з фіксованим розміром шрифту та непрозорим фоном, тому вона читабельна незалежно від розміру віджета і більше не перекривається вмістом віджета
* (ssbingo) AC-зарядний пристрій: під час активного заряджання кнопка Start заблокована, а кнопка Stop виділена
* (ssbingo) Набір віджетів тепер повідомляє правильну версію в консолі браузера

### 1.8.5 (2026-09-07)
* (ssbingo) AC-зарядний пристрій: повзунок струму заряджання тепер обмежений номінальним струмом зарядного пристрою; нове налаштування віджета `sig_maxCurrent` для ручної верхньої межі (запобігає помилкам Modbus при встановленні значень вище номінального струму)
* (ssbingo) AC-зарядний пристрій: стан системи тепер охоплює всі стани IEC 61851-1 (0–7: ініціалізація, вільно, підключено, заряджання, помилка); при наведенні на значок стану відображається докладне пояснення

### 1.8.4 (2026-09-04)
* (ssbingo) Мінімальну вимогу до admin знижено до >=7.8.23 (admin 8 більше не потрібен)
* (ssbingo) CI: ioBroker/testing-action-deploy закріплено на мажорній версії v1; виправлено workflow автозлиття Dependabot
* (ssbingo) Оновлено залежності: @tsconfig/node22 22.0.6, @alcalzone/release-script-plugin-license 5.2.2

### 1.8.3 (2026-08-05)
* (ssbingo) Оголошено мінімальні вимоги: js-controller >=6.0.11, admin >=8.0.0, Node.js >=22
* (ssbingo) Оновлено залежності: actions/checkout 7.0.1, ioBroker/testing-action-deploy 1.5.2, @iobroker/testing 5.3.0

### 1.8.2 (2026-06-28)
* (ssbingo) Оновлено CI-дії: actions/checkout до v7.0.0, ioBroker/testing-action-deploy до v1.5.0

### 1.8.1 (2026-06-08)
* (ssbingo) Виправлено синтаксичну помилку JSON у io-package.json; до документації додано знімок екрана віджета

### 1.8.0 (2026-06-08)
* (ssbingo) Новий віджет: «Рівень заряду автомобіля» — показує налаштовуване зображення електромобіля з анімованою смугою SOC, кольоровим рівнем заряду (червоний/жовтий/зелений) та опціональним мигаючим значком зарядки

### 1.7.9 (2026-05-27)
* (ssbingo) Видалено застарілі .eslintrc.json і .prettierignore

### 1.7.8 (2026-05-27)
* (ssbingo) Додано ESLint, CI оновлено до Node.js 24; адаптер вимагає node.js >= 22

### 1.7.7 (2026-04-20)
* (ssbingo) Текст більше не спотворюється при нерівномірному масштабуванні — літери зберігають пропорції, а контейнери продовжують заповнювати область віджета

### 1.7.6 (2026-04-20)
* (ssbingo) Масштабування тепер нерівномірне: ширина та висота реагують незалежно на зміни контейнера, обидві осі залишаються окремо регульованими

### 1.7.5 (2026-04-20)
* (ssbingo) Масштабування віджетів тепер реагує також на зміни висоти — вміст масштабується пропорційно по обох осях і центрується у віджеті

### 1.7.4 (2026-04-20)
* (ssbingo) Усі 9 віджетів тепер адаптивно масштабують свій вміст відповідно до розміру віджета (шрифти, відступи, SVG, зображення)

### 1.7.3 (2026-04-20)
* (ssbingo) Усі 9 віджетів тепер мають уніфікований фон на основі дизайну віджета PV-Power

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
