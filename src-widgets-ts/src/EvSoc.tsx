import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import SigWidget, { SET_COLOR, SET_ICON, VIS_SET, oidField, appearanceFields, type SigRxData } from './SigWidget';
import Scaled from './Scaled';
import { toBool, toNum } from './common';

interface EvSocRxData extends SigRxData {
    oid_ev_soc: string;
    oid_charging: string;
    sig_car_image: string;
}

/*
 * Layout: SOC badge top right | vehicle image (main eye-catcher) | name | bar
 * Colour: ≤ 15 % #f87171 · ≤ 35 % #fbbf24 · > 35 % #4ade80
 * oid_charging (optional): green glow on the badge while truthy
 */
export default class EvSoc extends SigWidget<EvSocRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplVis-2-widgets-sigenergyEvSoc',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'EvSoc',
            visWidgetLabel: 'w_ev_soc',
            visAttrs: [
                {
                    name: 'oids',
                    label: 'group_oids',
                    fields: [oidField('oid_ev_soc'), oidField('oid_charging')],
                },
                {
                    name: 'appearance',
                    label: 'group_appearance',
                    fields: [...appearanceFields(), { name: 'sig_car_image', type: 'image', label: 'sig_car_image' }],
                },
            ],
            visDefaultStyle: { width: 380, height: 240 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-ev-soc.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return EvSoc.getWidgetInfo();
    }

    /** Project-relative images of the vis-2 file selector start with "_PRJ_NAME/". */
    private imageUrl(src: string): string {
        if (src.startsWith('_PRJ_NAME/')) {
            const c = this.props.context;
            return src.replace('_PRJ_NAME/', `../${c.adapterName}.${c.instance}/${c.projectName}/`);
        }
        return src;
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const dark = this.dark();
        const soc = toNum(this.v('oid_ev_soc'));
        const fill = soc === null ? 0 : Math.max(0, Math.min(100, soc));
        const pct = soc === null ? '--%' : `${Math.round(soc)}%`;
        const color = fill <= 15 ? '#f87171' : fill <= 35 ? '#fbbf24' : '#4ade80';
        const img = (this.state.rxData.sig_car_image || '').trim();

        return (
            <Scaled designWidth={380}>
                <div className="sig-w">
                    <div className={`sig-ev-wrap${dark ? '' : ' light'}`}>
                        <div className={`sig-ev-badge${toBool(this.v('oid_charging')) ? ' ev-charging' : ''}`}>
                            <span
                                className="sig-ev-badge-icon sig-text"
                                style={{ color }}
                            >
                                ⚡
                            </span>
                            <span className="sig-ev-badge-pct sig-text">{pct}</span>
                            <div
                                className="sig-ev-badge-lbl sig-text"
                                style={{ color }}
                            >
                                {this.t('charge_level_badge')}
                            </div>
                        </div>
                        <div className="sig-ev-img-area">
                            {img ? (
                                <img
                                    className="sig-ev-car-img"
                                    src={this.imageUrl(img)}
                                    alt="EV"
                                />
                            ) : (
                                <div className="sig-ev-no-img">🚘</div>
                            )}
                        </div>
                        <div className="sig-ev-car-name sig-text">{this.title('title_ev_soc')}</div>
                        <div className="sig-ev-bar-row">
                            <div className="sig-ev-bar-track">
                                <div
                                    className="sig-ev-bar-fill"
                                    style={{ width: `${fill}%`, backgroundColor: color }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Scaled>
        );
    }
}
