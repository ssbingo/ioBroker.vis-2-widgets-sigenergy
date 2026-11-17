import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import SigWidget, { appearanceFields, oidField, SET_COLOR, SET_ICON, VIS_SET, type SigRxData } from './SigWidget';
import Scaled from './Scaled';
import { fmtKWh, fmtMin, fmtPct } from './common';

interface StatisticsRxData extends SigRxData {
    oid_aut: string;
    oid_sc: string;
    oid_maxsoc: string;
    oid_minsoc: string;
    oid_charg: string;
    oid_discharg: string;
    oid_covtime: string;
    oid_chargt: string;
}

export default class Statistics extends SigWidget<StatisticsRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplVis-2-widgets-sigenergyStatistics',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'Statistics',
            visWidgetLabel: 'w_statistics',
            visAttrs: [
                {
                    name: 'oids',
                    label: 'group_oids',
                    fields: [
                        oidField('oid_aut', 'sigenergy.0.statistics.autarkyRate'),
                        oidField('oid_sc', 'sigenergy.0.statistics.selfConsumptionRate'),
                        oidField('oid_maxsoc', 'sigenergy.0.statistics.dayMaxSoc'),
                        oidField('oid_minsoc', 'sigenergy.0.statistics.dayMinSoc'),
                        oidField('oid_charg', 'sigenergy.0.inverter.essDailyChargeEnergy'),
                        oidField('oid_discharg', 'sigenergy.0.inverter.essDailyDischargeEnergy'),
                        oidField('oid_covtime', 'sigenergy.0.statistics.batteryCoverageToday'),
                        oidField('oid_chargt', 'sigenergy.0.statistics.batteryDailyChargeTime'),
                    ],
                },
                { name: 'appearance', label: 'group_appearance', fields: appearanceFields() },
            ],
            visDefaultStyle: { width: 300, height: 300 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-statistics.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return Statistics.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const dark = this.dark();
        const item = (label: string, value: string, color: string): React.JSX.Element => (
            <div className="sig-stats-item">
                <div className="s-label">{label}</div>
                <div
                    className="s-value"
                    style={{ color }}
                >
                    {value}
                </div>
            </div>
        );

        return (
            <Scaled designWidth={300}>
                <div className="sig-w">
                    <div className={`sig-stats-wrap${dark ? ' dark' : ''}`}>
                        <div className="sig-stats-title">📊 {this.title('title_statistics')}</div>
                        <div className="sig-stats-grid">
                            {item(`🏡 ${this.t('autarky')}`, fmtPct(this.v('oid_aut')), '#27ae60')}
                            {item(`↻ ${this.t('self_consumption')}`, fmtPct(this.v('oid_sc')), '#9b59b6')}
                            {item(`↑ ${this.t('max_soc_today')}`, fmtPct(this.v('oid_maxsoc')), '#f39c12')}
                            {item(`↓ ${this.t('min_soc_today')}`, fmtPct(this.v('oid_minsoc')), '#3498db')}
                            {item(`⬆ ${this.t('daily_charge')}`, fmtKWh(this.v('oid_charg')), '#16a085')}
                            {item(`⬇ ${this.t('daily_discharge')}`, fmtKWh(this.v('oid_discharg')), '#e74c3c')}
                            {item(`⌛ ${this.t('battery_coverage')}`, fmtMin(this.v('oid_covtime')), '#8e44ad')}
                            {item(`⚡ ${this.t('charge_time_today')}`, fmtMin(this.v('oid_chargt')), '#c0392b')}
                        </div>
                    </div>
                </div>
            </Scaled>
        );
    }
}
