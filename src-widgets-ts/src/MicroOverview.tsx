import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps } from '@iobroker/types-vis-2';

import SigWidget, { appearanceFields, SET_COLOR, SET_ICON, VIS_SET, type SigRxData, type SigState } from './SigWidget';
import Scaled from './Scaled';
import { toBool, toNum, type StateVal } from './common';
import { microDeviceField, takeAllField } from './MicroDeviceSelect';

/*
 * Data source: ioBroker.sigenergy >= 3.5.0 reads the SigenMicro micro-inverters from the
 * Sigenergy cloud and creates one device per micro-inverter, named after its serial number:
 *
 *   <ns>.sigenmicro.<serial>.online | activePower | pvPower | pv<n>.voltage|current|power |
 *   gridVoltage | gridCurrent | gridFrequency | powerFactor | temperature |
 *   insulationResistance | dailyYield | totalYield | serialNumber | firmware | ratedPower |
 *   lastUpdate
 *   <ns>.sigenmicro.totalPower · <ns>.info.cloudConnection
 *
 * The editor offers the SigenMicro devices of the sigenergy instances (micro_device1 … 20 =
 * device ID); the widget derives all states and the adapter namespace from it. Widgets from
 * before 2.0.0 stored ANY state of the device in oid_micro1 … 20 — still understood.
 */
interface MicroRxData extends SigRxData {
    micro_count: number | string;
    [attr: string]: any;
}

interface MicroState extends SigState {
    tab: number;
    /** names of the device objects (adapter: "SigenMicro <name>"), keyed by device prefix */
    devNames: Record<string, string>;
}

interface Device {
    prefix: string;
    ns: string;
    serial: string;
    name: string;
}

interface Status {
    key: 'producing' | 'online' | 'offline' | 'nodata';
    cls: string;
    badge: string;
    col: string;
    active: boolean;
}

const STATES: { name: string; desc: string; unit: string; col: string }[] = [
    { name: 'activePower', desc: 'sm_active_power', unit: 'kW', col: 'power' },
    { name: 'pvPower', desc: 'sm_pv_power', unit: 'kW', col: 'pv' },
    { name: 'reactivePower', desc: 'sm_reactive_power', unit: 'kvar', col: '' },
    { name: 'gridVoltage', desc: 'sm_grid_voltage', unit: 'V', col: '' },
    { name: 'gridCurrent', desc: 'sm_grid_current', unit: 'A', col: '' },
    { name: 'gridFrequency', desc: 'sm_grid_frequency', unit: 'Hz', col: 'blue' },
    { name: 'powerFactor', desc: 'power_factor', unit: '', col: '' },
    { name: 'temperature', desc: 'sm_temperature', unit: '°C', col: 'temp' },
    { name: 'insulationResistance', desc: 'sm_insulation', unit: 'MΩ', col: '' },
    { name: 'dailyYield', desc: 'sm_yield_today', unit: 'kWh', col: 'energy' },
    { name: 'totalYield', desc: 'sm_yield_total', unit: 'kWh', col: 'blue' },
];
const INFO_STATES = ['online', 'serialNumber', 'firmware', 'ratedPower', 'lastUpdate'];
const PV_MAX = 4;
const PV_STATES = [
    { name: 'voltage', desc: 'sm_pv_voltage', unit: 'V', col: '' },
    { name: 'current', desc: 'sm_pv_current', unit: 'A', col: '' },
    { name: 'power', desc: 'sm_pv_input_power', unit: 'kW', col: 'pv' },
];
const LAYOUTS = [
    { max: 5, rows: 1, imgW: 80, imgH: 90 },
    { max: 10, rows: 1, imgW: 52, imgH: 60 },
    { max: 15, rows: 2, imgW: 46, imgH: 52 },
    { max: 20, rows: 2, imgW: 40, imgH: 46 },
];
const IMG = 'widgets/vis-2-widgets-sigenergy/img/SigenMicroInverter.png';

/** "sigenergy.0.sigenmicro.SN1.pv1.power" → prefix "sigenergy.0.sigenmicro.SN1", ns "sigenergy.0" */
export function parseAnchor(oid: string): { prefix: string; ns: string; serial: string } {
    const parts = String(oid).split('.');
    const idx = parts.indexOf('sigenmicro');
    if (idx >= 0 && parts.length > idx + 2) {
        return { prefix: parts.slice(0, idx + 2).join('.'), ns: parts.slice(0, idx).join('.'), serial: parts[idx + 1] };
    }
    parts.pop();
    return { prefix: parts.join('.'), ns: parts.slice(0, 2).join('.'), serial: parts[parts.length - 1] || '' };
}

function fmtVal(unit: string, raw: StateVal): string {
    const n = toNum(raw);
    if (n === null) {
        return '--';
    }
    if (unit === 'kW' || unit === 'kvar') {
        return n.toFixed(3);
    }
    if (unit === 'kWh' || unit === 'A' || unit === 'Hz' || unit === '') {
        return n.toFixed(2);
    }
    return n.toFixed(1);
}

function fmtTime(ts: StateVal): string {
    const n = toNum(ts);
    if (n === null || n <= 0) {
        return '--';
    }
    const dt = new Date(n);
    const pad = (x: number): string => String(x).padStart(2, '0');
    const t = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    return dt.toDateString() === new Date().toDateString()
        ? t
        : `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${t}`;
}

function valCol(col: string, raw: StateVal, dark: boolean): string {
    const tc = dark ? '#d8e4f0' : '#2c3e50';
    if (col === 'power') {
        return '#2ecc8a';
    }
    if (col === 'pv') {
        return '#f39c12';
    }
    if (col === 'energy') {
        return '#e8a22a';
    }
    if (col === 'blue') {
        return '#4a9eed';
    }
    if (col === 'temp') {
        const t = toNum(raw) ?? 0;
        return t > 70 ? '#e05555' : t > 50 ? '#e8a22a' : tc;
    }
    return tc;
}

export default class MicroOverview extends SigWidget<MicroRxData, MicroState> {
    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, tab: 0, devNames: {} };
    }

    static getWidgetInfo(): RxWidgetInfo {
        const t = (key: string): string => MicroOverview.t(key);
        return {
            id: 'tplVis-2-widgets-sigenergyMicroOverview',
            visSet: VIS_SET,
            visSetLabel: 'set_label',
            visSetColor: SET_COLOR,
            visSetIcon: SET_ICON,
            visName: 'MicroOverview',
            visWidgetLabel: 'w_micro_overview',
            visAttrs: [
                {
                    name: 'settings',
                    label: 'group_settings',
                    fields: [
                        {
                            name: 'micro_count',
                            type: 'slider',
                            label: 'micro_count',
                            min: 1,
                            max: 20,
                            step: 1,
                            default: 3,
                        },
                        takeAllField(t),
                        ...appearanceFields(),
                    ],
                },
                {
                    name: 'micro',
                    label: 'group_micro',
                    indexFrom: 1,
                    indexTo: 'micro_count',
                    fields: [microDeviceField(t), { name: 'micro_name', type: 'text', label: 'micro_name' }],
                },
            ],
            visDefaultStyle: { width: 420, height: 420 },
            visPrev: 'widgets/vis-2-widgets-sigenergy/img/prev-micro-overview.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MicroOverview.getWidgetInfo();
    }

    private devices(): Device[] {
        const rx = this.state.rxData;
        const count = Math.min(Math.max(1, parseInt(String(rx.micro_count), 10) || 3), 20);
        const list: Device[] = [];
        const str = (k: string): string => (typeof rx[k] === 'string' ? rx[k].trim() : '');
        for (let i = 1; i <= count; i++) {
            // micro_device<N> = device ID chosen in the editor; oid_micro<N> = any state of the device (before 2.0.0)
            const device = str(`micro_device${i}`);
            const anchor = str(`oid_micro${i}`);
            if (!device && !anchor) {
                continue;
            }
            const a = device ? parseAnchor(`${device}.online`) : parseAnchor(anchor);
            list.push({ ...a, name: str(`micro_name${i}`) });
        }
        return list;
    }

    protected extraIds(): string[] {
        const ids: string[] = [];
        const ns = new Set<string>();
        for (const d of this.devices()) {
            STATES.forEach(s => ids.push(`${d.prefix}.${s.name}`));
            INFO_STATES.forEach(n => ids.push(`${d.prefix}.${n}`));
            for (let n = 1; n <= PV_MAX; n++) {
                PV_STATES.forEach(s => ids.push(`${d.prefix}.pv${n}.${s.name}`));
            }
            ns.add(d.ns);
        }
        ns.forEach(n => ids.push(`${n}.sigenmicro.totalPower`, `${n}.info.cloudConnection`));
        return ids;
    }

    private name(d: Device, nr: number): string {
        return d.name || this.state.devNames[d.prefix] || d.serial || `Micro ${String(nr).padStart(2, '0')}`;
    }

    componentDidMount(): void {
        super.componentDidMount();
        void this.loadDeviceNames();
    }

    onRxDataChanged(prevRxData: typeof this.state.rxData): void {
        super.onRxDataChanged(prevRxData);
        void this.loadDeviceNames();
    }

    /** Reads the device objects once: the adapter names them "SigenMicro <name>" or "SigenMicro <serial>". */
    private async loadDeviceNames(): Promise<void> {
        const names: Record<string, string> = {};
        for (const d of this.devices()) {
            if (d.prefix in this.state.devNames) {
                names[d.prefix] = this.state.devNames[d.prefix];
                continue;
            }
            try {
                const obj = await this.props.context.socket.getObject(d.prefix);
                const n = obj?.common?.name;
                const txt = typeof n === 'string' ? n : n ? n.en || Object.values(n)[0] || '' : '';
                names[d.prefix] = txt.replace(/^SigenMicro\s+/, '');
            } catch {
                names[d.prefix] = '';
            }
        }
        this.setState({ devNames: names });
    }

    private status(d: Device): Status {
        const onRaw = this.ev(`${d.prefix}.online`);
        const online = onRaw === undefined || onRaw === null || onRaw === '' ? null : toBool(onRaw);
        const pwr = toNum(this.ev(`${d.prefix}.activePower`));
        if (online === true && pwr !== null && pwr > 0.0005) {
            return { key: 'producing', cls: 'run', badge: 'sig-sm-badge-run', col: '#2ecc8a', active: true };
        }
        if (online === true) {
            return { key: 'online', cls: 'on', badge: 'sig-sm-badge-on', col: '#4a9eed', active: false };
        }
        return {
            key: online === false ? 'offline' : 'nodata',
            cls: 'idle',
            badge: 'sig-sm-badge-idle',
            col: '#5a7a90',
            active: false,
        };
    }

    private statusLabel(s: Status): string {
        return this.t(`sm_${s.key}`);
    }

    private cloudBanner(d: Device | undefined): React.JSX.Element | null {
        if (!d) {
            return null;
        }
        const raw = this.ev(`${d.ns}.info.cloudConnection`);
        if (raw === undefined || raw === null || raw === '' || toBool(raw)) {
            return null;
        }
        return <div className="sig-sm-cloud-warn">⚠ {this.t('sm_cloud_lost')}</div>;
    }

    // eslint-disable-next-line class-methods-use-this
    private busRow(
        stats: Status[],
        startNr: number,
        imgW: number,
        imgH: number,
        rowIdx: number,
    ): React.JSX.Element | null {
        const VW = 620;
        const n = stats.length;
        if (!n) {
            return null;
        }
        const spc = VW / n;
        const imgTop = 6;
        const imgBot = imgTop + imgH;
        const busY = imgBot + Math.max(14, Math.round(imgH * 0.28));
        const anyActive = stats.some(s => s.active);
        return (
            <svg
                key={rowIdx}
                viewBox={`0 0 ${VW} ${busY + 12}`}
                xmlns="http://www.w3.org/2000/svg"
                className="sig-sm-net-svg"
            >
                <line
                    x1="18"
                    y1={busY}
                    x2={VW - 18}
                    y2={busY}
                    className="sig-sm-bus-base"
                />
                {anyActive ? (
                    <>
                        <line
                            x1="18"
                            y1={busY}
                            x2={VW - 18}
                            y2={busY}
                            className="sig-sm-bus-glow"
                        />
                        <line
                            x1="18"
                            y1={busY}
                            x2={VW - 18}
                            y2={busY}
                            className="sig-sm-bus-anim"
                            style={{ animationDelay: `${rowIdx * 0.35}s` }}
                        />
                    </>
                ) : null}
                {stats.map((si, j) => {
                    const x = Math.round(spc * j + spc / 2);
                    const dim = si.key === 'offline' || si.key === 'nodata';
                    return (
                        <g key={j}>
                            <line
                                x1={x}
                                y1={busY}
                                x2={x}
                                y2={imgBot}
                                className="sig-sm-stub-base"
                                stroke={si.active ? '#1e3f28' : '#1e2d3a'}
                            />
                            {si.active ? (
                                <>
                                    <line
                                        x1={x}
                                        y1={busY}
                                        x2={x}
                                        y2={imgBot}
                                        className="sig-sm-stub-glow"
                                    />
                                    <line
                                        x1={x}
                                        y1={busY}
                                        x2={x}
                                        y2={imgBot}
                                        className="sig-sm-stub-anim"
                                        style={{ animationDelay: `${(j + rowIdx * n) * 0.18}s` }}
                                    />
                                </>
                            ) : null}
                            <circle
                                cx={x}
                                cy={busY}
                                r={Math.max(3.5, imgW * 0.06)}
                                fill={si.active ? '#2ecc8a' : '#1e2d3a'}
                                stroke={si.col}
                                strokeWidth="1.5"
                                opacity={dim ? 0.5 : 1}
                            />
                            <foreignObject
                                x={x - imgW / 2}
                                y={imgTop}
                                width={imgW}
                                height={imgH}
                            >
                                <div
                                    style={{
                                        width: imgW,
                                        height: imgH,
                                        borderRadius: Math.max(4, imgW * 0.1),
                                        overflow: 'hidden',
                                        border: `2px solid ${si.col}`,
                                        opacity: dim ? 0.55 : 1,
                                        filter: si.active ? 'drop-shadow(0 0 6px rgba(46,204,138,.4))' : 'none',
                                    }}
                                >
                                    <img
                                        src={IMG}
                                        alt=""
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            </foreignObject>
                            <text
                                x={x}
                                y={busY + 11}
                                textAnchor="middle"
                                fontFamily="monospace"
                                fontSize={Math.max(7, imgW * 0.1)}
                                fill={si.col}
                                opacity={si.active ? 1 : 0.6}
                            >
                                {String(startNr + j).padStart(2, '0')}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    }

    private renderOverview(devices: Device[]): React.JSX.Element {
        if (!devices.length) {
            return <div className="sig-sm-empty">{this.t('sm_no_device')}</div>;
        }
        const lay = LAYOUTS.find(l => devices.length <= l.max) || LAYOUTS[LAYOUTS.length - 1];
        const perRow = Math.ceil(devices.length / lay.rows);
        const stats = devices.map(d => this.status(d));
        const rows: number[] = [];
        for (let r = 0; r < lay.rows; r++) {
            if (r * perRow < devices.length) {
                rows.push(r);
            }
        }

        let sumP = 0;
        let haveP = false;
        let day = 0;
        let haveDay = false;
        let life = 0;
        let haveLife = false;
        let online = 0;
        devices.forEach((d, i) => {
            const p = toNum(this.ev(`${d.prefix}.activePower`));
            const dy = toNum(this.ev(`${d.prefix}.dailyYield`));
            const lf = toNum(this.ev(`${d.prefix}.totalYield`));
            if (p !== null) {
                sumP += p;
                haveP = true;
            }
            if (dy !== null) {
                day += dy;
                haveDay = true;
            }
            if (lf !== null) {
                life += lf;
                haveLife = true;
            }
            if (stats[i].key === 'producing' || stats[i].key === 'online') {
                online++;
            }
        });
        // the adapter total covers all micro-inverters of the account, also unconfigured ones
        let totalP = toNum(this.ev(`${devices[0].ns}.sigenmicro.totalPower`));
        let pSub = this.t('sm_all_micro');
        if (totalP === null) {
            totalP = haveP ? sumP : null;
            pSub = this.t('sm_sum_devices');
        }
        const runCol = online === devices.length ? '#2ecc8a' : online > 0 ? '#e8a22a' : '#5a7a90';
        const tile = (lbl: string, val: string, unit: string, col: string, sub: string): React.JSX.Element => (
            <div className="sig-sm-kach">
                <div className="sig-sm-kach-lbl">{lbl}</div>
                <div
                    className="sig-sm-kach-val"
                    style={{ color: col }}
                >
                    {val}
                    <span className="sig-sm-kach-unit">{unit}</span>
                </div>
                <div className="sig-sm-kach-sub">{sub}</div>
            </div>
        );

        return (
            <>
                {this.cloudBanner(devices[0])}
                {rows.map(r =>
                    this.busRow(stats.slice(r * perRow, (r + 1) * perRow), r * perRow + 1, lay.imgW, lay.imgH, r),
                )}
                {rows.map(r => (
                    <div
                        key={`l${r}`}
                        className="sig-sm-labels"
                    >
                        {devices.slice(r * perRow, (r + 1) * perRow).map((d, k) => {
                            const i = r * perRow + k;
                            const si = stats[i];
                            const p = toNum(this.ev(`${d.prefix}.activePower`));
                            return (
                                <div
                                    key={d.prefix + i}
                                    className="sig-sm-label"
                                >
                                    <div
                                        className="sig-sm-label-id"
                                        style={{ color: si.col }}
                                    >
                                        {this.name(d, i + 1)}
                                    </div>
                                    {si.key !== 'offline' && si.key !== 'nodata' && p !== null ? (
                                        <div className="sig-sm-label-pwr">{p.toFixed(2)} kW</div>
                                    ) : null}
                                    <div
                                        className="sig-sm-label-st"
                                        style={{ color: si.col }}
                                    >
                                        {si.key === 'producing' ? '● ' : si.key === 'online' ? '◐ ' : '○ '}
                                        {this.statusLabel(si)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div className="sig-sm-kacheln">
                    {tile(this.t('sm_ac_power'), totalP !== null ? totalP.toFixed(2) : '--', 'kW', '#2ecc8a', pSub)}
                    {tile(
                        this.t('sm_today'),
                        haveDay ? day.toFixed(2) : '--',
                        'kWh',
                        '#e8a22a',
                        this.t('sm_yield_today'),
                    )}
                    {tile(
                        this.t('sm_total'),
                        haveLife ? life.toFixed(1) : '--',
                        'kWh',
                        '#4a9eed',
                        this.t('sm_lifetime_yield'),
                    )}
                    {tile('Online', String(online), `/${devices.length}`, runCol, this.t('sm_reporting'))}
                </div>
            </>
        );
    }

    private card(label: string, unit: string, col: string, id: string, dark: boolean): React.JSX.Element {
        const raw = this.ev(id);
        return (
            <div
                key={id}
                className="sig-sm-reg-card"
            >
                <div className="sig-sm-reg-lbl">{label}</div>
                <div
                    className="sig-sm-reg-val"
                    style={{ color: valCol(col, raw, dark) }}
                >
                    {fmtVal(unit, raw)}
                    {unit ? <span className="sig-sm-reg-unit">{unit}</span> : null}
                </div>
                <div
                    className="sig-sm-reg-oid"
                    title={id}
                >
                    {id}
                </div>
            </div>
        );
    }

    private renderDetail(d: Device, nr: number, dark: boolean): React.JSX.Element {
        const si = this.status(d);
        const p = d.prefix;
        const serialRaw = this.ev(`${p}.serialNumber`);
        const serial =
            serialRaw === undefined || serialRaw === null || serialRaw === '' ? d.serial || '–' : String(serialRaw);
        const fw = String(this.ev(`${p}.firmware`) ?? '') || '–';
        const rated = toNum(this.ev(`${p}.ratedPower`));
        const pvCards: React.JSX.Element[] = [];
        for (let n = 1; n <= PV_MAX; n++) {
            const has = PV_STATES.some(s => {
                const v = this.ev(`${p}.pv${n}.${s.name}`);
                return v !== undefined && v !== null;
            });
            if (has) {
                PV_STATES.forEach(s =>
                    pvCards.push(this.card(`PV${n} ${this.t(s.desc)}`, s.unit, s.col, `${p}.pv${n}.${s.name}`, dark)),
                );
            }
        }
        return (
            <>
                {this.cloudBanner(d)}
                <div className="sig-sm-det-hdr">
                    <div className={`sig-sm-det-img ${si.cls}`}>
                        <img
                            src={IMG}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                    <div className="sig-sm-det-info">
                        <div
                            className="sig-sm-det-model"
                            style={{ color: dark ? '#d8e4f0' : '#2c3e50' }}
                        >
                            {this.name(d, nr)}
                            {rated !== null ? ` — ${rated.toFixed(2)} kW` : ''}
                        </div>
                        <div className="sig-sm-det-serial">SN: {serial}</div>
                        <div className="sig-sm-det-fw">
                            FW: {fw} · {this.t('sm_last_update')}: {fmtTime(this.ev(`${p}.lastUpdate`))}
                        </div>
                        <div className={`sig-sm-det-badge ${si.badge}`}>
                            <span className="sig-sm-badge-dot" />
                            {this.statusLabel(si)}
                        </div>
                    </div>
                </div>
                <div className="sig-sm-reg-grid">
                    {STATES.map(s => this.card(this.t(s.desc), s.unit, s.col, `${p}.${s.name}`, dark))}
                </div>
                {pvCards.length ? (
                    <>
                        <div className="sig-sm-sect">{this.t('sm_pv_inputs')}</div>
                        <div className="sig-sm-reg-grid">{pvCards}</div>
                    </>
                ) : null}
            </>
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const dark = this.dark();
        const devices = this.devices();
        const tab = Math.min(this.state.tab, devices.length);
        const title = this.state.rxData.sig_title || 'SigenMicro';

        return (
            <Scaled designWidth={380}>
                <div className="sig-w">
                    <div className={dark ? 'sig-sm-wrap' : 'sig-sm-wrap light'}>
                        <div className="sig-sm-title">⚡ {title}</div>
                        <div className="sig-sm-tabbar">
                            <div
                                className={`sig-sm-tab${tab === 0 ? ' active' : ''}`}
                                onClick={() => this.setState({ tab: 0 })}
                            >
                                {this.t('sm_overview')}
                            </div>
                            {devices.map((d, i) => (
                                <div
                                    key={d.prefix + i}
                                    className={`sig-sm-tab${tab === i + 1 ? ' active' : ''}`}
                                    onClick={() => this.setState({ tab: i + 1 })}
                                >
                                    {this.name(d, i + 1)}
                                </div>
                            ))}
                        </div>
                        <div className="sig-sm-panel active">
                            {tab === 0 ? this.renderOverview(devices) : this.renderDetail(devices[tab - 1], tab, dark)}
                        </div>
                    </div>
                </div>
            </Scaled>
        );
    }
}
