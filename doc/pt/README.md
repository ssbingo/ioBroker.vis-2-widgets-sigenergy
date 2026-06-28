![Logo](../../admin/vis-2-widgets-sigenergy.png)
# ioBroker.vis-2-widgets-sigenergy

[![Versão NPM](https://img.shields.io/npm/v/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
[![Transferências](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-sigenergy.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-sigenergy)
![Número de instalações](https://iobroker.live/badges/vis-2-widgets-sigenergy-installed.svg)
![Versão atual no repositório estável](https://iobroker.live/badges/vis-2-widgets-sigenergy-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy.png?downloads=true)](https://nodei.co/npm/iobroker.vis-2-widgets-sigenergy/)

**Testes:** ![Teste e lançamento](https://github.com/ssbingo/ioBroker.vis-2-widgets-sigenergy/workflows/Test%20and%20Release/badge.svg)

## Adaptador vis-2-widgets-sigenergy para ioBroker

Conjunto de widgets VIS-2 para o adaptador de armazenamento de energia Sigenergy (`ioBroker.sigenergy`).
Contém 8 widgets para visualização e controlo do fluxo de energia, estado da bateria, potência em tempo real, estatísticas diárias, carregador AC, carregador DC, inversor e visão geral dos micro-inversores SigenMicro. para visualização e controlo do fluxo de energia, estado da bateria, potência em tempo real, estatísticas diárias, carregador AC, carregador DC e inversor.

## Requisitos

- ioBroker com o adaptador `sigenergy` instalado e configurado
- Adaptador ioBroker VIS-2 (≥ 2.0.0)

## Widgets

### Diagrama de fluxo de energia
Apresenta o fluxo de energia atual entre painéis solares, bateria, rede e casa como um diagrama SVG animado.
Setas animadas visualizam as ligações ativas em tempo real.

**OIDs:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Diagrama de fluxo de energia](../../img/widget-energiefluss.png)

#### Direções do fluxo

| Ponto de dados | Valor > 0 | Valor < 0 |
|---|---|---|
| `essPower` | Bateria a carregar → seta do centro para a bateria | Bateria a descarregar → seta da bateria para o centro |
| `gridActivePower` | Consumo da rede → seta da rede para o centro | Injeção na rede → seta do centro para a rede |
| `pvPower` | PV a produzir → seta do PV para o centro | — |
| `housePower` | Casa a consumir → seta do centro para a casa | — |

### Estado da bateria e previsões
Apresenta SOC, SOH, potência de carga e previsões do tempo até carga completa, autonomia restante, autoconsumo e taxa de autarcia.

**OIDs:** `essSoc`, `essSoh`, `essPower`, `batteryTimeToFull`, `batteryTimeRemaining`, `selfConsumptionRate`, `autarkyRate`

![Estado da bateria e previsões](../../img/widget-batterie.png)

### Potência em tempo real
Vista de lista compacta de todos os valores de potência atuais com indicadores de direção codificados por cor.

**OIDs:** `pvPower`, `essPower`, `gridActivePower`, `housePower`, `essSoc`

![Potência em tempo real](../../img/widget-leistung.png)

### Estatísticas de energia
Resumo diário com taxa de autarcia, autoconsumo, histórico de SOC, energia de carga/descarga e cobertura da bateria.

**OIDs:** `autarkyRate`, `selfConsumptionRate`, `dayMaxSoc`, `dayMinSoc`, `essDailyChargeEnergy`, `essDailyDischargeEnergy`, `batteryCoverageToday`, `batteryDailyChargeTime`

![Estatísticas de energia](../../img/widget-statistiken.png)

### Carregador AC (Sigen EVAC)
Monitorização e controlo do carregador AC Sigenergy (EVAC). Apresenta a potência de carga, o estado do sistema, a potência nominal, a corrente nominal e o consumo total de energia. Os alarmes são realçados a cores. A corrente de carga é ajustável através de um controlo deslizante (6–32 A).

**OIDs:** `acCharger.systemState`, `acCharger.chargingPower`, `acCharger.totalEnergyConsumed`, `acCharger.ratedPower`, `acCharger.ratedCurrent`, `acCharger.alarm1/2/3`, `acCharger.control.startStop`, `acCharger.control.outputCurrent`

![Carregador AC](../../img/widget-ac-charger.png)

### Carregador DC
Monitorização e controlo do carregador DC Sigenergy. Apresenta a potência de saída, o SOC do veículo com barra de progresso, a tensão da bateria do veículo, a corrente de carga e a energia e duração da sessão de carga atual.

**OIDs:** `dcCharger.outputPower`, `dcCharger.vehicleSoc`, `dcCharger.vehicleBatteryVoltage`, `dcCharger.chargingCurrent`, `dcCharger.currentChargingCapacity`, `dcCharger.currentChargingDuration`, `dcCharger.control.startStop`

![Carregador DC](../../img/widget-dc-charger.png)

### Inversor
Monitorização e controlo abrangentes do inversor com navegação por separadores. Apresenta o estado de funcionamento, dados de potência, temperaturas da bateria, tensões de fase, todos os 5 registos de alarme e informações do dispositivo (modelo, número de série, firmware).

| Separador | Conteúdo |
|---|---|
| **Potência** | Potência ativa, potência PV, potência de carga/descarga da bateria, controlo deslizante de quota de potência (de −100 % a +100 %) |
| **Bateria** | SOC e SOH com barras, temperatura/tensão média das células, temperatura máx./mín. |
| **Rede** | Tensões de fase L1/L2/L3, frequência da rede, fator de potência, temperatura interna do PCS |
| **Alarmes** | 5 registos de alarme (PCS ×2, ESS, gateway, carregador DC) com código hex e marcação a cores |
| **Info** | Tipo de modelo, número de série, versão de firmware, comutador Remote-EMS |

![Inversor](../../img/widget-inverter.png)

**OIDs:** `inverter.activePower`, `inverter.pvPower`, `inverter.essChargeDischargePower`, `inverter.runningState`, `inverter.essBatterySoc/Soh`, `inverter.essAvgCellTemperature/Voltage`, `inverter.phaseA/B/CVoltage`, `inverter.gridFrequency`, `inverter.pcsInternalTemp`, `inverter.alarm1–5`, `inverter.firmwareVersion`, `inverter.modelType`, `inverter.serialNumber`, `inverter.control.startStop`, `inverter.control.remoteEmsDispatchEnable`, `inverter.control.activePowerPercent`

### PV Power
Exibição de até 3 strings PV com valores de potência em tempo real e setas de fluxo animadas ao inversor híbrido. As cores das setas mudam dinamicamente conforme a potência (laranja <1 kW, amarelo <2 kW, verde >2 kW).

#### Configurações do widget
| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| oid_pv1 … oid_pv3 | OID | sigenergy.0.plant.pv1Power … pv3Power | OIDs de potência por string PV |
| oid_pvtotal | OID | sigenergy.0.plant.pvPower | OID de potência total PV |
| sig_title | texto | PV Power | Título do widget |
| sig_name1 … sig_name3 | texto | String 1 … String 3 | Nomes configuráveis por string |
| sig_darkmode | checkbox | true | Modo escuro / claro |

![PV Power](../../img/PV-PowerOverview.png)

**OIDs:** `plant.pv1Power`, `plant.pv2Power`, `plant.pv3Power`, `plant.pvPower`

### Visão geral SigenMicro
Visão geral e detalhe de todos os micro-inversores SigenMicro no barramento Modbus. O separador 1 mostra todos os dispositivos como segmento de rede animado (topologia de barramento Ethernet com derivações verticais).

#### Layout dinâmico
| Dispositivos | Linhas | Tamanho imagem |
|---|---|---|
| 1–5 | 1 linha | 80 × 90 px |
| 6–10 | 1 linha | 52 × 60 px |
| 11–15 | 2 linhas | 46 × 52 px |
| 16–20 | 2 linhas | 40 × 46 px |

### Nível de carga do veículo (EV SOC)
Mostra uma imagem de veículo configurável (p. ex. Fiat 500e) como elemento visual central. Um badge colorido no canto superior direito mostra um símbolo de relâmpago, o nível de carga atual em percentagem e a etiqueta «LADESTAND». Uma barra de progresso na parte inferior reflete o SOC atual. Quando o estado de carga opcional está ativo, o badge emite um brilho verde pulsante.

#### Lógica de cores
| Nível de carga | Cor |
|---|---|
| ≤ 15 % | Vermelho (#f87171) |
| ≤ 35 % | Amarelo (#fbbf24) |
| > 35 % | Verde (#4ade80) |

![Fahrzeug-Ladestand Widget](../../img/widget-autoLadestand.png)

**OIDs:** `oid_ev_soc`, `oid_charging`

## Aparência

Todos os widgets suportam um **modo claro e escuro**, comutável através da definição do widget `Modo escuro`.

## Changelog
### 1.8.2 (2026-06-28)
* (ssbingo) Ações CI atualizadas: actions/checkout para v7.0.0, ioBroker/testing-action-deploy para v1.5.0

### 1.8.1 (2026-06-08)
* (ssbingo) Corrigido erro de sintaxe JSON em io-package.json; captura de ecrã do widget adicionada à documentação

### 1.8.0 (2026-06-08)
* (ssbingo) Novo widget: "Nível de carga do veículo" — mostra uma imagem de EV configurável com barra SOC animada, nível de carga em cor (vermelho/amarelo/verde) e badge de carregamento intermitente opcional

### 1.7.9 (2026-05-27)
* (ssbingo) Removidos .eslintrc.json e .prettierignore obsoletos

### 1.7.8 (2026-05-27)
* (ssbingo) Adicionado ESLint, CI atualizado para Node.js 24; adaptador requer node.js >= 22

### 1.7.7 (2026-04-20)
* (ssbingo) O texto já não se distorce com escalonamento não uniforme — as letras mantêm as suas proporções enquanto os contêineres continuam a preencher a área do widget

### 1.7.6 (2026-04-20)
* (ssbingo) O escalonamento é agora não uniforme: largura e altura reagem independentemente às alterações do contêiner, ambos os eixos permanecem ajustáveis separadamente

### 1.7.5 (2026-04-20)
* (ssbingo) O escalonamento dos widgets agora também reage a alterações de altura — o conteúdo escala proporcionalmente em ambos os eixos e é centrado no widget

### 1.7.4 (2026-04-20)
* (ssbingo) Todos os 9 widgets agora escalam o seu conteúdo de forma responsiva com o tamanho do widget (fontes, espaçamento, SVG, imagens)

### 1.7.3 (2026-04-20)
* (ssbingo) Todos os 9 widgets agora compartilham um fundo unificado baseado no design do widget PV-Power

## Licença
MIT License

Copyright (c) 2026 ssbingo <s.sternitzke@online.de>

Por meio deste instrumento é concedida permissão, gratuitamente, a qualquer pessoa que obtenha
uma cópia deste software e dos ficheiros de documentação associados (o «Software»), para utilizar
o Software sem restrições, incluindo, sem limitação, os direitos de usar, copiar, modificar,
fundir, publicar, distribuir, sublicenciar e/ou vender cópias do Software, e permitir que as
pessoas a quem o Software seja fornecido o façam, sujeito às seguintes condições:

O aviso de direitos de autor acima e este aviso de permissão devem ser incluídos em todas
as cópias ou partes substanciais do Software.

O SOFTWARE É FORNECIDO «TAL COMO ESTÁ», SEM GARANTIA DE QUALQUER TIPO, EXPRESSA OU IMPLÍCITA,
INCLUINDO, MAS NÃO SE LIMITANDO ÀS GARANTIAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM DETERMINADO
FIM E NÃO VIOLAÇÃO.

## Documentação

- 🇵🇹 [Português](../../doc/pt/README.md) — este ficheiro
- 🇩🇪 [Deutsch](../../doc/de/README.md)
- 🇬🇧 [English](../../README.md)
- 🇷🇺 [Русский](../../doc/ru/README.md)
- 🇳🇱 [Nederlands](../../doc/nl/README.md)
- 🇫🇷 [Français](../../doc/fr/README.md)
- 🇮🇹 [Italiano](../../doc/it/README.md)
- 🇪🇸 [Español](../../doc/es/README.md)
- 🇵🇱 [Polski](../../doc/pl/README.md)
