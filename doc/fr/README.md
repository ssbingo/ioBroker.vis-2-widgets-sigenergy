![Logo](../../admin/vis-2-widgets-sigenergy.png)
# ioBroker.vis-2-widgets-sigenergy

[![Version NPM](https://img.shields.io/npm/v/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
[![Téléchargements](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
![Nombre d'installations](https://iobroker.live/badges/vis-2-widgets-sigenergy-installed.svg)
![Version actuelle dans le dépôt stable](https://iobroker.live/badges/vis-2-widgets-sigenergy-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy.png?downloads=true)](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy/)

**Tests :** ![Test et Release](https://github.com/ssbingo/ioBroker.vis-2-widgets-sigenergy/workflows/Test%20and%20Release/badge.svg)

## Adaptateur vis-2-widgets-sigenergy pour ioBroker

Ensemble de widgets VIS-2 pour l'adaptateur de stockage d'énergie Sigenergy (`ioBroker.sigenergy`).
Contient 8 widgets pour la visualisation et le contrôle du flux d'énergie, l'état de la batterie, la puissance en temps réel, les statistiques journalières, le chargeur AC, le chargeur DC, l'onduleur et la vue d'ensemble des micro-onduleurs SigenMicro. pour la visualisation et le contrôle du flux d'énergie, de l'état de la batterie, de la puissance en temps réel, des statistiques journalières, du chargeur AC, du chargeur DC et de l'onduleur.

## Prérequis

- ioBroker avec l'adaptateur `sigenergy` installé et configuré
- Adaptateur ioBroker VIS-2 (≥ 2.0.0)

## Widgets

### Diagramme de flux d'énergie
Affiche le flux d'énergie actuel entre les panneaux solaires, la batterie, le réseau et la maison sous forme de diagramme SVG animé. Des flèches animées visualisent les connexions actives en temps réel.

**OID :** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Diagramme de flux d'énergie](../../img/widget-energiefluss.png)

#### Directions du flux

| Point de données | Valeur > 0 | Valeur < 0 |
|---|---|---|
| `essPower` | Batterie en charge → flèche du centre vers la batterie | Batterie en décharge → flèche de la batterie vers le centre |
| `gridActivePower` | Soutirage réseau → flèche du réseau vers le centre | Injection réseau → flèche du centre vers le réseau |
| `pvPower` | PV produit → flèche du PV vers le centre | — |
| `housePower` | Maison consomme → flèche du centre vers la maison | — |

### État de la batterie & prévisions
Affiche SOC, SOH, puissance de charge et prévisions pour le temps de charge, l'autonomie restante, l'autoconsommation et le taux d'autarcie.

**OID :** `essSoc`, `essSoh`, `essPower`, `batteryTimeToFull`, `batteryTimeRemaining`, `selfConsumptionRate`, `autarkyRate`

![État de la batterie](../../img/widget-batterie.png)

### Puissance en temps réel
Vue liste compacte de toutes les valeurs de puissance actuelles avec indicateur de direction par code couleur.

**OID :** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Puissance en temps réel](../../img/widget-leistung.png)

### Statistiques énergétiques
Récapitulatif journalier avec taux d'autarcie, autoconsommation, évolution du SOC, énergie de charge/décharge et couverture batterie.

**OID :** `autarkyRate`, `selfConsumptionRate`, `dayMaxSoc`, `dayMinSoc`, `essDailyChargeEnergy`, `essDailyDischargeEnergy`, `batteryCoverageToday`, `batteryDailyChargeTime`

![Statistiques énergétiques](../../img/widget-statistiken.png)

### Chargeur AC (Sigen EVAC)
Surveillance et contrôle du chargeur AC Sigenergy (EVAC). Affiche la puissance de charge, l'état du système, la puissance nominale, le courant nominal et la consommation totale d'énergie. Les alarmes sont mises en évidence par couleur. Le courant de charge est réglable via un curseur (6–32 A).

**OID :** `acCharger.systemState`, `acCharger.chargingPower`, `acCharger.totalEnergyConsumed`, `acCharger.ratedPower`, `acCharger.ratedCurrent`, `acCharger.alarm1/2/3`, `acCharger.control.startStop`, `acCharger.control.outputCurrent`

![Chargeur AC](../../img/widget-ac-charger.png)

### Chargeur DC
Surveillance et contrôle du chargeur DC Sigenergy. Affiche la puissance de sortie, le SOC du véhicule avec barre de progression, la tension de la batterie du véhicule, le courant de charge ainsi que l'énergie et la durée de la session de charge en cours.

**OID :** `dcCharger.outputPower`, `dcCharger.vehicleSoc`, `dcCharger.vehicleBatteryVoltage`, `dcCharger.chargingCurrent`, `dcCharger.currentChargingCapacity`, `dcCharger.currentChargingDuration`, `dcCharger.control.startStop`

![Chargeur DC](../../img/widget-dc-charger.png)

### Onduleur
Surveillance et contrôle complets de l'onduleur avec navigation par onglets. Affiche l'état de fonctionnement, les données de puissance, les températures de la batterie, les tensions de phase, les 5 registres d'alarmes et les informations de l'appareil (modèle, numéro de série, firmware).

| Onglet | Contenu |
|---|---|
| **Puissance** | Puissance active, puissance PV, puissance de charge/décharge batterie, curseur de part de puissance (de −100 % à +100 %) |
| **Batterie** | SOC et SOH avec barres, température/tension moyenne des cellules, température max./min. |
| **Réseau** | Tensions de phase L1/L2/L3, fréquence réseau, facteur de puissance, température interne PCS |
| **Alarmes** | 5 registres d'alarmes (PCS ×2, ESS, passerelle, chargeur DC) avec code hex et marquage couleur |
| **Info** | Type de modèle, numéro de série, version du firmware, commutateur Remote-EMS |

![Onduleur](../../img/widget-inverter.png)

**OID :** `inverter.activePower`, `inverter.pvPower`, `inverter.essChargeDischargePower`, `inverter.runningState`, `inverter.essBatterySoc/Soh`, `inverter.essAvgCellTemperature/Voltage`, `inverter.phaseA/B/CVoltage`, `inverter.gridFrequency`, `inverter.pcsInternalTemp`, `inverter.alarm1–5`, `inverter.firmwareVersion`, `inverter.modelType`, `inverter.serialNumber`, `inverter.control.startStop`, `inverter.control.remoteEmsDispatchEnable`, `inverter.control.activePowerPercent`

### PV Power
Affichage jusqu'à 3 chaînes PV avec valeurs de puissance en direct et flèches de flux animées vers l'onduleur hybride. Les couleurs des flèches changent dynamiquement selon la puissance (orange <1 kW, jaune <2 kW, vert >2 kW).

#### Paramètres du widget
| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| oid_pv1 … oid_pv3 | OID | sigenergy.0.plant.pv1Power … pv3Power | OID de puissance par chaîne PV |
| oid_pvtotal | OID | sigenergy.0.plant.pvPower | OID de puissance PV totale |
| sig_title | texte | PV Power | Titre du widget |
| sig_name1 … sig_name3 | texte | String 1 … String 3 | Noms configurables par chaîne |
| sig_darkmode | case à cocher | true | Mode sombre / clair |

![PV Power](../../img/PV-PowerOverview.png)

**OIDs:** `plant.pv1Power`, `plant.pv2Power`, `plant.pv3Power`, `plant.pvPower`

### Vue d'ensemble SigenMicro
Vue d'ensemble et vue détaillée de tous les micro-onduleurs SigenMicro sur le bus Modbus. L'onglet 1 affiche tous les appareils sous forme de segment réseau animé (topologie bus Ethernet avec liaisons verticales).

#### Disposition dynamique
| Appareils | Lignes | Taille image |
|---|---|---|
| 1–5 | 1 ligne | 80 × 90 px |
| 6–10 | 1 ligne | 52 × 60 px |
| 11–15 | 2 lignes | 46 × 52 px |
| 16–20 | 2 lignes | 40 × 46 px |

### Niveau de charge du véhicule (EV SOC)
Affiche une image de véhicule configurable (p. ex. Fiat 500e) comme élément visuel central. Un badge coloré en haut à droite montre un symbole d'éclair, le niveau de charge actuel en pourcentage et le libellé « LADESTAND ». Une barre de progression en bas reflète le SOC actuel. Lorsque l'état de charge optionnel est actif, le badge émet une lueur verte pulsante.

#### Logique de couleur
| Niveau de charge | Couleur |
|---|---|
| ≤ 15 % | Rouge (#f87171) |
| ≤ 35 % | Jaune (#fbbf24) |
| > 35 % | Vert (#4ade80) |

![Fahrzeug-Ladestand Widget](../../img/widget-autoLadestand.png)

**OIDs:** `oid_ev_soc`, `oid_charging`

## Apparence

Tous les widgets prennent en charge un **mode clair et sombre**, commutable via le paramètre de widget `Mode sombre`.

## Changelog
### 1.8.4 (2026-09-04)
* (ssbingo) Exigence minimale d'admin abaissée à >=7.8.23 (admin 8 n'est plus requis)
* (ssbingo) CI : ioBroker/testing-action-deploy verrouillé sur la version majeure v1 ; workflow d'auto-merge Dependabot corrigé
* (ssbingo) Dépendances mises à jour : @tsconfig/node22 22.0.6, @alcalzone/release-script-plugin-license 5.2.2

### 1.8.3 (2026-08-05)
* (ssbingo) Exigences minimales déclarées : js-controller >=6.0.11, admin >=8.0.0, Node.js >=22
* (ssbingo) Dépendances mises à jour : actions/checkout 7.0.1, ioBroker/testing-action-deploy 1.5.2, @iobroker/testing 5.3.0

### 1.8.2 (2026-06-28)
* (ssbingo) Actions CI mises à jour : actions/checkout vers v7.0.0, ioBroker/testing-action-deploy vers v1.5.0

### 1.8.1 (2026-06-08)
* (ssbingo) Correction d'une erreur de syntaxe JSON dans io-package.json ; capture d'écran du widget ajoutée à la documentation

### 1.8.0 (2026-06-08)
* (ssbingo) Nouveau widget : « Niveau de charge du véhicule » — affiche une image de VE configurable avec une barre SOC animée, un niveau de charge en couleur (rouge/jaune/vert) et un badge de charge clignotant optionnel

### 1.7.9 (2026-05-27)
* (ssbingo) .eslintrc.json et .prettierignore obsolètes supprimés

### 1.7.8 (2026-05-27)
* (ssbingo) Ajout de l'ESLint, CI mis à jour vers Node.js 24 ; l'adaptateur nécessite node.js >= 22

### 1.7.7 (2026-04-20)
* (ssbingo) Le texte ne se déforme plus en mise à l'échelle non uniforme — les lettres conservent leurs proportions tandis que les conteneurs continuent à remplir la zone du widget

### 1.7.6 (2026-04-20)
* (ssbingo) La mise à l'échelle est désormais non uniforme : largeur et hauteur réagissent indépendamment aux changements du conteneur, les deux axes restent réglables individuellement

### 1.7.5 (2026-04-20)
* (ssbingo) La mise à l'échelle des widgets réagit désormais aussi aux changements de hauteur — le contenu s'adapte proportionnellement sur les deux axes et est centré dans le widget

### 1.7.4 (2026-04-20)
* (ssbingo) Les 9 widgets adaptent désormais leur contenu de manière responsive à la taille du widget (polices, espacements, SVG, images)

### 1.7.3 (2026-04-20)
* (ssbingo) Les 9 widgets partagent désormais un arrière-plan unifié basé sur le design du widget PV-Power

## Licence
MIT License

Copyright (c) 2026 ssbingo <s.sternitzke@online.de>

La présente licence accorde gratuitement à toute personne obtenant une copie de ce logiciel
et des fichiers de documentation associés (le « Logiciel »), la permission de traiter le Logiciel
sans restriction, notamment sans limitation des droits d'utilisation, de copie, de modification,
de fusion, de publication, de distribution, de sous-licence et/ou de vente de copies du Logiciel,
et d'autoriser les personnes à qui le Logiciel est fourni à le faire, sous réserve des conditions
suivantes :

L'avis de droit d'auteur ci-dessus et le présent avis d'autorisation doivent être inclus dans
toutes les copies ou parties substantielles du Logiciel.

LE LOGICIEL EST FOURNI « TEL QUEL », SANS GARANTIE D'AUCUNE SORTE, EXPLICITE OU IMPLICITE,
NOTAMMENT SANS GARANTIE DE QUALITÉ MARCHANDE, D'ADÉQUATION À UN USAGE PARTICULIER ET
D'ABSENCE DE CONTREFAÇON.

## Documentation

- 🇫🇷 [Français](../../doc/fr/README.md) — ce fichier
- 🇩🇪 [Deutsch](../../doc/de/README.md)
- 🇬🇧 [English](../../README.md)
- 🇷🇺 [Русский](../../doc/ru/README.md)
- 🇳🇱 [Nederlands](../../doc/nl/README.md)
- 🇮🇹 [Italiano](../../doc/it/README.md)
- 🇪🇸 [Español](../../doc/es/README.md)
- 🇵🇱 [Polski](../../doc/pl/README.md)
- 🇵🇹 [Português](../../doc/pt/README.md)
