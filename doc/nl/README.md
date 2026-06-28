![Logo](../../admin/vis-2-widgets-sigenergy.png)
# ioBroker.vis-2-widgets-sigenergy

[![NPM-versie](https://img.shields.io/npm/v/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
[![Downloads](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
![Aantal installaties](https://iobroker.live/badges/vis-2-widgets-sigenergy-installed.svg)
![Huidige versie in stabiele repository](https://iobroker.live/badges/vis-2-widgets-sigenergy-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy.png?downloads=true)](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy/)

**Tests:** ![Test en Release](https://github.com/ssbingo/ioBroker.vis-2-widgets-sigenergy/workflows/Test%20and%20Release/badge.svg)

## vis-2-widgets-sigenergy adapter voor ioBroker

VIS-2 widget-set voor de Sigenergy energieopslag-adapter (`ioBroker.sigenergy`).
Bevat 8 widgets voor visualisatie en besturing van energiestroom, batterijstatus, realtime vermogen, dagstatistieken, AC-lader, DC-lader, omvormer en SigenMicro micro-omvormer overzicht. voor visualisatie en bediening van energiestroom, batterijstatus, realtime vermogen, dagstatistieken, AC-lader, DC-lader en omvormer.

## Vereisten

- ioBroker met geïnstalleerde en geconfigureerde `sigenergy`-adapter
- ioBroker VIS-2 adapter (≥ 2.0.0)

## Widgets

### Energiestroom-diagram
Toont de huidige energiestroom tussen zonnepanelen, batterij, net en huis als geanimeerd SVG-diagram. Geanimeerde pijlen visualiseren actieve verbindingen in realtime.

**OID's:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Energiestroom-diagram](../../img/widget-energiefluss.png)

#### Stroomrichtingen

| Datapunt | Waarde > 0 | Waarde < 0 |
|---|---|---|
| `essPower` | Batterij wordt geladen → pijl van midden naar batterij | Batterij ontlaadt → pijl van batterij naar midden |
| `gridActivePower` | Netafname → pijl van net naar midden | Teruglevering → pijl van midden naar net |
| `pvPower` | PV produceert → pijl van PV naar midden | — |
| `housePower` | Huis verbruikt → pijl van midden naar huis | — |

### Batterijstatus & prognoses
Toont SOC, SOH, laadvermogen en prognoses voor laadtijd, resterende looptijd, eigenverbruik en zelfredzaamheidsgraad.

**OID's:** `essSoc`, `essSoh`, `essPower`, `batteryTimeToFull`, `batteryTimeRemaining`, `selfConsumptionRate`, `autarkyRate`

![Batterijstatus](../../img/widget-batterie.png)

### Realtime vermogen
Compacte lijstweergave van alle huidige vermogenswaarden met kleurgecodeerde richtingsindicatie.

**OID's:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Realtime vermogen](../../img/widget-leistung.png)

### Energiestatistieken
Dagoverzicht met zelfredzaamheidsgraad, eigenverbruik, SOC-verloop, laad-/ontlaadenergie en batterijdekking.

**OID's:** `autarkyRate`, `selfConsumptionRate`, `dayMaxSoc`, `dayMinSoc`, `essDailyChargeEnergy`, `essDailyDischargeEnergy`, `batteryCoverageToday`, `batteryDailyChargeTime`

![Energiestatistieken](../../img/widget-statistiken.png)

### AC-lader (Sigen EVAC)
Bewaking en bediening van de Sigenergy AC-lader (EVAC). Toont laadvermogen, systeemstatus, nominaal vermogen, nominale stroom en totaal energieverbruik. Alarmen worden met kleur gemarkeerd. De laadstroom is instelbaar via een schuifregelaar (6–32 A).

**OID's:** `acCharger.systemState`, `acCharger.chargingPower`, `acCharger.totalEnergyConsumed`, `acCharger.ratedPower`, `acCharger.ratedCurrent`, `acCharger.alarm1/2/3`, `acCharger.control.startStop`, `acCharger.control.outputCurrent`

![AC-lader](../../img/widget-ac-charger.png)

### DC-lader
Bewaking en bediening van de Sigenergy DC-lader. Toont uitgangsvermogen, voertuig-SOC met voortgangsbalk, voertuigbatterijspanning, laadstroom en energie en duur van de huidige laadsessie.

**OID's:** `dcCharger.outputPower`, `dcCharger.vehicleSoc`, `dcCharger.vehicleBatteryVoltage`, `dcCharger.chargingCurrent`, `dcCharger.currentChargingCapacity`, `dcCharger.currentChargingDuration`, `dcCharger.control.startStop`

![DC-lader](../../img/widget-dc-charger.png)

### Omvormer
Uitgebreide bewaking en bediening van de omvormer met tabnavigatie. Toont bedrijfsstatus, vermogensgegevens, batterijtemperaturen, fasenspanningen, alle 5 alarmregisters en apparaatinformatie (model, serienummer, firmware).

| Tab | Inhoud |
|---|---|
| **Vermogen** | Werkzaam vermogen, PV-vermogen, batterij laad-/ontlaadvermogen, vermogensaandeel-schuifregelaar (−100 % tot +100 %) |
| **Batterij** | SOC en SOH met balken, gem. celtemperatuur/-spanning, max./min. temperatuur |
| **Net** | Fasenspanningen L1/L2/L3, netfrequentie, vermogensfactor, PCS interne temperatuur |
| **Alarmen** | 5 alarmregisters (PCS ×2, ESS, gateway, DC-lader) met hex-code en kleurmarkering |
| **Info** | Modeltype, serienummer, firmwareversie, Remote-EMS-schakelaar |

![Omvormer](../../img/widget-inverter.png)

**OID's:** `inverter.activePower`, `inverter.pvPower`, `inverter.essChargeDischargePower`, `inverter.runningState`, `inverter.essBatterySoc/Soh`, `inverter.essAvgCellTemperature/Voltage`, `inverter.phaseA/B/CVoltage`, `inverter.gridFrequency`, `inverter.pcsInternalTemp`, `inverter.alarm1–5`, `inverter.firmwareVersion`, `inverter.modelType`, `inverter.serialNumber`, `inverter.control.startStop`, `inverter.control.remoteEmsDispatchEnable`, `inverter.control.activePowerPercent`

### PV Power
Weergave van maximaal 3 PV-strings met live vermogenswaarden en geanimeerde stroomspijlen naar de hybride omvormer. Pijlkleuren veranderen dynamisch afhankelijk van het vermogen (oranje <1 kW, geel <2 kW, groen >2 kW).

#### Widget-instellingen
| Parameter | Type | Standaard | Beschrijving |
|---|---|---|---|
| oid_pv1 … oid_pv3 | OID | sigenergy.0.plant.pv1Power … pv3Power | OID's van PV-string-vermogen |
| oid_pvtotal | OID | sigenergy.0.plant.pvPower | Totaal PV-vermogen OID |
| sig_title | tekst | PV Power | Widgettitel |
| sig_name1 … sig_name3 | tekst | String 1 … String 3 | Configureerbare namen per string |
| sig_darkmode | checkbox | true | Donker / Licht modus |

![PV Power](../../img/PV-PowerOverview.png)

**OIDs:** `plant.pv1Power`, `plant.pv2Power`, `plant.pv3Power`, `plant.pvPower`

### SigenMicro Overzicht
Overzicht en detailweergave van alle SigenMicro micro-omvormers op de Modbus-bus. Tab 1 toont alle apparaten als een geanimeerd netwerksegment (Ethernet-bustopologie met verticale aftakkingen).

#### Dynamische lay-out
| Apparaten | Rijen | Afbeeldingsgrootte |
|---|---|---|
| 1–5 | 1 rij | 80 × 90 px |
| 6–10 | 1 rij | 52 × 60 px |
| 11–15 | 2 rijen | 46 × 52 px |
| 16–20 | 2 rijen | 40 × 46 px |

### Voertuig laadniveau (EV SOC)
Toont een configureerbaar voertuigafbeelding (bijv. Fiat 500e) als centraal visueel element. Een kleurgecodeerde badge rechtsboven toont een bliksemschicht, het huidige laadniveau in procent en het label "LADESTAND". Een voortgangsbalk onderaan weerspiegelt de huidige SOC. Wanneer de optionele laadstatus actief is, pulseert de badge met een groene gloed.

#### Kleurlogica
| Laadniveau | Kleur |
|---|---|
| ≤ 15 % | Rood (#f87171) |
| ≤ 35 % | Geel (#fbbf24) |
| > 35 % | Groen (#4ade80) |

![Fahrzeug-Ladestand Widget](../../img/widget-autoLadestand.png)

**OIDs:** `oid_ev_soc`, `oid_charging`

## Weergave

Alle widgets ondersteunen een **lichte en donkere modus**, die kan worden omgeschakeld via de widget-instelling `Donkere modus`.

## Changelog
### 1.8.2 (2026-06-28)
* (ssbingo) CI-acties bijgewerkt: actions/checkout naar v7.0.0, ioBroker/testing-action-deploy naar v1.5.0

### 1.8.1 (2026-06-08)
* (ssbingo) JSON-syntaxisfout in io-package.json opgelost; widget-screenshot toegevoegd aan documentatie

### 1.8.0 (2026-06-08)
* (ssbingo) Nieuw widget: "Voertuig laadniveau" — toont een configureerbaar EV-afbeelding met geanimeerde SOC-balk, kleurgecodeerd laadniveau (rood/geel/groen) en optionele knipperende laad-badge

### 1.7.9 (2026-05-27)
* (ssbingo) Verouderde .eslintrc.json en .prettierignore verwijderd

### 1.7.8 (2026-05-27)
* (ssbingo) ESLint-linting toegevoegd, CI bijgewerkt naar Node.js 24; adapter vereist node.js >= 22

### 1.7.7 (2026-04-20)
* (ssbingo) Tekst vervormt niet meer bij non-uniforme schaling — letters behouden hun proporties terwijl containers het widget-oppervlak blijven vullen

### 1.7.6 (2026-04-20)
* (ssbingo) Schaling is nu non-uniform: breedte en hoogte reageren onafhankelijk op containerwijzigingen, beide assen blijven afzonderlijk instelbaar

### 1.7.5 (2026-04-20)
* (ssbingo) Widget-schaling reageert nu ook op hoogtewijzigingen — inhoud schaalt proportioneel op beide assen en wordt gecentreerd in de widget

### 1.7.4 (2026-04-20)
* (ssbingo) Alle 9 widgets schalen hun inhoud nu responsief mee met de widget-grootte (lettertypen, padding, SVG, afbeeldingen)

### 1.7.3 (2026-04-20)
* (ssbingo) Alle 9 widgets delen nu een uniforme achtergrond gebaseerd op het PV-Power widget-ontwerp

## Licentie
MIT License

Copyright (c) 2026 ssbingo <s.sternitzke@online.de>

Hierbij wordt gratis toestemming verleend aan elke persoon die een kopie van deze software
en bijbehorende documentatiebestanden (de „Software") verkrijgt, om zonder beperking
gebruik te maken van de Software, met inbegrip van maar niet beperkt tot het recht om
te gebruiken, kopiëren, wijzigen, samenvoegen, publiceren, distribueren, in sublicentie
te geven en/of te verkopen, en om personen aan wie de Software wordt verstrekt, dit toe
te staan, onder de volgende voorwaarden:

De bovenstaande copyrightvermelding en deze toestemmingsvermelding dienen te worden
opgenomen in alle kopieën of substantiële delen van de Software.

DE SOFTWARE WORDT GELEVERD „ZOALS ZIJ IS", ZONDER ENIGE GARANTIE, UITDRUKKELIJK OF
IMPLICIET, INCLUSIEF MAAR NIET BEPERKT TOT DE GARANTIES VAN VERKOOPBAARHEID, GESCHIKTHEID
VOOR EEN BEPAALD DOEL EN NIET-INBREUK.

## Documentatie

- 🇳🇱 [Nederlands](../../doc/nl/README.md) — dit bestand
- 🇩🇪 [Deutsch](../../doc/de/README.md)
- 🇬🇧 [English](../../README.md)
- 🇷🇺 [Русский](../../doc/ru/README.md)
- 🇫🇷 [Français](../../doc/fr/README.md)
- 🇮🇹 [Italiano](../../doc/it/README.md)
- 🇪🇸 [Español](../../doc/es/README.md)
- 🇵🇱 [Polski](../../doc/pl/README.md)
- 🇵🇹 [Português](../../doc/pt/README.md)
