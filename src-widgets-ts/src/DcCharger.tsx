import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import SigWidget, { appearanceFields, oidField, SET_COLOR, SET_ICON, VIS_SET, type SigRxData } from './SigWidget';
import Scaled from './Scaled';
import { TipBadge } from './components';
import { fmtDuration, fmtKW, fmtPct, num0, textCol, toNum, type StateVal } from './common';

interface DcChargerRxData extends SigRxData {
    oid_state: string;
    oid_power: string;
    oid_vsoc: string;
    oid_vvolt: string;
    oid_curr: string;
    oid_energy: string;
    oid_duration: string;
    oid_protocol: string;
    oid_startStop: string;
}

/*
 * dcCharger.runningState (register 31513, since protocol V2.8):
 *   0 idle · 1 occupied · 2 preparing (communication) · 3 charging · 4 fault · 5 scheduled ·
 *   6 ended · 7 unavailable · 8 discharging · 9 alarm · 10 preparing (insulation check)
 *
 * Without oid_state the state OID is derived from oid_power (…outputPower → …runningState).
 * If that delivers no value either, the badge is derived from the output power and the
 * tooltip explains why — depending on the protocol version the adapter detected.
 *
 * 0xFFFF is the "register not valid" marker of the Sigenergy protocol. A SigenStor EC WITH a
 * DC charger answers that way for 31513 while the neighbouring registers read normally.
 * Adapters from 3.3.1 deliver no value then; older ones pass the raw 65535 through.
 *
 * Control: dcCharger.control.startStop 0 = start, 1 = stop (write only)
 */
const STATES: Record<number, { label: string; cls: string }> = {
    0: { label: 'st_free', cls: 'idle' },
    1: { label: 'st_connected', cls: 'idle' },
    2: { label: 'st_preparing', cls: 'idle' },
    3: { label: 'st_charging', cls: 'charging' },
    4: { label: 'st_error', cls: 'error' },
    5: { label: 'st_scheduled', cls: 'scheduled' },
    6: { label: 'st_ended', cls: 'idle' },
    7: { label: 'st_unavailable', cls: 'error' },
    8: { label: 'st_discharging', cls: 'discharging' },
    9: { label: 'st_warning', cls: 'warning' },
    10: { label: 'st_preparing', cls: 'idle' },
};
const STATE_INVALID = 0xffff;
const STATE_SINCE = 2.8;

interface Badge {
    label: string;
    cls: string;
    tip: string;
}

export default class DcCharger extends SigWidget<DcChargerRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplVis-2-widgets-sigenergyDcCharger',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'DcCharger',
            visWidgetLabel: 'w_dc_charger',
            visAttrs: [
                {
                    name: 'oids',
                    label: 'group_measurements',
                    fields: [
                        oidField('oid_state', 'sigenergy.0.dcCharger.runningState'),
                        oidField('oid_power', 'sigenergy.0.dcCharger.outputPower'),
                        oidField('oid_vsoc', 'sigenergy.0.dcCharger.vehicleSoc'),
                        oidField('oid_vvolt', 'sigenergy.0.dcCharger.vehicleBatteryVoltage'),
                        oidField('oid_curr', 'sigenergy.0.dcCharger.chargingCurrent'),
                        oidField('oid_energy', 'sigenergy.0.dcCharger.currentChargingCapacity'),
                        oidField('oid_duration', 'sigenergy.0.dcCharger.currentChargingDuration'),
                        oidField('oid_protocol', 'sigenergy.0.info.protocolVersion'),
                    ],
                },
                {
                    name: 'control',
                    label: 'group_control',
                    fields: [oidField('oid_startStop', 'sigenergy.0.dcCharger.control.startStop')],
                },
                { name: 'appearance', label: 'group_appearance', fields: appearanceFields() },
            ],
            visDefaultStyle: { width: 300, height: 340 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-dc-charger.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return DcCharger.getWidgetInfo();
    }

    /** State OID: configured, or derived from the power OID (…outputPower → …runningState). */
    private stateOid(): { id: string; auto: boolean } {
        const id = this.oid('oid_state');
        if (id) {
            return { id, auto: false };
        }
        const p = this.oid('oid_power');
        return /\.dcCharger\.outputPower$/.test(p)
            ? { id: p.replace(/\.outputPower$/, '.runningState'), auto: true }
            : { id: '', auto: false };
    }

    /** info.protocolVersion / info.protocolLevel of the instance — only without oid_protocol. */
    private protoOids(): string[] {
        const proto = this.oid('oid_protocol');
        if (proto) {
            return [proto];
        }
        const m = /^([^.]+\.\d+)\./.exec(this.stateOid().id || this.oid('oid_power'));
        return m ? [`${m[1]}.info.protocolVersion`, `${m[1]}.info.protocolLevel`] : [];
    }

    protected extraIds(): string[] {
        const st = this.stateOid();
        const ids = st.auto ? [st.id] : [];
        return this.oid('oid_protocol') ? ids : ids.concat(this.protoOids());
    }

    /** Protocol version, or null if it cannot be read here (≠ "the adapter detected none"). */
    private protocolVersion(): number | null {
        for (const id of this.protoOids()) {
            const raw = this.ev(id);
            if (raw === undefined || raw === null || raw === '') {
                continue;
            }
            const n = parseFloat(String(raw));
            if (n > 0) {
                return n;
            }
            const txt = String(raw);
            if (/pre-V2\.6/i.test(txt)) {
                return 2.5;
            }
            const m = /V(\d+\.\d+)/.exec(txt);
            if (m) {
                return parseFloat(m[1]);
            }
        }
        return null;
    }

    private protocolText(v: number | null): string {
        return v === null ? this.t('unknown') : v < 2.6 ? this.t('before_v26') : `V${v}`;
    }

    private powerBadge(pwr: number, hint: string): Badge {
        let b: Badge;
        if (pwr > 0.05) {
            b = { label: this.t('st_charging'), cls: 'charging', tip: this.t('dc_tip_pwr_charging') };
        } else if (pwr < -0.05) {
            b = { label: this.t('st_discharging'), cls: 'discharging', tip: this.t('dc_tip_pwr_discharging') };
        } else {
            b = { label: this.t('st_ready'), cls: 'idle', tip: this.t('dc_tip_pwr_ready') };
        }
        b.tip += ` ${hint}`;
        return b;
    }

    private noStateHint(stateId: string): string {
        const pv = this.protocolVersion();
        if (pv !== null && pv < STATE_SINCE) {
            return this.t('dc_hint_old_protocol', this.protocolText(pv));
        }
        if (pv !== null) {
            return this.t('dc_hint_no_value', stateId, this.protocolText(pv));
        }
        return this.t('dc_hint_no_protocol', stateId);
    }

    private badgeInfo(state: StateVal, pwr: number, stateId: string): Badge {
        if (!stateId) {
            return this.powerBadge(pwr, this.t('dc_hint_no_state_oid'));
        }
        const missing = state === undefined || state === null || state === '';
        const invalid = !missing && toNum(state) === STATE_INVALID;
        if (missing || invalid) {
            return this.powerBadge(
                pwr,
                `${this.t('dc_hint_power_only')} ${invalid ? this.t('dc_hint_invalid') : this.noStateHint(stateId)}`,
            );
        }
        const n = toNum(state);
        if (n !== null && STATES[n]) {
            return { label: this.t(STATES[n].label), cls: STATES[n].cls, tip: this.t(`dc_tip_${n}`) };
        }
        return { label: this.t('st_unknown'), cls: 'error', tip: this.t('dc_tip_unknown', String(state)) };
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const dark = this.dark();
        const pwr = num0(this.v('oid_power'));
        const vsoc = num0(this.v('oid_vsoc'));
        const volt = num0(this.v('oid_vvolt'));
        const curr = num0(this.v('oid_curr'));
        const en = num0(this.v('oid_energy'));
        const dur = num0(this.v('oid_duration'));

        const st = this.stateOid();
        const bi = this.badgeInfo(st.id ? this.ev(st.id) : undefined, pwr, st.id);
        const vcol = vsoc > 60 ? '#27ae60' : vsoc > 25 ? '#f39c12' : '#e74c3c';
        const ss = toNum(this.v('oid_startStop'));
        const active = bi.cls === 'charging' || bi.cls === 'discharging';

        const stat = (label: string, value: string, color: string): React.JSX.Element => (
            <div className="sig-dc-stat-box">
                <div className="sig-dc-stat-lbl">{label}</div>
                <div
                    className="sig-dc-stat-val"
                    style={{ color }}
                >
                    {value}
                </div>
            </div>
        );

        return (
            <Scaled designWidth={300}>
                <div className="sig-w">
                    <div className={`sig-dc-wrap${dark ? '' : ' light'}`}>
                        <div className="sig-dc-head">
                            <span className="icon">⚡</span>
                            <span className="title">{this.title('title_dc_charger')}</span>
                            <TipBadge
                                className={`sig-dc-badge ${bi.cls}`}
                                label={bi.label}
                                tip={bi.tip}
                                dark={dark}
                            />
                        </div>
                        <div
                            className="sig-dc-power-big"
                            style={{ color: pwr > 0.05 ? '#f39c12' : pwr < -0.05 ? '#9b59b6' : textCol(dark) }}
                        >
                            {fmtKW(pwr)}
                        </div>
                        <div className="sig-dc-power-lbl">{this.t('output_power')}</div>
                        <div className="sig-dc-soc-row">
                            <span className="sig-dc-soc-lbl">🚘 {this.t('vehicle_soc')}</span>
                            <span
                                className="sig-dc-soc-val"
                                style={{ color: vcol }}
                            >
                                {fmtPct(vsoc)}
                            </span>
                        </div>
                        <div className="sig-dc-soc-bar-bg">
                            <div
                                className="sig-dc-soc-bar-fill"
                                style={{ width: `${Math.min(100, vsoc)}%`, background: vcol }}
                            />
                        </div>
                        <div className="sig-dc-stats">
                            {stat(this.t('voltage'), volt ? `${volt.toFixed(0)} V` : '-- V', '#3498db')}
                            {stat(this.t('current'), curr ? `${curr.toFixed(1)} A` : '-- A', '#3498db')}
                            {stat(this.t('session_energy'), en ? `${en.toFixed(2)} kWh` : '-- kWh', '#9b59b6')}
                            {stat(this.t('session_duration'), dur ? fmtDuration(dur) : '--', '#9b59b6')}
                        </div>
                        <div className="sig-dc-ctrl">
                            <div className="sig-dc-ctrl-lbl">{this.t('control')}</div>
                            <div className="sig-dc-btn-row">
                                <button
                                    className={`sig-dc-btn start${!active && ss === 0 ? ' active-state' : ''}`}
                                    disabled={active}
                                    title={active ? this.t('charging_running_hint') : ''}
                                    onClick={() => !active && this.write('oid_startStop', 0)}
                                >
                                    ▶ Start
                                </button>
                                <button
                                    className={`sig-dc-btn stop${active ? ' raised' : ''}${active && ss === 1 ? ' active-state' : ''}`}
                                    onClick={() => this.write('oid_startStop', 1)}
                                >
                                    ▮▮ Stop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Scaled>
        );
    }
}
