import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import SigWidget, { appearanceFields, oidField, SET_COLOR, SET_ICON, VIS_SET, type SigRxData } from './SigWidget';
import Scaled from './Scaled';
import { fmtKW, fmtPct, num0, socCol } from './common';

interface PowerOverviewRxData extends SigRxData {
    oid_pv: string;
    oid_bat: string;
    oid_grid: string;
    oid_house: string;
    oid_soc: string;
}

export default class PowerOverview extends SigWidget<PowerOverviewRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplVis-2-widgets-sigenergyPowerOverview',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'PowerOverview',
            visWidgetLabel: 'w_power_overview',
            visAttrs: [
                {
                    name: 'oids',
                    label: 'group_oids',
                    fields: [
                        oidField('oid_pv', 'sigenergy.0.plant.pvPower'),
                        oidField('oid_bat', 'sigenergy.0.plant.essPower'),
                        oidField('oid_grid', 'sigenergy.0.plant.gridActivePower'),
                        oidField('oid_house', 'sigenergy.0.statistics.housePower'),
                        oidField('oid_soc', 'sigenergy.0.plant.essSoc'),
                    ],
                },
                { name: 'appearance', label: 'group_appearance', fields: appearanceFields() },
            ],
            visDefaultStyle: { width: 300, height: 300 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-power-overview.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return PowerOverview.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const dark = this.dark();
        const bat = num0(this.v('oid_bat'));
        const grid = num0(this.v('oid_grid'));
        const soc = this.v('oid_soc');
        const row = (
            dot: string,
            label: string,
            value: string,
            color?: string,
            style?: React.CSSProperties,
        ): React.JSX.Element => (
            <div
                className="sig-pow-row"
                style={style}
            >
                <div className="sig-pow-left">
                    <div
                        className="sig-dot"
                        style={{ background: dot }}
                    />
                    {label}
                </div>
                <div
                    className="sig-pow-val"
                    style={color ? { color } : undefined}
                >
                    {value}
                </div>
            </div>
        );

        return (
            <Scaled designWidth={300}>
                <div className="sig-w">
                    <div className={`sig-pow-wrap${dark ? '' : ' light'}`}>
                        <div className="sig-pow-title">
                            <div className="sig-live-dot" />
                            {this.title('title_power_overview')}
                        </div>
                        {row('#f39c12', `☀ ${this.t('solar_pv')}`, fmtKW(this.v('oid_pv')))}
                        {row('#9b59b6', `🔋 ${this.t('battery')}`, fmtKW(bat), bat < 0 ? '#e74c3c' : '#27ae60')}
                        {row('#3498db', `🔌 ${this.t('grid')}`, fmtKW(grid), grid < 0 ? '#27ae60' : '#e74c3c')}
                        {row('#27ae60', `🏠 ${this.t('house')}`, fmtKW(this.v('oid_house')))}
                        {row('#8e44ad', '🔋 SOC', fmtPct(soc), socCol(soc), {
                            borderTop: '1px solid rgba(128,128,128,.15)',
                            marginTop: 6,
                            paddingTop: 6,
                        })}
                    </div>
                </div>
            </Scaled>
        );
    }
}
