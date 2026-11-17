import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps } from '@iobroker/types-vis-2';

import SigWidget, {
    appearanceFields,
    oidField,
    SET_COLOR,
    SET_ICON,
    VIS_SET,
    type SigRxData,
    type SigState,
} from './SigWidget';
import Scaled from './Scaled';
import { CommitSlider } from './components';
import { fmtKW, fmtPct, num0, socCol, textCol, toNum, type StateVal } from './common';

interface InverterRxData extends SigRxData {
    [attr: string]: any;
}

interface InverterState extends SigState {
    tab: number;
}

/*
 * Tabs: power | battery | grid | alarms | info
 * runningState: 0 standby, 1 running, 2 fault, 3 shutdown
 * control.startStop: 0 = stop, 1 = start  (inverted compared with the charger widgets!)
 */
const P = 'sigenergy.0.inverter.';
const FIELDS = {
    power: [
        ['oid_activePower', 'activePower'],
        ['oid_pvPower', 'pvPower'],
        ['oid_essPower', 'essChargeDischargePower'],
        ['oid_runState', 'runningState'],
    ],
    battery: [
        ['oid_soc', 'essBatterySoc'],
        ['oid_soh', 'essBatterySoh'],
        ['oid_cellTemp', 'essAvgCellTemperature'],
        ['oid_cellVolt', 'essAvgCellVoltage'],
        ['oid_maxTemp', 'essMaxBatteryTemperature'],
        ['oid_minTemp', 'essMinBatteryTemperature'],
    ],
    grid: [
        ['oid_uA', 'phaseAVoltage'],
        ['oid_uB', 'phaseBVoltage'],
        ['oid_uC', 'phaseCVoltage'],
        ['oid_freq', 'gridFrequency'],
        ['oid_pf', 'powerFactor'],
        ['oid_pcsTemp', 'pcsInternalTemp'],
    ],
    alarms: [
        ['oid_alm1', 'alarm1'],
        ['oid_alm2', 'alarm2'],
        ['oid_alm3', 'alarm3'],
        ['oid_alm4', 'alarm4'],
        ['oid_alm5', 'alarm5'],
    ],
    info: [
        ['oid_fw', 'firmwareVersion'],
        ['oid_model', 'modelType'],
        ['oid_serial', 'serialNumber'],
    ],
    control: [
        ['oid_startStop', 'control.startStop'],
        ['oid_emsEnable', 'control.remoteEmsDispatchEnable'],
        ['oid_pwrPct', 'control.activePowerPercent'],
    ],
};
const TABS = ['tab_power', 'tab_battery', 'tab_grid', 'tab_alarms', 'tab_info'];
const ALARMS = ['alarm_1_pcs', 'alarm_2_pcs', 'alarm_3_ess', 'alarm_4_gateway', 'alarm_5_dc'];

function tempCol(t: number): string {
    return t > 50 ? '#e74c3c' : t > 35 ? '#f39c12' : '#27ae60';
}

export default class Inverter extends SigWidget<InverterRxData, InverterState> {
    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, tab: 0 };
    }

    static getWidgetInfo(): RxWidgetInfo {
        const group = (name: keyof typeof FIELDS): RxWidgetInfo['visAttrs'][number] => ({
            name,
            label: `group_inv_${name}`,
            fields: FIELDS[name].map(([attr, state]) => oidField(attr, P + state)),
        });
        return {
            id: 'tplVis-2-widgets-sigenergyInverter',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'Inverter',
            visWidgetLabel: 'w_inverter',
            visAttrs: [
                group('power'),
                group('battery'),
                group('grid'),
                group('alarms'),
                group('info'),
                group('control'),
                { name: 'appearance', label: 'group_appearance', fields: appearanceFields() },
            ],
            visDefaultStyle: { width: 300, height: 420 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-inverter.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return Inverter.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    private tempText(v: StateVal): { text: string; color: string | undefined } {
        const n = toNum(v);
        return n === null ? { text: '-- °C', color: undefined } : { text: `${n.toFixed(1)} °C`, color: tempCol(n) };
    }

    // eslint-disable-next-line class-methods-use-this
    private box(
        label: string,
        value: string,
        color?: string,
        sub?: string,
        style?: React.CSSProperties,
    ): React.JSX.Element {
        return (
            <div
                className="sig-inv-box"
                style={style}
            >
                <div className="sig-inv-box-lbl">{label}</div>
                <div
                    className="sig-inv-box-val"
                    style={color ? { color } : undefined}
                >
                    {value}
                </div>
                {sub !== undefined ? <div className="sig-inv-box-sub">{sub}</div> : null}
            </div>
        );
    }

    private renderPower(): React.JSX.Element {
        const ess = num0(this.v('oid_essPower'));
        const pctId = this.oid('oid_pwrPct');
        const pct = Math.round(num0(this.v('oid_pwrPct')));
        return (
            <>
                <div className="sig-inv-row2">
                    {this.box(this.t('active_power'), fmtKW(num0(this.v('oid_activePower'))), '#3498db')}
                    {this.box(this.t('pv_power'), fmtKW(num0(this.v('oid_pvPower'))), '#f39c12')}
                </div>
                {this.box(
                    this.t('battery_charge_discharge'),
                    fmtKW(ess),
                    ess > 0.05 ? '#27ae60' : ess < -0.05 ? '#e74c3c' : '#9b59b6',
                    ess > 0.05
                        ? `▲ ${this.t('charging')}`
                        : ess < -0.05
                          ? `▼ ${this.t('discharging')}`
                          : this.t('st_ready'),
                )}
                <div className="sig-inv-box">
                    <div
                        className="sig-inv-box-lbl"
                        style={{ marginBottom: 5 }}
                    >
                        {this.t('ems_power_share')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CommitSlider
                            value={pct}
                            min={-100}
                            max={100}
                            disabled={!pctId}
                            format={v => (pctId ? `${Math.round(v)} %` : '–')}
                            valueClassName="sig-inv-ctrl-val"
                            onCommit={v => this.write('oid_pwrPct', Math.round(v))}
                        />
                    </div>
                </div>
            </>
        );
    }

    private renderBattery(dark: boolean): React.JSX.Element {
        const soc = num0(this.v('oid_soc'));
        const soh = num0(this.v('oid_soh'));
        const sc = socCol(soc);
        const cv = num0(this.v('oid_cellVolt'));
        const ct = this.tempText(this.v('oid_cellTemp'));
        const tmax = this.tempText(this.v('oid_maxTemp'));
        const tmin = this.tempText(this.v('oid_minTemp'));
        return (
            <>
                <div className="sig-inv-row2">
                    {this.box('SOC', fmtPct(soc), sc)}
                    {this.box('SOH', fmtPct(soh), soh > 80 ? '#27ae60' : '#f39c12')}
                </div>
                <div className="sig-inv-box">
                    <div
                        className="sig-inv-box-lbl"
                        style={{ marginBottom: 5 }}
                    >
                        {this.t('soc_bar')}
                    </div>
                    <div className="sig-inv-soc-bar-bg">
                        <div
                            className="sig-inv-soc-bar-fill"
                            style={{ width: `${Math.min(100, soc)}%`, background: sc }}
                        />
                    </div>
                </div>
                <div className="sig-inv-temp-grid">
                    {this.box(`🌡 ${this.t('avg_cell_temp')}`, ct.text, ct.color || textCol(dark))}
                    {this.box(this.t('avg_cell_voltage'), cv ? `${cv.toFixed(3)} V` : '-- V', '#3498db')}
                    {this.box(`🌡 ${this.t('max_temp')}`, tmax.text, tmax.color || textCol(dark))}
                    {this.box(`🌡 ${this.t('min_temp')}`, tmin.text)}
                </div>
            </>
        );
    }

    private renderGrid(dark: boolean): React.JSX.Element {
        const phase = (lbl: string, attr: string): React.JSX.Element => {
            const u = num0(this.v(attr));
            return (
                <div className="sig-inv-phase-box">
                    <div className="sig-inv-phase-lbl">{lbl}</div>
                    <div className="sig-inv-phase-val">{u ? `${u.toFixed(1)} V` : '-- V'}</div>
                </div>
            );
        };
        const freq = num0(this.v('oid_freq'));
        const pf = num0(this.v('oid_pf'));
        const pcs = this.tempText(this.v('oid_pcsTemp'));
        return (
            <>
                <div className="sig-inv-phase-row">
                    {phase('L1', 'oid_uA')}
                    {phase('L2', 'oid_uB')}
                    {phase('L3', 'oid_uC')}
                </div>
                <div className="sig-inv-row2">
                    {this.box(this.t('grid_frequency'), freq ? `${freq.toFixed(2)} Hz` : '-- Hz', '#3498db')}
                    {this.box(this.t('power_factor'), pf ? pf.toFixed(3) : '--', '#3498db')}
                </div>
                {this.box(`🌡 ${this.t('pcs_temp')}`, pcs.text, pcs.color || textCol(dark))}
            </>
        );
    }

    private renderAlarms(): React.JSX.Element {
        return (
            <>
                {ALARMS.map((label, i) => {
                    const n = num0(this.v(`oid_alm${i + 1}`));
                    const cls = n === 0 ? 'ok' : 'error';
                    return (
                        <div
                            key={label}
                            className={`sig-inv-alm-row ${cls}`}
                        >
                            <span className="sig-inv-alm-lbl">{this.t(label)}</span>
                            <span className={`sig-inv-alm-val ${cls}`}>
                                {n === 0 ? 'OK' : `0x${Math.trunc(n).toString(16).toUpperCase()}`}
                            </span>
                        </div>
                    );
                })}
            </>
        );
    }

    private renderInfo(): React.JSX.Element {
        const row = (label: string, attr: string): React.JSX.Element => (
            <div className="sig-inv-info-row">
                <div className="sig-inv-info-lbl">{label}</div>
                <div className="sig-inv-info-val">{String(this.v(attr) ?? '') || '–'}</div>
            </div>
        );
        const emsOn = toNum(this.v('oid_emsEnable')) === 1;
        return (
            <>
                {row(this.t('model'), 'oid_model')}
                {row(this.t('serial_number'), 'oid_serial')}
                {row('Firmware', 'oid_fw')}
                <div className="sig-inv-ctrl-row">
                    <span className="sig-inv-ctrl-lbl">Remote EMS</span>
                    <button
                        className={`sig-inv-toggle ${emsOn ? 'on' : 'off'}`}
                        onClick={() => this.write('oid_emsEnable', emsOn ? 0 : 1)}
                    >
                        {emsOn ? this.t('active') : this.t('inactive')}
                    </button>
                </div>
            </>
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const dark = this.dark();
        const rs = toNum(this.v('oid_runState'));
        const badge =
            rs === 0
                ? { label: 'Standby', cls: 'standby' }
                : rs === 1
                  ? { label: 'Running', cls: 'running' }
                  : rs === 2
                    ? { label: 'Fault', cls: 'fault' }
                    : rs === 3
                      ? { label: 'Shutdown', cls: 'shutdown' }
                      : { label: '–', cls: 'standby' };
        const ss = toNum(this.v('oid_startStop'));
        const running = ss === 1 || badge.cls === 'running';
        const tab = this.state.tab;
        const panels = [
            () => this.renderPower(),
            () => this.renderBattery(dark),
            () => this.renderGrid(dark),
            () => this.renderAlarms(),
            () => this.renderInfo(),
        ];

        return (
            <Scaled designWidth={340}>
                <div className="sig-w">
                    <div className={`sig-inv-wrap${dark ? '' : ' light'}`}>
                        <div className="sig-inv-head">
                            <span className="icon">⚡</span>
                            <span className="title">{this.title('title_inverter')}</span>
                            <span className={`sig-inv-badge ${badge.cls}`}>{badge.label}</span>
                            <button
                                className={`sig-inv-startstop ${running ? 'running' : 'stopped'}`}
                                onClick={() => this.write('oid_startStop', ss === 1 ? 0 : 1)}
                            >
                                {running ? 'Stop' : 'Start'}
                            </button>
                        </div>
                        <div className="sig-inv-tabs">
                            {TABS.map((label, i) => (
                                <div
                                    key={label}
                                    className={`sig-inv-tab${i === tab ? ' active' : ''}`}
                                    onClick={() => this.setState({ tab: i })}
                                >
                                    {this.t(label)}
                                </div>
                            ))}
                        </div>
                        <div className="sig-inv-panel active">{panels[tab]()}</div>
                    </div>
                </div>
            </Scaled>
        );
    }
}
