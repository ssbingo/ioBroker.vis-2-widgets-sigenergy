import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps } from '@iobroker/types-vis-2';

import SigWidget, { oidField, SET_COLOR, SET_ICON, VIS_SET, type SigRxData, type SigState } from './SigWidget';
import { num0, toNum, type StateVal } from './common';

/**
 * Energy house: the energy flow drawn as an isometric house with garage, car and the Sigenergy
 * devices. Everything is vector graphics (own drawing, no images): PV on the roof, SigenStor and
 * gateway on the house wall, AC wallbox on the garage, DC charger in front of it, a balcony power
 * plant with SigenMicro on the garage roof, grid connection with a pole. Cables carry animated dashes in the direction of the energy flow.
 *
 * Signs as written by the adapter: plant.essPower > 0 charging, plant.gridActivePower > 0 import.
 */
interface EnergyHouseRxData extends SigRxData {
    oid_pv: string;
    oid_house: string;
    oid_bat: string;
    oid_soc: string;
    oid_grid: string;
    oid_ac_power: string;
    oid_ac_state: string;
    oid_dc_power: string;
    oid_dc_state: string;
    oid_micro: string;
    oid_temp: string;
    oid_status: string;
    sig_daynight: 'auto' | 'day' | 'night';
    sig_animation: boolean | string;
    sig_show_garage: boolean | string;
    sig_show_ac: boolean | string;
    sig_show_dc: boolean | string;
    sig_show_car: boolean | string;
    sig_show_micro: boolean | string;
}

interface EnergyHouseState extends SigState {
    coords: { lat: number; lon: number } | null;
    tick: number;
}

type P3 = [number, number, number];

/* ── isometric projection: x to the front right, y to the front left, z up ── */
const S = 19;
const OX = 360;
const OY = 240;
function iso(x: number, y: number, z: number): [number, number] {
    return [OX + (x - y) * 0.866 * S, OY + (x + y) * 0.5 * S - z * S];
}
function pts(a: P3[]): string {
    return a
        .map(p => {
            const [sx, sy] = iso(p[0], p[1], p[2]);
            return `${sx.toFixed(1)},${sy.toFixed(1)}`;
        })
        .join(' ');
}
const wallY = (Y: number, x0: number, x1: number, z0: number, z1: number): P3[] => [
    [x0, Y, z0],
    [x1, Y, z0],
    [x1, Y, z1],
    [x0, Y, z1],
];
const wallX = (X: number, y0: number, y1: number, z0: number, z1: number): P3[] => [
    [X, y0, z0],
    [X, y1, z0],
    [X, y1, z1],
    [X, y0, z1],
];
const topF = (x0: number, x1: number, y0: number, y1: number, z: number): P3[] => [
    [x0, y0, z],
    [x1, y0, z],
    [x1, y1, z],
    [x0, y1, z],
];
const roofPt = (x: number, t: number): P3 => [x, 7.5 - 4 * t, 4.7 + 3.3 * t];

interface Palette {
    sky1: string;
    sky2: string;
    ground: string;
    drive: string;
    wall: string;
    gable: string;
    roof: string;
    roofBack: string;
    fascia: string;
    pv: string;
    pvLine: string;
    win: string;
    winFrame: string;
    door: string;
    doorLine: string;
    devTop: string;
    devFront: string;
    devSide: string;
    carTop: string;
    carFront: string;
    carSide: string;
    carGlass: string;
    carTrim: string;
    cable: string;
    txt: string;
    sub: string;
    lead: string;
}
const DAY: Palette = {
    sky1: '#9cc5e8',
    sky2: '#dce9f2',
    ground: '#c7cfc4',
    drive: '#b9c2b6',
    wall: '#ebe6dc',
    gable: '#d9d2c5',
    roof: '#4a515c',
    roofBack: '#5a626e',
    fascia: '#3b414a',
    pv: '#28406a',
    pvLine: '#6f8fbf',
    win: '#9fb7cc',
    winFrame: '#f7f4ee',
    door: '#cfc8bb',
    doorLine: '#bdb5a7',
    devTop: '#f6f7f8',
    devFront: '#dde0e3',
    devSide: '#bfc4ca',
    carTop: '#4f86c6',
    carFront: '#3b6ea8',
    carSide: '#2f5d93',
    carGlass: '#1d2733',
    carTrim: '#1a1d22',
    cable: '#7b838d',
    txt: '#16202a',
    sub: '#45525f',
    lead: '#7d8994',
};
const NIGHT: Palette = {
    sky1: '#0e1218',
    sky2: '#232a33',
    ground: '#1a1e24',
    drive: '#20252c',
    wall: '#2b3038',
    gable: '#22272e',
    roof: '#16191e',
    roofBack: '#1f232a',
    fascia: '#0f1114',
    pv: '#22324b',
    pvLine: '#4d6a93',
    win: '#e6c98a',
    winFrame: '#14171b',
    door: '#262a31',
    doorLine: '#323840',
    devTop: '#eef0f2',
    devFront: '#cfd3d7',
    devSide: '#a9afb6',
    carTop: '#3a414b',
    carFront: '#2c323a',
    carSide: '#23282f',
    carGlass: '#0f141a',
    carTrim: '#0b0d10',
    cable: '#4d5560',
    txt: '#f1f4f7',
    sub: '#9aa6b3',
    lead: '#5d6875',
};
const COL = { pv: '#f4b63f', bat: '#2fd39a', load: '#6cc4ff', imp: '#ff8a5c', exp: '#2fd39a', ch: '#b48cff' };
/** status chips: the bright flow colours on the night sky, darker shades on the light day sky */
const CHIP_DAY = { bat: '#0f8a60', imp: '#c4501f', exp: '#0f8a60', ch: '#6a3fc8' };

/* AC charger states (acCharger.systemState) and DC charger states (dcCharger.runningState) */
const AC_STATES: Record<number, string> = {
    0: 'st_init',
    1: 'st_free',
    2: 'st_connected',
    3: 'st_connected',
    4: 'st_charging',
    5: 'st_charging',
    6: 'st_error',
    7: 'st_error',
};
const DC_STATES: Record<number, string> = {
    0: 'st_free',
    1: 'st_connected',
    2: 'st_preparing',
    3: 'st_charging',
    4: 'st_error',
    5: 'st_scheduled',
    6: 'st_ended',
    7: 'st_unavailable',
    8: 'st_discharging',
    9: 'st_warning',
    10: 'st_preparing',
};
const DC_STATE_INVALID = 0xffff;

/* Car: side profile (y, z), nose towards the viewer (+y), extruded across x */
const CAR_X0 = -3.9;
const CAR_X1 = -1.4;
/** the profile below is drawn in a 1:1 sketch scale and shrunk to the house here */
const CAR_SY = 0.78;
const CAR_SZ = 0.8;
const carP = (x: number, y: number, z: number): P3 => [x, 8.3 + (y - 8) * CAR_SY, z * CAR_SZ];
const CAR_PROFILE: [number, number][] = [
    [8.0, 0.55],
    [8.0, 1.45],
    [8.25, 1.62],
    [8.95, 1.7],
    [9.65, 2.55],
    [11.55, 2.66],
    [12.7, 1.78],
    [14.55, 1.52],
    [15.0, 1.22],
    [15.0, 0.55],
];
const CAR_WHEELS: [number, number][] = [
    [9.35, 0.66],
    [13.75, 0.66],
];
const WHEEL_R = 0.66;

/** Sun elevation in degrees (low-precision solar position, good to ~1°). */
export function sunElevation(date: Date, lat: number, lon: number): number {
    const rad = Math.PI / 180;
    const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
    const g = (357.529 + 0.98560028 * d) % 360;
    const q = (280.459 + 0.98564736 * d) % 360;
    const L = q + 1.915 * Math.sin(g * rad) + 0.02 * Math.sin(2 * g * rad);
    const e = 23.439 - 0.00000036 * d;
    const ra = Math.atan2(Math.cos(e * rad) * Math.sin(L * rad), Math.cos(L * rad)) / rad;
    const dec = Math.asin(Math.sin(e * rad) * Math.sin(L * rad)) / rad;
    const gmst = (((18.697374558 + 24.06570982441908 * d) % 24) + 24) % 24;
    const h = gmst * 15 + lon - ra;
    return (
        Math.asin(
            Math.sin(lat * rad) * Math.sin(dec * rad) + Math.cos(lat * rad) * Math.cos(dec * rad) * Math.cos(h * rad),
        ) / rad
    );
}

function flag(v: unknown, def: boolean): boolean {
    if (v === undefined || v === null || v === '') {
        return def;
    }
    return v === true || v === 'true' || v === 1 || v === '1';
}

export default class EnergyHouse extends SigWidget<EnergyHouseRxData, EnergyHouseState> {
    private timer: ReturnType<typeof setInterval> | null = null;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, coords: null, tick: 0 };
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplVis-2-widgets-sigenergyEnergyHouse',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'EnergyHouse',
            visWidgetLabel: 'w_energy_house',
            visAttrs: [
                {
                    name: 'oids',
                    label: 'group_oids',
                    fields: [
                        oidField('oid_pv', 'sigenergy.0.plant.pvPower'),
                        oidField('oid_house', 'sigenergy.0.statistics.housePower'),
                        oidField('oid_bat', 'sigenergy.0.plant.essPower'),
                        oidField('oid_soc', 'sigenergy.0.plant.essSoc'),
                        oidField('oid_grid', 'sigenergy.0.plant.gridActivePower'),
                        oidField('oid_ac_power', 'sigenergy.0.acCharger.chargingPower'),
                        oidField('oid_ac_state', 'sigenergy.0.acCharger.systemState'),
                        oidField('oid_dc_power', 'sigenergy.0.dcCharger.outputPower'),
                        oidField('oid_dc_state', 'sigenergy.0.dcCharger.runningState'),
                        oidField('oid_micro', 'sigenergy.0.sigenmicro.totalPower'),
                        { ...oidField('oid_temp'), tooltip: 'oid_temp_tooltip' },
                        { ...oidField('oid_status'), tooltip: 'oid_status_tooltip' },
                    ],
                },
                {
                    name: 'appearance',
                    label: 'group_appearance',
                    fields: [
                        {
                            name: 'sig_daynight',
                            type: 'select',
                            label: 'sig_daynight',
                            tooltip: 'sig_daynight_tooltip',
                            options: [
                                { value: 'auto', label: 'sig_daynight_auto' },
                                { value: 'day', label: 'sig_daynight_day' },
                                { value: 'night', label: 'sig_daynight_night' },
                            ],
                            default: 'auto',
                        },
                        { name: 'sig_animation', type: 'checkbox', label: 'sig_animation', default: true },
                        { name: 'sig_show_garage', type: 'checkbox', label: 'sig_show_garage', default: true },
                        { name: 'sig_show_car', type: 'checkbox', label: 'sig_show_car', default: true },
                        {
                            name: 'sig_show_micro',
                            type: 'checkbox',
                            label: 'sig_show_micro',
                            tooltip: 'sig_show_micro_tooltip',
                            default: true,
                        },
                        { name: 'sig_show_ac', type: 'checkbox', label: 'sig_show_ac', default: true },
                        { name: 'sig_show_dc', type: 'checkbox', label: 'sig_show_dc', default: true },
                    ],
                },
            ],
            visDefaultStyle: { width: 480, height: 390 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-energy-house.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return EnergyHouse.getWidgetInfo();
    }

    componentDidMount(): void {
        super.componentDidMount();
        void this.loadCoords();
        // day/night follows the sun: re-evaluate every five minutes
        this.timer = setInterval(() => this.setState(s => ({ tick: s.tick + 1 })), 300000);
    }

    componentWillUnmount(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        super.componentWillUnmount();
    }

    /** Latitude/longitude of the ioBroker system settings (for the day/night switch). */
    private async loadCoords(): Promise<void> {
        try {
            const obj = await this.props.context.socket.getObject('system.config');
            const c = obj?.common as { latitude?: number | string; longitude?: number | string } | undefined;
            const lat = parseFloat(String(c?.latitude ?? ''));
            const lon = parseFloat(String(c?.longitude ?? ''));
            if (!isNaN(lat) && !isNaN(lon)) {
                this.setState({ coords: { lat, lon } });
            }
        } catch {
            // no access to system.config: the clock decides
        }
    }

    private isDay(): boolean {
        const mode = this.state.rxData.sig_daynight || 'auto';
        if (mode === 'day') {
            return true;
        }
        if (mode === 'night') {
            return false;
        }
        const now = new Date();
        if (this.state.coords) {
            return sunElevation(now, this.state.coords.lat, this.state.coords.lon) > -4;
        }
        const h = now.getHours();
        return h >= 7 && h < 19;
    }

    private acLabel(power: number, state: StateVal): string {
        const n = toNum(state);
        if (n !== null && AC_STATES[n]) {
            return this.t(AC_STATES[n]);
        }
        return this.t(power > 0.05 ? 'st_charging' : 'st_ready');
    }

    private dcLabel(power: number, state: StateVal): string {
        const n = toNum(state);
        if (n !== null && n !== DC_STATE_INVALID && DC_STATES[n]) {
            return this.t(DC_STATES[n]);
        }
        // no or invalid running state (protocol < V2.8, or 0xFFFF): derived from the power
        return this.t(power > 0.05 ? 'st_charging' : power < -0.05 ? 'st_discharging' : 'st_ready');
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const rx = this.state.rxData;
        const day = this.isDay();
        const c = day ? DAY : NIGHT;
        const anim = flag(rx.sig_animation, true);
        const showGarage = flag(rx.sig_show_garage, true);
        const showCar = flag(rx.sig_show_car, true);
        const showAc = flag(rx.sig_show_ac, true);
        const showDc = flag(rx.sig_show_dc, true);
        // the balcony power plant stands on the garage roof
        const showMicro = showGarage && flag(rx.sig_show_micro, true);

        const pv = num0(this.v('oid_pv'));
        const house = num0(this.v('oid_house'));
        const bat = num0(this.v('oid_bat'));
        const socV = toNum(this.v('oid_soc'));
        const grid = num0(this.v('oid_grid'));
        const ac = num0(this.v('oid_ac_power'));
        const dc = num0(this.v('oid_dc_power'));
        const micro = num0(this.v('oid_micro'));
        const temp = this.oid('oid_temp') ? toNum(this.v('oid_temp')) : null;
        const statusRaw = this.oid('oid_status') ? this.v('oid_status') : undefined;
        const status = statusRaw === undefined || statusRaw === null ? '' : String(statusRaw);

        const els: React.JSX.Element[] = [];
        let k = 0;
        const poly = (a: P3[], fill: string, extra?: React.SVGProps<SVGPolygonElement>): void => {
            els.push(
                <polygon
                    key={k++}
                    points={pts(a)}
                    fill={fill}
                    {...extra}
                />,
            );
        };
        const pline = (a: P3[], stroke: string, width: number, extra?: React.SVGProps<SVGPolylineElement>): void => {
            els.push(
                <polyline
                    key={k++}
                    points={pts(a)}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={width}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    {...extra}
                />,
            );
        };
        const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): void => {
            poly(topF(x0, x1, y0, y1, z1), c.devTop);
            poly(wallY(y1, x0, x1, z0, z1), c.devFront);
            poly(wallX(x1, y0, y1, z0, z1), c.devSide);
        };
        /** cable with an animated flow on top (dash speed follows the power) */
        const flow = (segs: P3[][], active: boolean, reverse: boolean, color: string, kw: number): void => {
            const dur = Math.max(0.45, Math.min(2.2, 2.2 - Math.abs(kw) * 0.25));
            for (const seg of segs) {
                pline(seg, c.cable, 2.4);
                if (active) {
                    pline(seg, color, 2.8, {
                        className: anim ? `sig-eh-flow${reverse ? ' rev' : ''}` : undefined,
                        strokeDasharray: anim ? '2 8' : undefined,
                        style: anim ? { animationDuration: `${dur.toFixed(2)}s` } : undefined,
                    });
                }
            }
        };

        /* ── sky ornaments ── */
        if (day) {
            els.push(
                <g key={k++}>
                    <circle
                        cx="588"
                        cy="40"
                        r="28"
                        fill="#ffd166"
                        opacity=".18"
                    />
                    <circle
                        cx="588"
                        cy="40"
                        r="18"
                        fill="#ffd166"
                    />
                </g>,
            );
        } else {
            [
                [60, 140],
                [110, 30],
                [200, 120],
                [560, 90],
                [610, 160],
                [470, 20],
                [300, 12],
                [520, 130],
                [30, 230],
            ].forEach(([x, y], i) =>
                els.push(
                    <circle
                        key={k++}
                        cx={x}
                        cy={y}
                        r={i % 3 ? 0.9 : 1.4}
                        fill="#cfd8e3"
                        opacity=".55"
                    />,
                ),
            );
            els.push(
                <g key={k++}>
                    <circle
                        cx="590"
                        cy="38"
                        r="13"
                        fill="#e7e2cf"
                    />
                    <circle
                        cx="596"
                        cy="33"
                        r="12"
                        fill={c.sky1}
                    />
                </g>,
            );
        }

        /* ── ground, driveway ── */
        poly(topF(-9, 18, -3, 16, 0), c.ground);
        if (showGarage || showCar) {
            poly(topF(-6.5, 1.2, 7, 15.8, 0.005), c.drive);
        }

        /* ── garage ── */
        if (showGarage) {
            poly(topF(-6, 0, 0, 7, 3.5), c.roofBack);
            poly(wallY(7, -6, 0, 0, 3.5), c.wall);
            poly(wallY(7.01, -4.9, -0.7, 0, 2.9), c.door);
            for (let z = 0.48; z < 2.9; z += 0.48) {
                pline(
                    [
                        [-4.9, 7.02, z],
                        [-0.7, 7.02, z],
                    ],
                    c.doorLine,
                    1,
                );
            }
            poly(topF(-6.15, 0, 7, 7.2, 3.55), c.fascia);
        }

        /* ── balcony power plant (SigenMicro) on the garage roof: two tilted modules ── */
        if (showMicro) {
            for (const [a, b] of [
                [-5.6, -3.7],
                [-3.5, -1.6],
            ]) {
                // mounting frame
                pline(
                    [
                        [a + 0.2, 4.7, 3.5],
                        [a + 0.2, 4.7, 4.35],
                    ],
                    c.fascia,
                    1.6,
                );
                pline(
                    [
                        [b - 0.2, 4.7, 3.5],
                        [b - 0.2, 4.7, 4.35],
                    ],
                    c.fascia,
                    1.6,
                );
                const m: P3[] = [
                    [a, 6.3, 3.62],
                    [b, 6.3, 3.62],
                    [b, 4.6, 4.42],
                    [a, 4.6, 4.42],
                ];
                poly(m, c.pv, { stroke: c.pvLine, strokeWidth: 0.8 });
                for (let i = 1; i < 3; i++) {
                    const xx = a + ((b - a) * i) / 3;
                    pline(
                        [
                            [xx, 6.3, 3.62],
                            [xx, 4.6, 4.42],
                        ],
                        c.pvLine,
                        0.6,
                    );
                }
                pline(
                    [
                        [a, 5.45, 4.02],
                        [b, 5.45, 4.02],
                    ],
                    c.pvLine,
                    0.6,
                );
            }
            // micro-inverter under the modules
            box(-2.6, -2.0, 5.6, 6.0, 3.5, 3.75);
        }

        /* ── house ── */
        poly(
            [
                [-0.3, -0.5, 4.7],
                [10.3, -0.5, 4.7],
                [10.3, 3.5, 8],
                [-0.3, 3.5, 8],
            ],
            c.roofBack,
        );
        poly(wallY(7, 0, 10, 0, 5), c.wall);
        poly(
            [
                [10, 0, 0],
                [10, 7, 0],
                [10, 7, 5],
                [10, 3.5, 8],
                [10, 0, 5],
            ],
            c.gable,
        );
        for (const [a, b] of [
            [6.2, 7.6],
            [8.2, 9.6],
        ]) {
            poly(wallY(7.01, a, b, 1.2, 3.4), c.win);
            pline(
                [
                    [(a + b) / 2, 7.02, 1.2],
                    [(a + b) / 2, 7.02, 3.4],
                ],
                c.winFrame,
                1.6,
            );
            pline(
                [
                    [a, 7.02, 2.3],
                    [b, 7.02, 2.3],
                ],
                c.winFrame,
                1.6,
            );
        }
        poly(wallX(10.01, 2.4, 4.6, 1.3, 3.6), c.win);
        pline(
            [
                [10.02, 3.5, 1.3],
                [10.02, 3.5, 3.6],
            ],
            c.winFrame,
            1.6,
        );
        poly(wallX(10.01, 3.0, 4.0, 5.3, 6.4), c.win);

        /* ── roof with PV ── */
        poly(
            [
                [-0.3, 7.5, 4.7],
                [10.3, 7.5, 4.7],
                [10.3, 3.5, 8],
                [-0.3, 3.5, 8],
            ],
            c.roof,
        );
        for (let col = 0; col < 4; col++) {
            const x0 = 0.7 + col * 2.25;
            const x1 = x0 + 2.05;
            for (const [t0, t1] of [
                [0.1, 0.46],
                [0.52, 0.88],
            ]) {
                poly([roofPt(x0, t0), roofPt(x1, t0), roofPt(x1, t1), roofPt(x0, t1)], c.pv);
                for (let i = 1; i < 3; i++) {
                    const xx = x0 + ((x1 - x0) * i) / 3;
                    pline([roofPt(xx, t0), roofPt(xx, t1)], c.pvLine, 0.7);
                }
                pline([roofPt(x0, (t0 + t1) / 2), roofPt(x1, (t0 + t1) / 2)], c.pvLine, 0.7);
            }
        }
        poly(
            [
                [10.3, 7.5, 4.7],
                [10.3, 3.5, 8],
                [10.3, -0.5, 4.7],
                [10.3, -0.5, 4.45],
                [10.3, 3.5, 7.72],
                [10.3, 7.5, 4.45],
            ],
            c.fascia,
        );
        poly(
            [
                [-0.3, 7.5, 4.7],
                [10.3, 7.5, 4.7],
                [10.3, 7.5, 4.45],
                [-0.3, 7.5, 4.45],
            ],
            c.fascia,
        );

        /* ── cables ── */
        // wallbox: on the garage, without garage on the house wall left of the battery
        const wb: [number, number, number] = showGarage ? [-5.6, -5.1, 7] : [0.15, 0.65, 7];
        flow(
            [
                [
                    [4.25, 7.06, 4.7],
                    [4.25, 7.06, 2.6],
                ],
            ],
            pv > 0.05,
            false,
            COL.pv,
            pv,
        );
        flow(
            [
                [
                    [2.4, 7.06, 1.9],
                    [3.7, 7.06, 1.9],
                ],
            ],
            Math.abs(bat) > 0.05,
            bat > 0,
            COL.bat,
            bat,
        );
        flow(
            [
                [
                    [4.8, 7.06, 2.0],
                    [6.05, 7.06, 2.0],
                ],
            ],
            house > 0.05,
            false,
            COL.load,
            house,
        );
        flow(
            [
                [
                    [4.25, 7.06, 1.4],
                    [4.25, 7.06, 0.7],
                    [10, 7.06, 0.7],
                    [10.05, 7, 0.7],
                    [10.05, 5.5, 0.7],
                    [10.2, 5.5, 0.7],
                    [10.2, 5.5, 0],
                    [14, 5.5, 0],
                    [14, 5.5, 5.2],
                ],
            ],
            Math.abs(grid) > 0.05,
            grid > 0,
            grid > 0 ? COL.imp : COL.exp,
            grid,
        );
        if (showAc) {
            const xw = (wb[0] + wb[1]) / 2;
            flow(
                [
                    [
                        [3.7, 7.06, 2.2],
                        [3.4, 7.06, 2.2],
                        [3.4, 7.06, 3.0],
                        [xw, 7.06, 3.0],
                        [xw, 7.06, 1.95],
                    ],
                ],
                ac > 0.05,
                false,
                COL.ch,
                ac,
            );
        }
        if (showMicro) {
            flow(
                [
                    [
                        [-2.0, 5.8, 3.62],
                        [-0.2, 6.9, 3.62],
                        [0.4, 7.06, 3.3],
                        [3.55, 7.06, 3.3],
                        [3.55, 7.06, 2.6],
                    ],
                ],
                micro > 0.005,
                false,
                COL.pv,
                micro,
            );
        }
        if (showDc) {
            flow(
                [
                    [
                        [1.2, 7.62, 0.06],
                        [0.3, 8.4, 0.06],
                        [0.3, 8.6, 0.3],
                    ],
                ],
                Math.abs(dc) > 0.05,
                dc < 0,
                COL.ch,
                dc,
            );
        }

        /* ── devices: SigenStor, gateway, meter, wallbox ── */
        box(1.0, 2.4, 7, 7.6, 0, 2.4);
        const led = iso(2.15, 7.6, 1.9);
        els.push(
            <circle
                key={k++}
                cx={led[0]}
                cy={led[1]}
                r="2.2"
                fill={Math.abs(bat) > 0.05 ? COL.bat : '#8a949f'}
            />,
        );
        box(3.7, 4.8, 7, 7.3, 1.4, 2.6);
        box(10, 10.25, 4.8, 6.2, 0.8, 2.2);
        if (showAc) {
            box(wb[0], wb[1], wb[2], wb[2] + 0.25, 1.2, 1.95);
        }

        /* ── car ── */
        if (showCar) {
            this.drawCar(els, () => k++, c, day);
            k += 200;
        }
        /* ── DC charger + charging cable to the car ── */
        if (showDc) {
            box(0.0, 0.6, 8.4, 8.8, 0, 1.7);
            if (showCar) {
                flow(
                    [[[0.0, 8.6, 1.15], [-0.6, 8.75, 0.9], carP(CAR_X1 + 0.02, 8.6, 1.35)]],
                    Math.abs(dc) > 0.05,
                    dc < 0,
                    COL.ch,
                    dc,
                );
            }
        }

        /* ── grid pole ── */
        pline(
            [
                [14, 5.5, 0],
                [14, 5.5, 5.7],
            ],
            '#6b5a48',
            5,
        );
        pline(
            [
                [14, 4.7, 5.3],
                [14, 6.3, 5.3],
            ],
            '#6b5a48',
            3,
        );

        /* ── header: weather + status ── */
        if (temp !== null) {
            els.push(
                <g key={k++}>
                    <circle
                        cx="34"
                        cy="38"
                        r="9"
                        fill={day ? '#ffd166' : '#e7e2cf'}
                    />
                    <text
                        x="52"
                        y="44"
                        fontSize="15"
                        fontWeight="600"
                        fill={c.txt}
                    >
                        {`${temp.toFixed(1)} °C`}
                    </text>
                </g>,
            );
        }
        if (status) {
            els.push(
                <text
                    key={k++}
                    x="320"
                    y="24"
                    fontSize="12"
                    textAnchor="middle"
                    fill={c.sub}
                >
                    {status}
                </text>,
            );
        }

        /* ── callouts ── */
        const kw = (v: number): string => `${Math.abs(v).toFixed(2)} kW`;
        const chip = (
            x: number,
            y: number,
            text: string,
            color: string,
            anchor: 'start' | 'end',
        ): React.JSX.Element => {
            const w = text.length * 6.6 + 14;
            const x0 = anchor === 'end' ? x - w : x;
            return (
                <g key={`chip${k++}`}>
                    <rect
                        x={x0}
                        y={y - 13}
                        width={w}
                        height="19"
                        rx="5"
                        fill={color}
                        fillOpacity=".18"
                    />
                    <text
                        x={x0 + 7}
                        y={y + 1}
                        fontSize="12"
                        fontWeight="600"
                        fill={color}
                    >
                        {text}
                    </text>
                </g>
            );
        };
        const callout = (
            a: [number, number],
            side: 'top' | 'bottom',
            value: string,
            label: string,
            chipTxt?: string,
            chipCol?: string,
            anchor: 'start' | 'end' = 'start',
        ): void => {
            const tx = anchor === 'end' ? a[0] - 6 : a[0] + 6;
            const top = side === 'top';
            els.push(
                <g key={k++}>
                    <line
                        x1={a[0]}
                        y1={top ? (chipTxt ? 112 : 92) : a[1]}
                        x2={a[0]}
                        y2={top ? a[1] : chipTxt ? 498 : 478}
                        stroke={c.lead}
                        strokeWidth="1"
                    />
                    <text
                        x={tx}
                        y={top ? 64 : 452}
                        textAnchor={anchor}
                        fontSize="17"
                        fontWeight="600"
                        fill={c.txt}
                    >
                        {value}
                    </text>
                    <text
                        x={tx}
                        y={top ? 82 : 470}
                        textAnchor={anchor}
                        fontSize="12"
                        fill={c.sub}
                    >
                        {label}
                    </text>
                    {chipTxt ? chip(tx, top ? 102 : 490, chipTxt, chipCol || c.sub, anchor) : null}
                </g>,
            );
        };
        const up = (p: [number, number], dy: number): [number, number] => [p[0], p[1] + dy];
        /** callout left of its anchor with a horizontal leader (text right-aligned) */
        const calloutLeft = (
            a: [number, number],
            value: string,
            label: string,
            chipTxt: string,
            chipCol: string,
        ): void => {
            const tx = a[0] - 20;
            els.push(
                <g key={k++}>
                    <line
                        x1={tx + 5}
                        y1={a[1]}
                        x2={a[0] - 3}
                        y2={a[1]}
                        stroke={c.lead}
                        strokeWidth="1"
                    />
                    <text
                        x={tx}
                        y={a[1] - 10}
                        textAnchor="end"
                        fontSize="17"
                        fontWeight="600"
                        fill={c.txt}
                    >
                        {value}
                    </text>
                    <text
                        x={tx}
                        y={a[1] + 8}
                        textAnchor="end"
                        fontSize="12"
                        fill={c.sub}
                    >
                        {label}
                    </text>
                    {chip(tx, a[1] + 29, chipTxt, chipCol, 'end')}
                </g>,
            );
        };

        const CH = day ? CHIP_DAY : COL;
        if (showAc) {
            const acTxt = this.acLabel(ac, this.v('oid_ac_state'));
            const anchor = iso(wb[0], 7.1, 1.6);
            if (showGarage) {
                calloutLeft(anchor, kw(ac), this.t('title_ac_charger'), acTxt, CH.ch);
            } else {
                callout(
                    up(iso((wb[0] + wb[1]) / 2, 7.1, 1.95), -6),
                    'top',
                    kw(ac),
                    this.t('title_ac_charger'),
                    acTxt,
                    CH.ch,
                );
            }
        }
        if (showMicro) {
            callout(up(iso(-3.6, 5.4, 4.1), -6), 'top', kw(micro), 'SigenMicro');
        }
        callout(up(iso(5, 5.5, 6.35), -6), 'top', kw(pv), this.t('solar_pv'));
        callout(up(iso(10, 3.5, 3.0), -40), 'top', kw(house), this.t('house'));
        if (showDc) {
            callout(
                up(iso(0.3, 8.6, 0), 4),
                'bottom',
                kw(dc),
                this.t('title_dc_charger'),
                this.dcLabel(dc, this.v('oid_dc_state')),
                Math.abs(dc) > 0.05 ? CH.ch : c.sub,
                'end',
            );
        }
        callout(
            up(iso(1.7, 7.6, 0.5), 6),
            'bottom',
            socV === null ? kw(bat) : `${kw(bat)} · ${Math.round(socV)} %`,
            this.t('battery'),
            this.t(bat > 0.05 ? 'charging' : bat < -0.05 ? 'discharging' : 'st_ready'),
            CH.bat,
        );
        callout(
            up(iso(10.25, 5.5, 0.8), 6),
            'bottom',
            kw(grid),
            this.t('grid'),
            Math.abs(grid) > 0.05 ? this.t(grid > 0 ? 'eh_import' : 'eh_export') : undefined,
            grid > 0 ? CH.imp : CH.exp,
        );

        return (
            <div
                className="sig-w sig-eh"
                style={{ background: `linear-gradient(180deg, ${c.sky1} 0%, ${c.sky2} 100%)` }}
            >
                <svg
                    viewBox="0 0 640 520"
                    preserveAspectRatio="xMidYMid meet"
                    width="100%"
                    height="100%"
                    style={{ display: 'block' }}
                >
                    {els}
                </svg>
            </div>
        );
    }

    /**
     * The car: a side profile extruded across its width. Strips facing the viewer are drawn in
     * order, then the side with windows, wheel arches and wheels (true projected circles).
     */
    // eslint-disable-next-line class-methods-use-this
    private drawCar(els: React.JSX.Element[], key: () => number, c: Palette, day: boolean): void {
        const x0 = CAR_X0;
        const x1 = CAR_X1;
        const cpts = (a: P3[]): string => pts(a.map(p => carP(p[0], p[1], p[2])));
        const add = (a: P3[], fill: string, extra?: React.SVGProps<SVGPolygonElement>): void => {
            els.push(
                <polygon
                    key={`car${key()}`}
                    points={cpts(a)}
                    fill={fill}
                    {...extra}
                />,
            );
        };
        // shadow on the ground
        const sh: P3[] = [];
        for (let i = 0; i < 24; i++) {
            const a = (i / 24) * Math.PI * 2;
            sh.push([(x0 + x1) / 2 + Math.cos(a) * 2.0, 11.5 + Math.sin(a) * 4.0, 0.01]);
        }
        add(sh, '#000', { opacity: day ? 0.18 : 0.35 });

        const prof = CAR_PROFILE;
        const glassSegs = new Set([3, 5]); // rear window, windshield
        for (let i = 0; i < prof.length - 1; i++) {
            const [ya, za] = prof[i];
            const [yb, zb] = prof[i + 1];
            const ny = -(zb - za);
            const nz = yb - ya;
            if (ny + nz * 1.2 <= 0) {
                continue; // faces away from the viewer
            }
            const fill = glassSegs.has(i) ? c.carGlass : nz > Math.abs(ny) ? c.carTop : c.carFront;
            add(
                [
                    [x0, ya, za],
                    [x1, ya, za],
                    [x1, yb, zb],
                    [x0, yb, zb],
                ],
                fill,
            );
        }
        // headlights on the nose, number plate
        add(
            [
                [x0 + 0.25, 15.01, 0.98],
                [x0 + 0.95, 15.01, 0.98],
                [x0 + 0.95, 15.01, 1.15],
                [x0 + 0.25, 15.01, 1.15],
            ],
            day ? '#e9eef3' : '#fff4c8',
        );
        add(
            [
                [x1 - 0.95, 15.01, 0.98],
                [x1 - 0.25, 15.01, 0.98],
                [x1 - 0.25, 15.01, 1.15],
                [x1 - 0.95, 15.01, 1.15],
            ],
            day ? '#e9eef3' : '#fff4c8',
        );
        add(
            [
                [(x0 + x1) / 2 - 0.55, 15.01, 0.6],
                [(x0 + x1) / 2 + 0.55, 15.01, 0.6],
                [(x0 + x1) / 2 + 0.55, 15.01, 0.85],
                [(x0 + x1) / 2 - 0.55, 15.01, 0.85],
            ],
            '#f2f2f2',
        );
        // side
        add(
            prof.map(([y, z]) => [x1, y, z] as P3),
            c.carSide,
        );
        // side windows with B-pillar
        add(
            [
                [x1 + 0.01, 9.15, 1.78],
                [x1 + 0.01, 9.75, 2.46],
                [x1 + 0.01, 11.45, 2.55],
                [x1 + 0.01, 12.45, 1.83],
            ],
            c.carGlass,
        );
        els.push(
            <polyline
                key={`car${key()}`}
                points={cpts([
                    [x1 + 0.02, 10.75, 1.8],
                    [x1 + 0.02, 10.75, 2.53],
                ])}
                stroke={c.carSide}
                strokeWidth="2.4"
                fill="none"
            />,
        );
        // belt line + door gap
        els.push(
            <polyline
                key={`car${key()}`}
                points={cpts([
                    [x1 + 0.02, 8.1, 1.42],
                    [x1 + 0.02, 14.6, 1.38],
                ])}
                stroke={c.carTop}
                strokeWidth="1"
                opacity=".7"
                fill="none"
            />,
        );
        els.push(
            <polyline
                key={`car${key()}`}
                points={cpts([
                    [x1 + 0.02, 10.75, 0.6],
                    [x1 + 0.02, 10.75, 1.78],
                ])}
                stroke={c.carTrim}
                strokeWidth="0.8"
                opacity=".6"
                fill="none"
            />,
        );
        // mirror
        add(
            [
                [x1, 12.3, 1.85],
                [x1 + 0.35, 12.25, 1.88],
                [x1 + 0.35, 12.0, 2.05],
                [x1, 12.05, 2.05],
            ],
            c.carFront,
        );
        // wheels: arch, tyre, rim, hub
        const circle = (yc: number, zc: number, r: number, xs: number): P3[] => {
            const out: P3[] = [];
            for (let i = 0; i < 28; i++) {
                const a = (i / 28) * Math.PI * 2;
                out.push([xs, yc + Math.cos(a) * r, zc + Math.sin(a) * r]);
            }
            return out;
        };
        for (const [yc, zc] of CAR_WHEELS) {
            add(circle(yc, zc, WHEEL_R * 1.16, x1 + 0.01), c.carTrim, { opacity: 0.85 });
            add(circle(yc, zc, WHEEL_R, x1 + 0.03), '#121417');
            add(circle(yc, zc, WHEEL_R * 0.62, x1 + 0.05), day ? '#aeb5bd' : '#7d858e');
            add(circle(yc, zc, WHEEL_R * 0.18, x1 + 0.06), '#3a3f46');
        }
    }
}
