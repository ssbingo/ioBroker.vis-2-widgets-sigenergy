![Logo](../../admin/vis-2-widgets-sigenergy.png)
# ioBroker.vis-2-widgets-sigenergy

[![NPM-Version](https://img.shields.io/npm/v/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
[![Downloads](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
![Anzahl Installationen](https://iobroker.live/badges/vis-2-widgets-sigenergy-installed.svg)
![Aktuelle Version im Stable-Repository](https://iobroker.live/badges/vis-2-widgets-sigenergy-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy.png?downloads=true)](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy/)

**Tests:** ![Test und Release](https://github.com/ssbingo/ioBroker.vis-2-widgets-sigenergy/workflows/Test%20and%20Release/badge.svg)

## vis-2-widgets-sigenergy Adapter für ioBroker

VIS-2 Widget-Set für den Sigenergy-Energiespeicher-Adapter (`ioBroker.sigenergy`).
Enthält 8 Widgets zur Visualisierung und Steuerung von Energiefluss, Batteriestatus, Echtzeit-Leistung, Tagesstatistiken, AC-Lader, DC-Lader, Inverter und SigenMicro Mikro-Wechselrichter-Übersicht.

## Voraussetzungen

- ioBroker mit installiertem und konfiguriertem `sigenergy`-Adapter
- ioBroker VIS-2 Adapter (≥ 2.0.0)

## Widgets

### Energiefluss-Diagramm
Zeigt den aktuellen Energiefluss zwischen Solar, Batterie, Netz und Haus als animiertes SVG-Diagramm.
Fließende Pfeile visualisieren aktive Verbindungen in Echtzeit.

**OIDs:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Energiefluss-Diagramm](../../img/widget-energiefluss.png)

#### Flussrichtungen

| Datenpunkt | Wert > 0 | Wert < 0 |
|---|---|---|
| `essPower` | Batterie wird geladen → Pfeil von Mitte zur Batterie | Batterie entlädt → Pfeil von Batterie zur Mitte |
| `gridActivePower` | Netzbezug → Pfeil vom Netz zur Mitte | Einspeisung → Pfeil von Mitte zum Netz |
| `pvPower` | PV erzeugt → Pfeil von PV zur Mitte | — |
| `housePower` | Haus verbraucht → Pfeil von Mitte zum Haus | — |

### Akku-Status & Prognosen
Zeigt SOC, SOH, Ladeleistung sowie Prognosen für Ladezeit, Restlaufzeit, Eigenverbrauch und Autarkierate.

**OIDs:** `essSoc`, `essSoh`, `essPower`, `batteryTimeToFull`, `batteryTimeRemaining`, `selfConsumptionRate`, `autarkyRate`

![Akku-Status & Prognosen](../../img/widget-batterie.png)

### Echtzeit-Leistung
Kompakte Listenansicht aller aktuellen Leistungswerte mit farbkodierter Richtungsanzeige.

**OIDs:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Echtzeit-Leistung](../../img/widget-leistung.png)

### Energiestatistiken
Tagesübersicht mit Autarkierate, Eigenverbrauch, SOC-Verlauf, Lade-/Entladeenergie und Batteriedeckung.

**OIDs:** `autarkyRate`, `selfConsumptionRate`, `dayMaxSoc`, `dayMinSoc`, `essDailyChargeEnergy`, `essDailyDischargeEnergy`, `batteryCoverageToday`, `batteryDailyChargeTime`

![Energiestatistiken](../../img/widget-statistiken.png)

### AC-Lader (Sigen EVAC)
Überwachung und Steuerung des Sigenergy AC-Laders (EVAC). Zeigt Ladeleistung, Systemzustand, Nennleistung, Nennstrom und Gesamtenergieverbrauch. Alarme werden farblich hervorgehoben. Der Ladestrom lässt sich per Schieberegler (6–32 A) direkt einstellen.

**OIDs:** `acCharger.systemState`, `acCharger.chargingPower`, `acCharger.totalEnergyConsumed`, `acCharger.ratedPower`, `acCharger.ratedCurrent`, `acCharger.alarm1/2/3`, `acCharger.control.startStop`, `acCharger.control.outputCurrent`

![AC-Lader](../../img/widget-ac-charger.png)

### DC-Lader
Überwachung und Steuerung des Sigenergy DC-Laders. Zeigt Ausgangsleistung, Fahrzeug-SOC mit Fortschrittsbalken, Fahrzeugspannung, Ladestrom sowie Energie und Dauer der aktuellen Ladesitzung.

**OIDs:** `dcCharger.outputPower`, `dcCharger.vehicleSoc`, `dcCharger.vehicleBatteryVoltage`, `dcCharger.chargingCurrent`, `dcCharger.currentChargingCapacity`, `dcCharger.currentChargingDuration`, `dcCharger.control.startStop`

![DC-Lader](../../img/widget-dc-charger.png)

### Inverter
Umfassende Überwachung und Steuerung des Wechselrichters mit Tab-Navigation. Zeigt Betriebszustand, Leistungsdaten, Batterietemperaturen, Phasenspannungen, alle 5 Alarm-Register sowie Geräteinformationen (Modell, Seriennummer, Firmware).

| Tab | Inhalt |
|---|---|
| **Leistung** | Wirkleistung, PV-Leistung, Batterie-Lade/-Entladeleistung, Leistungsanteil-Slider (−100 % bis +100 %) |
| **Batterie** | SOC & SOH mit Balken, Ø Zelltemperatur, Ø Zellspannung, Max/Min Temperatur |
| **Netz** | Phasenspannungen L1/L2/L3, Netzfrequenz, Leistungsfaktor, PCS-Innentemperatur |
| **Alarme** | 5 Alarm-Register (PCS ×2, ESS, Gateway, DC-Lader) mit Hex-Code und Farbmarkierung |
| **Info** | Modelltyp, Seriennummer, Firmware-Version, Remote-EMS-Toggle |

![Inverter](../../img/widget-inverter.png)

**OIDs:** `inverter.activePower`, `inverter.pvPower`, `inverter.essChargeDischargePower`, `inverter.runningState`, `inverter.essBatterySoc/Soh`, `inverter.essAvgCellTemperature/Voltage`, `inverter.phaseA/B/CVoltage`, `inverter.gridFrequency`, `inverter.pcsInternalTemp`, `inverter.alarm1–5`, `inverter.firmwareVersion`, `inverter.modelType`, `inverter.serialNumber`, `inverter.control.startStop`, `inverter.control.remoteEmsDispatchEnable`, `inverter.control.activePowerPercent`

### PV Power
Darstellung von bis zu 3 PV-Strings mit Live-Leistungswerten und animierten Fluss-Pfeilen zum Hybrid-Wechselrichter. Pfeilfarben ändern sich dynamisch je nach Leistung (orange <1 kW, gelb <2 kW, grün >2 kW).

#### Widget-Einstellungen
| Parameter | Typ | Standard | Beschreibung |
|---|---|---|---|
| oid_pv1 … oid_pv3 | OID | sigenergy.0.plant.pv1Power … pv3Power | PV-String-Leistungs-OIDs |
| oid_pvtotal | OID | sigenergy.0.plant.pvPower | Gesamt-PV-Leistung OID |
| sig_title | Text | PV Power | Widget-Titel |
| sig_name1 … sig_name3 | Text | String 1 … String 3 | Frei wählbare Namen je String |
| sig_darkmode | Checkbox | true | Dunkel- / Hellmodus |

![PV Power](../../img/PV-PowerOverview.png)

**OIDs:** `plant.pv1Power`, `plant.pv2Power`, `plant.pv3Power`, `plant.pvPower`

### SigenMicro Übersicht
Übersicht und Detailansicht aller SigenMicro Mikro-Wechselrichter am Modbus-Bus. Tab 1 zeigt alle Geräte als animiertes Netzwerksegment (Ethernet-Bus-Topologie mit senkrechten Stichleitungen). Jeder weitere Tab zeigt alle 15 Register des jeweiligen Geräts in aufsteigender Reihenfolge.

| Tab | Inhalt |
|---|---|
| **Übersicht** | Alle Geräte als animierte Bus-Topologie, Aggregat-Kacheln (Gesamtleistung, Tagesertrag, Lebensertrag, Online-Anzahl) |
| **Gerät 01–20** | Gerätebild oben-links (10 px Abstand), Modell/Seriennummer/Firmware/Status-Badge, alle 15 Register (01–15) mit Wert, Einheit und OID-Pfad |

#### Netzwerksegment-Animation
Die waagerechte Backbone-Linie und die senkrechten Stichleitungen zeigen animierte Dashes, die bei aktiven Geräten (Running) entlang der Leitungen fließen. Inaktive Geräte (Standby/Fault) zeigen nur die dunkle Basislinie ohne Animation.

#### Dynamisches Layout
| Geräte | Zeilen | Bildgröße |
|---|---|---|
| 1–5 | 1 Zeile | 80 × 90 px |
| 6–10 | 1 Zeile | 52 × 60 px |
| 11–15 | 2 Zeilen | 46 × 52 px |
| 16–20 | 2 Zeilen | 40 × 46 px |

#### Widget-Einstellungen
| Parameter | Typ | Standard | Beschreibung |
|---|---|---|---|
| micro_count | Zahl (1–20) | 3 | Anzahl der anzuzeigenden Mikro-Wechselrichter |
| sig_title | Text | SigenMicro Micro-Inverter | Widget-Titel |
| sig_darkmode | Checkbox | true | Dunkel- / Hellmodus |
| oid_micro1 … oid_micro20 | OID | — | Anker-OID je Gerät (z.B. sigenergy.0.sigenmicro.11.outputPower) |

![SigenMicro Übersicht — Übersichts-Tab](../../img/widget-microinverter_01.png)

![SigenMicro Übersicht — Detail-Tab](../../img/widget-microinverter_02.png)

**OIDs (je Gerät, Präfix sigenergy.0.sigenmicro.<slaveId>):**
modelType, serialNumber, firmwareVersion, runningState, outputPower, gridFrequency, temperature, mppt1Voltage, mppt1Current, mppt1Power, mppt2Voltage, mppt2Current, mppt2Power, dailyYield, totalYield

### Fahrzeug-Ladestand (EV SOC)
Zeigt ein konfigurierbares Fahrzeugbild (z.B. Fiat 500e) als zentrales Sichtelement. Ein farbkodierter Badge in der oberen rechten Ecke zeigt ein Blitz-Symbol, den aktuellen Ladestand in Prozent und die Beschriftung „LADESTAND". Ein Ladebalken am unteren Rand spiegelt den aktuellen SOC wider. Wenn der optionale Lade-Status aktiv ist, pulsiert der Badge mit einem grünen Leuchten.

#### Farb-Logik
| Ladestand | Farbe |
|---|---|
| ≤ 15 % | Rot (#f87171) |
| ≤ 35 % | Gelb (#fbbf24) |
| > 35 % | Grün (#4ade80) |

#### Widget-Einstellungen
| Parameter | Typ | Standard | Beschreibung |
|---|---|---|---|
| oid_ev_soc | OID | — | Ladestand 0–100 |
| oid_charging | OID | — | Lade-Status (optional) — grüner Glow bei aktivem Laden |
| sig_title | Text | Fahrzeug-Ladestand | Fahrzeugname unter dem Bild |
| sig_car_image | Bild | — | Fahrzeugbild aus dem ioBroker-Datei-Browser (z.B. /vis-2/img/) |
| sig_darkmode | Checkbox | true | Dunkel- / Hellmodus |

![Fahrzeug-Ladestand Widget](../../img/widget-autoLadestand.png)

**OIDs:** `oid_ev_soc`, `oid_charging`

## Darstellung

Alle Widgets unterstützen einen **Hell- und Dunkelmodus**, der über die Widget-Einstellung `Dunkelmodus` umgeschaltet werden kann.

## Changelog
### 1.8.1 (2026-06-08)
* (ssbingo) JSON-Syntaxfehler in io-package.json behoben; Widget-Screenshot zur Dokumentation hinzugefügt

### 1.8.0 (2026-06-08)
* (ssbingo) Neues Widget: „Fahrzeug-Ladestand" — zeigt ein konfigurierbares Fahrzeugbild mit animiertem SOC-Balken, farbkodiertem Ladestand (rot/gelb/grün) und optionalem blinkendem Lade-Badge

### 1.7.9 (2026-05-27)
* (ssbingo) Veraltete .eslintrc.json und .prettierignore entfernt

### 1.7.8 (2026-05-27)
* (ssbingo) ESLint-Linting hinzugefügt, CI auf Node.js 24 aktualisiert; Adapter erfordert node.js >= 22

### 1.7.7 (2026-04-20)
* (ssbingo) Schrift wird bei non-uniform Skalierung nicht mehr verzerrt — Buchstaben behalten ihre Proportionen, während Container die Widget-Fläche weiterhin füllen

### 1.7.6 (2026-04-20)
* (ssbingo) Skalierung erfolgt jetzt non-uniform: Breite und Höhe reagieren unabhängig auf Container-Änderungen, beide Achsen bleiben einzeln anpassbar

### 1.7.5 (2026-04-20)
* (ssbingo) Widget-Skalierung reagiert jetzt auch auf Höhenänderungen — Inhalt skaliert proportional auf beiden Achsen und wird im Widget zentriert

### 1.7.4 (2026-04-20)
* (ssbingo) Alle 9 Widgets skalieren ihre Inhalte jetzt responsiv mit der Widget-Größe (Schrift, Abstände, SVG, Bilder)

### 1.7.3 (2026-04-20)
* (ssbingo) Alle 9 Widgets haben jetzt einen einheitlichen Hintergrund basierend auf dem PV-Power-Widget-Design

## Lizenz
MIT License

Copyright (c) 2026 ssbingo <s.sternitzke@online.de>

Hiermit wird unentgeltlich jeder Person, die eine Kopie der Software und der zugehörigen
Dokumentationen (die „Software") erhält, die Erlaubnis erteilt, sie uneingeschränkt zu nutzen,
inklusive und ohne Ausnahme mit dem Recht, sie zu verwenden, zu kopieren, zu verändern,
zusammenzuführen, zu veröffentlichen, zu verbreiten, zu unterlizenzieren und/oder zu verkaufen,
und Personen, denen diese Software überlassen wird, diese Rechte zu verschaffen, unter den
folgenden Bedingungen:

Der obige Urheberrechtsvermerk und dieser Erlaubnisvermerk sind in allen Kopien oder
wesentlichen Teilen der Software beizulegen.

DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT,
EINSCHLIEẞLICH DER GARANTIE ZUR BENUTZBARKEIT, EIGNUNG FÜR EINEN BESTIMMTEN ZWECK UND
NICHTVERLETZUNG. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR EINEN SCHADEN
ODER SONSTIGE ANSPRÜCHE HAFTBAR ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES,
EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER SOFTWARE ODER SONSTIGER VERWENDUNG
DER SOFTWARE ENTSTANDEN.

## Dokumentation

- 🇩🇪 [Deutsch](../../doc/de/README.md) — diese Datei
- 🇬🇧 [English](../../README.md)
- 🇷🇺 [Русский](../../doc/ru/README.md)
- 🇳🇱 [Nederlands](../../doc/nl/README.md)
- 🇫🇷 [Français](../../doc/fr/README.md)
- 🇮🇹 [Italiano](../../doc/it/README.md)
- 🇪🇸 [Español](../../doc/es/README.md)
- 🇵🇱 [Polski](../../doc/pl/README.md)
- 🇵🇹 [Português](../../doc/pt/README.md)
