import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import SigWidget, { appearanceFields, oidField, SET_COLOR, SET_ICON, VIS_SET, type SigRxData } from './SigWidget';
import Scaled from './Scaled';
import { fmtKW, fmtMin, fmtPct, num0, socCol } from './common';

interface BatteryStatusRxData extends SigRxData {
    oid_soc: string;
    oid_soh: string;
    oid_bat: string;
    oid_ttf: string;
    oid_ttr: string;
    oid_sc: string;
    oid_aut: string;
}

export default class BatteryStatus extends SigWidget<BatteryStatusRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplVis-2-widgets-sigenergyBatteryStatus',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'BatteryStatus',
            visWidgetLabel: 'w_battery_status',
            visAttrs: [
                {
                    name: 'oids',
                    label: 'group_oids',
                    fields: [
                        oidField('oid_soc', 'sigenergy.0.plant.essSoc'),
                        oidField('oid_soh', 'sigenergy.0.plant.essSoh'),
                        oidField('oid_bat', 'sigenergy.0.plant.essPower'),
                        oidField('oid_ttf', 'sigenergy.0.statistics.batteryTimeToFull'),
                        oidField('oid_ttr', 'sigenergy.0.statistics.batteryTimeRemaining'),
                        oidField('oid_sc', 'sigenergy.0.statistics.selfConsumptionRate'),
                        oidField('oid_aut', 'sigenergy.0.statistics.autarkyRate'),
                    ],
                },
                { name: 'appearance', label: 'group_appearance', fields: appearanceFields() },
            ],
            visDefaultStyle: { width: 300, height: 300 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-battery-status.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BatteryStatus.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const dark = this.dark();
        const soc = num0(this.v('oid_soc'));
        const col = socCol(soc);
        const bat = num0(this.v('oid_bat'));
        const box = (label: string, value: string, color?: string): React.JSX.Element => (
            <div className="sig-stat-box">
                <div className="sig-stat-label">{label}</div>
                <div
                    className="sig-stat-val"
                    style={color ? { color } : undefined}
                >
                    {value}
                </div>
            </div>
        );

        return (
            <Scaled designWidth={300}>
                <div className="sig-w">
                    <div className={`sig-bat-wrap${dark ? '' : ' light'}`}>
                        <div className="sig-bat-head">
                            <span className="icon">🔋</span>
                            <span className="title">{this.title('title_battery_status')}</span>
                            <span className="sig-bat-soh">SOH: {fmtPct(this.v('oid_soh'))}</span>
                        </div>
                        <div
                            className="sig-soc-big"
                            style={{ color: col }}
                        >
                            {fmtPct(soc)}
                        </div>
                        <div className="sig-soc-bar-bg">
                            <div
                                className="sig-soc-bar-fill"
                                style={{ width: `${Math.min(100, soc)}%`, background: col }}
                            />
                        </div>
                        <div className="sig-soc-labels">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                        <div className="sig-bat-stats">
                            {box(`⚡ ${this.t('power')}`, fmtKW(bat), bat >= 0 ? '#27ae60' : '#e74c3c')}
                            {box(`⌛ ${this.t('time_to_full')}`, fmtMin(this.v('oid_ttf')))}
                            {box(`⏳ ${this.t('time_remaining')}`, fmtMin(this.v('oid_ttr')))}
                            {box(`☀ ${this.t('self_consumption')}`, fmtPct(this.v('oid_sc')))}
                            {box(`🏡 ${this.t('autarky')}`, fmtPct(this.v('oid_aut')))}
                        </div>
                    </div>
                </div>
            </Scaled>
        );
    }
}
