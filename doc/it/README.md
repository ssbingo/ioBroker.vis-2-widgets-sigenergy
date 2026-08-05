![Logo](../../admin/vis-2-widgets-sigenergy.png)
# ioBroker.vis-2-widgets-sigenergy

[![Versione NPM](https://img.shields.io/npm/v/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
[![Download](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
![Numero di installazioni](https://iobroker.live/badges/vis-2-widgets-sigenergy-installed.svg)
![Versione corrente nel repository stabile](https://iobroker.live/badges/vis-2-widgets-sigenergy-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy.png?downloads=true)](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy/)

**Test:** ![Test e Release](https://github.com/ssbingo/ioBroker.vis-2-widgets-sigenergy/workflows/Test%20and%20Release/badge.svg)

## Adattatore vis-2-widgets-sigenergy per ioBroker

Set di widget VIS-2 per l'adattatore di accumulo energetico Sigenergy (`ioBroker.sigenergy`).
Contiene 8 widget per la visualizzazione e il controllo del flusso energetico, stato della batteria, potenza in tempo reale, statistiche giornaliere, caricatore AC, caricatore DC, inverter e panoramica dei micro-inverter SigenMicro. per la visualizzazione e il controllo del flusso energetico, dello stato della batteria, della potenza in tempo reale, delle statistiche giornaliere, del caricatore AC, del caricatore DC e dell'inverter.

## Requisiti

- ioBroker con l'adattatore `sigenergy` installato e configurato
- Adattatore ioBroker VIS-2 (≥ 2.0.0)

## Widget

### Diagramma del flusso energetico
Mostra il flusso energetico corrente tra pannelli solari, batteria, rete e casa come diagramma SVG animato.
Frecce animate visualizzano le connessioni attive in tempo reale.

**OID:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Diagramma del flusso energetico](../../img/widget-energiefluss.png)

#### Direzioni del flusso

| Punto dati | Valore > 0 | Valore < 0 |
|---|---|---|
| `essPower` | Batteria in carica → freccia dal centro alla batteria | Batteria in scarica → freccia dalla batteria al centro |
| `gridActivePower` | Prelievo dalla rete → freccia dalla rete al centro | Immissione in rete → freccia dal centro alla rete |
| `pvPower` | PV produce → freccia dal PV al centro | — |
| `housePower` | Casa consuma → freccia dal centro alla casa | — |

### Stato batteria e previsioni
Mostra SOC, SOH, potenza di carica e previsioni per il tempo di ricarica completa, l'autonomia residua, l'autoconsumo e il tasso di autosufficienza.

**OID:** `essSoc`, `essSoh`, `essPower`, `batteryTimeToFull`, `batteryTimeRemaining`, `selfConsumptionRate`, `autarkyRate`

![Stato batteria e previsioni](../../img/widget-batterie.png)

### Potenza in tempo reale
Vista elenco compatta di tutti i valori di potenza attuali con indicatori di direzione codificati a colori.

**OID:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Potenza in tempo reale](../../img/widget-leistung.png)

### Statistiche energetiche
Riepilogo giornaliero con tasso di autosufficienza, autoconsumo, storico SOC, energia di carica/scarica e copertura della batteria.

**OID:** `autarkyRate`, `selfConsumptionRate`, `dayMaxSoc`, `dayMinSoc`, `essDailyChargeEnergy`, `essDailyDischargeEnergy`, `batteryCoverageToday`, `batteryDailyChargeTime`

![Statistiche energetiche](../../img/widget-statistiken.png)

### Caricatore AC (Sigen EVAC)
Monitoraggio e controllo del caricatore AC Sigenergy (EVAC). Mostra la potenza di carica, lo stato del sistema, la potenza nominale, la corrente nominale e il consumo totale di energia. Gli allarmi sono evidenziati a colori. La corrente di carica è regolabile tramite cursore (6–32 A).

**OID:** `acCharger.systemState`, `acCharger.chargingPower`, `acCharger.totalEnergyConsumed`, `acCharger.ratedPower`, `acCharger.ratedCurrent`, `acCharger.alarm1/2/3`, `acCharger.control.startStop`, `acCharger.control.outputCurrent`

![Caricatore AC](../../img/widget-ac-charger.png)

### Caricatore DC
Monitoraggio e controllo del caricatore DC Sigenergy. Mostra la potenza di uscita, il SOC del veicolo con barra di avanzamento, la tensione della batteria del veicolo, la corrente di carica e l'energia e la durata della sessione di carica corrente.

**OID:** `dcCharger.outputPower`, `dcCharger.vehicleSoc`, `dcCharger.vehicleBatteryVoltage`, `dcCharger.chargingCurrent`, `dcCharger.currentChargingCapacity`, `dcCharger.currentChargingDuration`, `dcCharger.control.startStop`

![Caricatore DC](../../img/widget-dc-charger.png)

### Inverter
Monitoraggio e controllo completi dell'inverter con navigazione a schede. Mostra lo stato operativo, i dati di potenza, le temperature della batteria, le tensioni di fase, tutti i 5 registri di allarme e le informazioni sul dispositivo (modello, numero di serie, firmware).

| Scheda | Contenuto |
|---|---|
| **Potenza** | Potenza attiva, potenza PV, potenza di carica/scarica batteria, cursore quota di potenza (da −100 % a +100 %) |
| **Batteria** | SOC e SOH con barre, temperatura/tensione media delle celle, temperatura max./min. |
| **Rete** | Tensioni di fase L1/L2/L3, frequenza di rete, fattore di potenza, temperatura interna PCS |
| **Allarmi** | 5 registri di allarme (PCS ×2, ESS, gateway, caricatore DC) con codice hex e marcatura a colori |
| **Info** | Tipo di modello, numero di serie, versione firmware, interruttore Remote-EMS |

![Inverter](../../img/widget-inverter.png)

**OID:** `inverter.activePower`, `inverter.pvPower`, `inverter.essChargeDischargePower`, `inverter.runningState`, `inverter.essBatterySoc/Soh`, `inverter.essAvgCellTemperature/Voltage`, `inverter.phaseA/B/CVoltage`, `inverter.gridFrequency`, `inverter.pcsInternalTemp`, `inverter.alarm1–5`, `inverter.firmwareVersion`, `inverter.modelType`, `inverter.serialNumber`, `inverter.control.startStop`, `inverter.control.remoteEmsDispatchEnable`, `inverter.control.activePowerPercent`

### PV Power
Visualizzazione fino a 3 stringhe PV con valori di potenza in tempo reale e frecce di flusso animate verso l'inverter ibrido. I colori delle frecce cambiano dinamicamente in base alla potenza (arancione <1 kW, giallo <2 kW, verde >2 kW).

#### Impostazioni del widget
| Parametro | Tipo | Predefinito | Descrizione |
|---|---|---|---|
| oid_pv1 … oid_pv3 | OID | sigenergy.0.plant.pv1Power … pv3Power | OID potenza per stringa PV |
| oid_pvtotal | OID | sigenergy.0.plant.pvPower | OID potenza PV totale |
| sig_title | testo | PV Power | Titolo del widget |
| sig_name1 … sig_name3 | testo | String 1 … String 3 | Nomi configurabili per stringa |
| sig_darkmode | checkbox | true | Modalità scura / chiara |

![PV Power](../../img/PV-PowerOverview.png)

**OIDs:** `plant.pv1Power`, `plant.pv2Power`, `plant.pv3Power`, `plant.pvPower`

### Panoramica SigenMicro
Panoramica e visualizzazione dettagliata di tutti i micro-inverter SigenMicro sul bus Modbus. La scheda 1 mostra tutti i dispositivi come segmento di rete animato (topologia bus Ethernet con derivazioni verticali).

#### Layout dinamico
| Dispositivi | Righe | Dimensione immagine |
|---|---|---|
| 1–5 | 1 riga | 80 × 90 px |
| 6–10 | 1 riga | 52 × 60 px |
| 11–15 | 2 righe | 46 × 52 px |
| 16–20 | 2 righe | 40 × 46 px |

### Livello di carica del veicolo (EV SOC)
Mostra un'immagine del veicolo configurabile (ad es. Fiat 500e) come elemento visivo centrale. Un badge colorato in alto a destra mostra un simbolo di fulmine, il livello di carica attuale in percentuale e l'etichetta «LADESTAND». Una barra di avanzamento in basso riflette il SOC attuale. Quando lo stato di carica opzionale è attivo, il badge emette un bagliore verde pulsante.

#### Logica dei colori
| Livello di carica | Colore |
|---|---|
| ≤ 15 % | Rosso (#f87171) |
| ≤ 35 % | Giallo (#fbbf24) |
| > 35 % | Verde (#4ade80) |

![Fahrzeug-Ladestand Widget](../../img/widget-autoLadestand.png)

**OIDs:** `oid_ev_soc`, `oid_charging`

## Aspetto

Tutti i widget supportano una **modalità chiara e scura**, commutabile tramite l'impostazione widget `Modalità scura`.

## Changelog
### 1.8.3 (2026-08-05)
* (ssbingo) Requisiti minimi dichiarati: js-controller >=6.0.11, admin >=8.0.0, Node.js >=22
* (ssbingo) Dipendenze aggiornate: actions/checkout 7.0.1, ioBroker/testing-action-deploy 1.5.2, @iobroker/testing 5.3.0

### 1.8.2 (2026-06-28)
* (ssbingo) Azioni CI aggiornate: actions/checkout a v7.0.0, ioBroker/testing-action-deploy a v1.5.0

### 1.8.1 (2026-06-08)
* (ssbingo) Correto errore di sintassi JSON in io-package.json; screenshot del widget aggiunto alla documentazione

### 1.8.0 (2026-06-08)
* (ssbingo) Nuovo widget: "Livello di carica del veicolo" — mostra un'immagine EV configurabile con barra SOC animata, livello di carica a colori (rosso/giallo/verde) e badge di ricarica lampeggiante opzionale

### 1.7.9 (2026-05-27)
* (ssbingo) Rimossi .eslintrc.json e .prettierignore obsoleti

### 1.7.8 (2026-05-27)
* (ssbingo) Aggiunto ESLint, CI aggiornato a Node.js 24; l'adattatore richiede node.js >= 22

### 1.7.7 (2026-04-20)
* (ssbingo) Il testo non si deforma più con il ridimensionamento non uniforme — le lettere mantengono le proporzioni mentre i contenitori continuano a riempire l'area del widget

### 1.7.6 (2026-04-20)
* (ssbingo) Il ridimensionamento è ora non uniforme: larghezza e altezza reagiscono indipendentemente alle variazioni del contenitore, entrambi gli assi restano regolabili singolarmente

### 1.7.5 (2026-04-20)
* (ssbingo) Il ridimensionamento dei widget ora reagisce anche alle variazioni di altezza — il contenuto si ridimensiona proporzionalmente su entrambi gli assi ed è centrato nel widget

### 1.7.4 (2026-04-20)
* (ssbingo) Tutti i 9 widget ora scalano il loro contenuto in modo reattivo con la dimensione del widget (font, spaziature, SVG, immagini)

### 1.7.3 (2026-04-20)
* (ssbingo) Tutti i 9 widget condividono ora uno sfondo unificato basato sul design del widget PV-Power

## Licenza
MIT License

Copyright (c) 2026 ssbingo <s.sternitzke@online.de>

Con la presente si concede gratuitamente a chiunque ottenga una copia di questo software
e dei file di documentazione associati (il «Software»), il permesso di trattare il Software
senza restrizioni, inclusi senza limitazione i diritti di utilizzare, copiare, modificare,
unire, pubblicare, distribuire, concedere in sublicenza e/o vendere copie del Software,
e di permettere alle persone a cui il Software è fornito di fare lo stesso, alle seguenti condizioni:

L'avviso di copyright di cui sopra e questo avviso di autorizzazione devono essere inclusi
in tutte le copie o parti sostanziali del Software.

IL SOFTWARE VIENE FORNITO «COSÌ COM'È», SENZA GARANZIA DI ALCUN TIPO, ESPRESSA O IMPLICITA,
INCLUSE MA NON LIMITATE LE GARANZIE DI COMMERCIABILITÀ, IDONEITÀ PER UNO SCOPO PARTICOLARE
E NON VIOLAZIONE.

## Documentazione

- 🇮🇹 [Italiano](../../doc/it/README.md) — questo file
- 🇩🇪 [Deutsch](../../doc/de/README.md)
- 🇬🇧 [English](../../README.md)
- 🇷🇺 [Русский](../../doc/ru/README.md)
- 🇳🇱 [Nederlands](../../doc/nl/README.md)
- 🇫🇷 [Français](../../doc/fr/README.md)
- 🇪🇸 [Español](../../doc/es/README.md)
- 🇵🇱 [Polski](../../doc/pl/README.md)
- 🇵🇹 [Português](../../doc/pt/README.md)
