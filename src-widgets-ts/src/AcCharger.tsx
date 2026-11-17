import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import SigWidget, { appearanceFields, oidField, SET_COLOR, SET_ICON, VIS_SET, type SigRxData } from './SigWidget';
import Scaled from './Scaled';
import { CommitSlider, TipBadge } from './components';
import { fmtKW, num0, textCol, toNum, type StateVal } from './common';

interface AcChargerRxData extends SigRxData {
    oid_state: string;
    oid_power: string;
    oid_energy: string;
    oid_ratedPower: string;
    oid_ratedCurrent: string;
    oid_alarm1: string;
    oid_alarm2: string;
    oid_alarm3: string;
    oid_startStop: string;
    oid_current: string;
    sig_maxCurrent: number | string;
}

/*
 * acCharger.systemState — control pilot per IEC 61851-1:
 *   0 system init · 1 A1/A2 no vehicle · 2 B1 plugged, no release · 3 B2 plugged, released,
 *   vehicle requests nothing · 4 C1 requests, no release/PWM (transition) · 5 C2 charging ·
 *   6 F station unavailable / fault · 7 E pilot / cable fault.  (State D is not used.)
 *
 * Control: acCharger.control.startStop 0 = start, 1 = stop (write only)
 *          acCharger.control.outputCurrent 6 … rated A
 * The slider range is [6, max]; max is the smaller of the rated current (oid_ratedCurrent)
 * and the widget setting sig_maxCurrent (0 = off). Values above the rated current are
 * rejected by the device with a Modbus error.
 */
const STATES: Record<number, { label: string; badge: 'idle' | 'charging' | 'error' }> = {
    0: { label: 'st_init', badge: 'idle' },
    1: { label: 'st_free', badge: 'idle' },
    2: { label: 'st_connected', badge: 'idle' },
    3: { label: 'st_connected', badge: 'idle' },
    4: { label: 'st_charging', badge: 'charging' },
    5: { label: 'st_charging', badge: 'charging' },
    6: { label: 'st_error', badge: 'error' },
    7: { label: 'st_error', badge: 'error' },
};
const MIN_CURRENT = 6;
const DEFAULT_MAX_CURRENT = 32;

export default class AcCharger extends SigWidget<AcChargerRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplVis-2-widgets-sigenergyAcCharger',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'AcCharger',
            visWidgetLabel: 'w_ac_charger',
            visAttrs: [
                {
                    name: 'oids',
                    label: 'group_measurements',
                    fields: [
                        oidField('oid_state', 'sigenergy.0.acCharger.systemState'),
                        oidField('oid_power', 'sigenergy.0.acCharger.chargingPower'),
                        oidField('oid_energy', 'sigenergy.0.acCharger.totalEnergyConsumed'),
                        oidField('oid_ratedPower', 'sigenergy.0.acCharger.ratedPower'),
                        oidField('oid_ratedCurrent', 'sigenergy.0.acCharger.ratedCurrent'),
                        oidField('oid_alarm1', 'sigenergy.0.acCharger.alarm1'),
                        oidField('oid_alarm2', 'sigenergy.0.acCharger.alarm2'),
                        oidField('oid_alarm3', 'sigenergy.0.acCharger.alarm3'),
                    ],
                },
                {
                    name: 'control',
                    label: 'group_control',
                    fields: [
                        oidField('oid_startStop', 'sigenergy.0.acCharger.control.startStop'),
                        oidField('oid_current', 'sigenergy.0.acCharger.control.outputCurrent'),
                        {
                            name: 'sig_maxCurrent',
                            type: 'number',
                            label: 'sig_maxCurrent',
                            tooltip: 'sig_maxCurrent_tooltip',
                            min: 0,
                            max: 63,
                            default: 32,
                        },
                    ],
                },
                { name: 'appearance', label: 'group_appearance', fields: appearanceFields() },
            ],
            visDefaultStyle: { width: 300, height: 380 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-ac-charger.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return AcCharger.getWidgetInfo();
    }

    private stateInfo(v: StateVal): { label: string; badge: string; tip: string; unknown?: boolean } {
        const n = toNum(v);
        if (n !== null && STATES[n]) {
            return { label: this.t(STATES[n].label), badge: STATES[n].badge, tip: this.t(`ac_tip_${n}`) };
        }
        const empty = v === undefined || v === null || v === '';
        return {
            label: this.t('st_unknown'),
            badge: 'error',
            tip: empty ? this.t('ac_tip_none') : this.t('ac_tip_unknown', String(v)),
            unknown: true,
        };
    }

    /** Upper limit of the current slider in A (see the comment above). */
    private maxCurrent(): number {
        const cfg = toNum(this.state.rxData.sig_maxCurrent) ?? 0;
        const rc = toNum(this.v('oid_ratedCurrent')) ?? 0;
        let max = 0;
        if (cfg > 0) {
            max = cfg;
        }
        if (rc > 0 && (!max || rc < max)) {
            max = rc;
        }
        if (!max) {
            max = DEFAULT_MAX_CURRENT;
        }
        return Math.max(MIN_CURRENT, Math.floor(max));
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const dark = this.dark();
        const si = this.stateInfo(this.v('oid_state'));
        const pwr = num0(this.v('oid_power'));
        const rp = num0(this.v('oid_ratedPower'));
        const rc = num0(this.v('oid_ratedCurrent'));
        const en = num0(this.v('oid_energy'));
        const alarm = num0(this.v('oid_alarm1')) | num0(this.v('oid_alarm2')) | num0(this.v('oid_alarm3'));
        const alarmText = alarm ? `⚠ ${this.t('alarm')} ${alarm.toString(16).toUpperCase()}` : 'OK';

        const max = this.maxCurrent();
        const cur = toNum(this.v('oid_current'));
        const curVal = Math.min(Math.max(Math.round(cur ?? 16), MIN_CURRENT), max);

        // While a session is active (C1/C2) start is locked and stop is raised. The ring
        // (active-state) shows the last command, only on the button that fits the state.
        const ss = toNum(this.v('oid_startStop'));
        const charging = si.badge === 'charging' || (!!si.unknown && pwr > 0.05);

        const stat = (label: string, value: string, color: string): React.JSX.Element => (
            <div className="sig-ac-stat-box">
                <div className="sig-ac-stat-lbl">{label}</div>
                <div
                    className="sig-ac-stat-val"
                    style={{ color }}
                >
                    {value}
                </div>
            </div>
        );

        return (
            <Scaled designWidth={300}>
                <div className="sig-w">
                    <div className={`sig-ac-wrap${dark ? '' : ' light'}`}>
                        <div className="sig-ac-head">
                            <span className="icon">🔌</span>
                            <span className="title">{this.title('title_ac_charger')}</span>
                            <TipBadge
                                className={`sig-ac-badge ${si.badge}`}
                                label={si.label}
                                tip={si.tip}
                                dark={dark}
                            />
                        </div>
                        <div
                            className="sig-ac-power-big"
                            style={{ color: pwr > 0.05 ? '#3498db' : textCol(dark) }}
                        >
                            {fmtKW(pwr)}
                        </div>
                        <div className="sig-ac-power-lbl">{this.t('charging_power')}</div>
                        <div className="sig-ac-stats">
                            {stat(this.t('rated_power'), rp ? `${rp.toFixed(1)} kW` : '-- kW', '#f39c12')}
                            {stat(this.t('rated_current'), rc ? `${Math.round(rc)} A` : '-- A', '#f39c12')}
                            {stat(this.t('total_energy'), en ? `${en.toFixed(1)} kWh` : '-- kWh', '#27ae60')}
                            {stat(this.t('alarm'), alarmText, alarm ? '#e74c3c' : '#27ae60')}
                        </div>
                        <div className="sig-ac-ctrl">
                            <div className="sig-ac-ctrl-lbl">{this.t('control')}</div>
                            <div className="sig-ac-btn-row">
                                <button
                                    className={`sig-ac-btn start${!charging && ss === 0 ? ' active-state' : ''}`}
                                    disabled={charging}
                                    title={charging ? this.t('charging_running_hint') : ''}
                                    onClick={() => !charging && this.write('oid_startStop', 0)}
                                >
                                    ▶ Start
                                </button>
                                <button
                                    className={`sig-ac-btn stop${charging ? ' raised' : ''}${charging && ss === 1 ? ' active-state' : ''}`}
                                    onClick={() => this.write('oid_startStop', 1)}
                                >
                                    ▮▮ Stop
                                </button>
                            </div>
                            <div className="sig-ac-slider-row">
                                <span className="sig-ac-slider-lbl">{this.t('charging_current')}:</span>
                                <CommitSlider
                                    value={curVal}
                                    min={MIN_CURRENT}
                                    max={max}
                                    disabled={!this.oid('oid_current')}
                                    format={v => `${v} A`}
                                    valueClassName="sig-ac-slider-val"
                                    onCommit={v =>
                                        this.write('oid_current', Math.min(Math.max(Math.round(v), MIN_CURRENT), max))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Scaled>
        );
    }
}
