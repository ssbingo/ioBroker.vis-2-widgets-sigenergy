import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import SigWidget, { appearanceFields, oidField, SET_COLOR, SET_ICON, VIS_SET, type SigRxData } from './SigWidget';
import Scaled from './Scaled';
import { fmtKW, num0, textCol } from './common';

interface PvStringsRxData extends SigRxData {
    oid_pv1: string;
    oid_pv2: string;
    oid_pv3: string;
    oid_pvtotal: string;
    sig_name1: string;
    sig_name2: string;
    sig_name3: string;
}

const IMG = 'widgets/vis-2-widgets-sigenergy/img/';
const PV_COL = '#f39c12';
const GRAY = '#7a8a9a';

/* Arrow colour (kW): < 0.1 inactive · 0.1–1 orange · 1–2 yellow · > 2 green */
function arrow(kW: number): { col: string; mark: string } | null {
    if (kW < 0.1) {
        return null;
    }
    if (kW < 1) {
        return { col: '#f39c12', mark: 'o' };
    }
    if (kW < 2) {
        return { col: '#f1c40f', mark: 'y' };
    }
    return { col: '#27ae60', mark: 'g' };
}

export default class PvStrings extends SigWidget<PvStringsRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplVis-2-widgets-sigenergyPvStrings',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'PvStrings',
            visWidgetLabel: 'w_pv_strings',
            visAttrs: [
                {
                    name: 'oids',
                    label: 'group_oids',
                    fields: [
                        oidField('oid_pv1', 'sigenergy.0.plant.pv1Power'),
                        oidField('oid_pv2', 'sigenergy.0.plant.pv2Power'),
                        oidField('oid_pv3', 'sigenergy.0.plant.pv3Power'),
                        oidField('oid_pvtotal', 'sigenergy.0.plant.pvPower'),
                    ],
                },
                {
                    name: 'appearance',
                    label: 'group_appearance',
                    fields: [
                        ...appearanceFields(),
                        { name: 'sig_name1', type: 'text', label: 'sig_name1', default: 'String 1' },
                        { name: 'sig_name2', type: 'text', label: 'sig_name2', default: 'String 2' },
                        { name: 'sig_name3', type: 'text', label: 'sig_name3', default: 'String 3' },
                    ],
                },
            ],
            visDefaultStyle: { width: 420, height: 380 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-pv-strings.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return PvStrings.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const dark = this.dark();
        const rx = this.state.rxData;
        const txt = textCol(dark);
        const sub = dark ? '#5a7898' : '#6a8aaa';
        const mark = `mPvStr_${this.props.id}`;
        const vals = [num0(this.v('oid_pv1')), num0(this.v('oid_pv2')), num0(this.v('oid_pv3'))];
        const names = [rx.sig_name1 || 'String 1', rx.sig_name2 || 'String 2', rx.sig_name3 || 'String 3'];
        const paths = ['M55,0 Q55,45 194,65', 'M194,0 L194,65', 'M333,0 Q333,45 194,65'];

        const col = (i: number): React.JSX.Element => (
            <div
                key={i}
                style={{ position: 'relative', width: 130, textAlign: 'center' }}
            >
                <img
                    src={`${IMG}solarpanel.png`}
                    alt=""
                    style={{ width: 130, height: 65, display: 'block', objectFit: 'contain' }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: '30%',
                        left: '50%',
                        transform: 'translate(-50%,-50%)',
                        background: 'rgba(0,0,0,.65)',
                        borderRadius: 5,
                        padding: '3px 8px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                    }}
                >
                    <span
                        className="sig-text"
                        style={{ fontSize: 13, fontWeight: 600, color: vals[i] > 0.1 ? PV_COL : GRAY }}
                    >
                        {fmtKW(vals[i])}
                    </span>
                </div>
                <div style={{ marginTop: 4 }}>
                    <span
                        className="sig-text"
                        style={{ fontSize: 10, color: sub }}
                    >
                        {names[i]}
                    </span>
                </div>
            </div>
        );

        return (
            <Scaled designWidth={400}>
                <div className="sig-w">
                    <div
                        style={{
                            background: dark ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : '#fff',
                            border: dark ? 'none' : '1px solid #e8eef5',
                            borderRadius: 14,
                            padding: '16px 14px 14px',
                            fontFamily: 'sans-serif',
                            color: txt,
                            width: '100%',
                        }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: 12 }}>
                            <span
                                className="sig-text"
                                style={{ fontSize: '.9rem', fontWeight: 600, color: txt }}
                            >
                                ☀ {this.title('title_pv_strings')}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                            {[0, 1, 2].map(col)}
                        </div>
                        <div style={{ position: 'relative', height: 70, width: '100%' }}>
                            <svg
                                viewBox="0 0 388 70"
                                preserveAspectRatio="none"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: 70,
                                    pointerEvents: 'none',
                                    overflow: 'visible',
                                }}
                            >
                                <defs>
                                    {[
                                        ['o', '#f39c12'],
                                        ['y', '#f1c40f'],
                                        ['g', '#27ae60'],
                                    ].map(([m, c]) => (
                                        <marker
                                            key={m}
                                            id={`${mark}_${m}`}
                                            markerWidth="6"
                                            markerHeight="6"
                                            refX="5"
                                            refY="3"
                                            orient="auto"
                                        >
                                            <polygon
                                                points="0,0 6,3 0,6"
                                                fill={c}
                                            />
                                        </marker>
                                    ))}
                                </defs>
                                {paths.map((d, i) => {
                                    const a = arrow(vals[i]);
                                    return (
                                        <path
                                            key={d}
                                            className={`sig-flow-path${a ? ' active' : ''}`}
                                            stroke={a ? a.col : PV_COL}
                                            d={d}
                                            markerEnd={`url(#${mark}_${a ? a.mark : 'o'})`}
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <img
                                src={`${IMG}Sigen_Hybrid_Vorderansicht.png`}
                                alt=""
                                style={{ width: 220, height: 96, display: 'inline-block', objectFit: 'contain' }}
                            />
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                            <div
                                style={{
                                    display: 'inline-block',
                                    background: 'rgba(243,156,18,.1)',
                                    border: '1px solid rgba(243,156,18,.35)',
                                    borderRadius: 8,
                                    padding: '4px 18px',
                                }}
                            >
                                <div>
                                    <span
                                        className="sig-text"
                                        style={{ fontSize: 10, color: sub, letterSpacing: '.5px' }}
                                    >
                                        {this.t('total_pv')}
                                    </span>
                                </div>
                                <div>
                                    <span
                                        className="sig-text"
                                        style={{ fontSize: 18, fontWeight: 600, color: PV_COL, lineHeight: 1.25 }}
                                    >
                                        {fmtKW(num0(this.v('oid_pvtotal')))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Scaled>
        );
    }
}
