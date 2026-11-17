import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import SigWidget, { appearanceFields, oidField, SET_COLOR, SET_ICON, VIS_SET, type SigRxData } from './SigWidget';
import Scaled from './Scaled';
import { fmtKW, num0, socCol, textCol } from './common';

interface EnergyFlowRxData extends SigRxData {
    oid_pv: string;
    oid_bat: string;
    oid_grid: string;
    oid_house: string;
    oid_soc: string;
    sig_animation: boolean | string;
}

/*
 * SVG coordinates (viewBox 0 0 300 248):
 *   Solar PV top-left (58, 42) · battery top-right (242, 42)
 *   grid bottom-left (58, 208) · house bottom-right (242, 208) · hub (150, 125)
 * Battery and grid have one path per direction, so the arrow always points the way the
 * energy flows.
 */
export default class EnergyFlow extends SigWidget<EnergyFlowRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplVis-2-widgets-sigenergyEnergyFlow',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'EnergyFlow',
            visWidgetLabel: 'w_energy_flow',
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
                {
                    name: 'appearance',
                    label: 'group_appearance',
                    fields: [
                        ...appearanceFields(),
                        { name: 'sig_animation', type: 'checkbox', label: 'sig_animation', default: true },
                    ],
                },
            ],
            visDefaultStyle: { width: 300, height: 300 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-energy-flow.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return EnergyFlow.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const dark = this.dark();
        const tc = textCol(dark);
        const w = this.props.id;

        const pv = num0(this.v('oid_pv'));
        const bat = num0(this.v('oid_bat'));
        const grid = num0(this.v('oid_grid'));
        const house = num0(this.v('oid_house'));
        const soc = num0(this.v('oid_soc'));
        const anim = this.state.rxData.sig_animation !== false && this.state.rxData.sig_animation !== 'false';

        const cls = (on: boolean, color: string): string =>
            `sig-flow-path ${color}${on ? ' active' : ''}${anim ? '' : ' no-anim'}`;
        const sc = socCol(soc);
        const label = (x: number, y: number, text: string): React.JSX.Element => (
            <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="8.5"
                fill={tc}
                opacity="0.65"
            >
                {text}
            </text>
        );
        const value = (x: number, y: number, text: string, fill: string): React.JSX.Element => (
            <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12.5"
                fontWeight="700"
                fill={fill}
            >
                {text}
            </text>
        );
        const icon = (x: number, y: number, ch: string, fill: string): React.JSX.Element => (
            <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="20"
                fill={fill}
            >
                {ch}
            </text>
        );
        const marker = (id: string, fill: string): React.JSX.Element => (
            <marker
                id={`${id}_${w}`}
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
            >
                <polygon
                    points="0,0 6,3 0,6"
                    fill={fill}
                />
            </marker>
        );

        return (
            <Scaled designWidth={300}>
                <div className="sig-w">
                    <div className={dark ? 'sig-ef-wrap' : 'sig-ef-wrap light'}>
                        <div className="sig-ef-title">⚡ {this.title('title_energy_flow')}</div>
                        <div className="sig-ef-svg-wrap">
                            <svg
                                viewBox="0 0 300 248"
                                preserveAspectRatio="xMidYMid meet"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    {marker('mPv', '#f39c12')}
                                    {marker('mBat', '#9b59b6')}
                                    {marker('mGrid', '#3498db')}
                                    {marker('mHouse', '#27ae60')}
                                </defs>
                                <path
                                    className={cls(Math.abs(pv) > 0.05, 'pv-color')}
                                    d="M58,63  Q58,125  142,125"
                                    markerEnd={`url(#mPv_${w})`}
                                />
                                <path
                                    className={cls(bat < -0.05, 'bat-color')}
                                    d="M242,71 Q242,125 158,125"
                                    markerEnd={`url(#mBat_${w})`}
                                />
                                <path
                                    className={cls(bat > 0.05, 'bat-color')}
                                    d="M158,125 Q242,125 242,71"
                                    markerEnd={`url(#mBat_${w})`}
                                />
                                <path
                                    className={cls(grid > 0.05, 'grid-color')}
                                    d="M58,191 Q58,125  142,125"
                                    markerEnd={`url(#mGrid_${w})`}
                                />
                                <path
                                    className={cls(grid < -0.05, 'grid-color')}
                                    d="M142,125 Q58,125  58,191"
                                    markerEnd={`url(#mGrid_${w})`}
                                />
                                <path
                                    className={cls(Math.abs(house) > 0.05, 'house-color')}
                                    d="M158,125 Q242,125 242,191"
                                    markerEnd={`url(#mHouse_${w})`}
                                />

                                <circle
                                    cx="150"
                                    cy="125"
                                    r="18"
                                    fill={dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'}
                                />
                                <text
                                    x="150"
                                    y="125"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize="18"
                                    fill={tc}
                                    opacity="0.85"
                                >
                                    ⚡
                                </text>

                                {icon(58, 28, '☀', '#f39c12')}
                                {label(58, 45, this.t('solar_pv'))}
                                {value(58, 57, fmtKW(pv), '#f39c12')}

                                <text
                                    x="202"
                                    y="18"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize="8"
                                    fill={tc}
                                    opacity="0.65"
                                >
                                    SOC
                                </text>
                                <text
                                    x="202"
                                    y="31"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize="12"
                                    fontWeight="700"
                                    fill={sc}
                                >
                                    {`${Math.round(soc)} %`}
                                </text>
                                <rect
                                    x="229"
                                    y="21"
                                    width="22"
                                    height="14"
                                    rx="2"
                                    fill="none"
                                    stroke="#9b59b6"
                                    strokeWidth="1.5"
                                />
                                <rect
                                    x="251"
                                    y="24"
                                    width="3"
                                    height="8"
                                    rx="1"
                                    fill="#9b59b6"
                                />
                                <rect
                                    x="230"
                                    y="22"
                                    width={Math.max(1, Math.round((soc / 100) * 20))}
                                    height="12"
                                    rx="1"
                                    fill={sc}
                                />
                                {label(242, 45, this.t('battery'))}
                                {value(242, 57, fmtKW(bat), '#9b59b6')}

                                {icon(58, 197, '🔌', '#3498db')}
                                {label(58, 214, this.t('grid'))}
                                {value(58, 226, fmtKW(grid), grid < 0 ? '#27ae60' : '#e74c3c')}

                                {icon(242, 197, '🏠', '#27ae60')}
                                {label(242, 214, this.t('house'))}
                                {value(242, 226, fmtKW(house), '#27ae60')}
                            </svg>
                        </div>
                    </div>
                </div>
            </Scaled>
        );
    }
}
