import React from 'react';

import type { Weather } from './weather';

/**
 * Weather graphics of the energy house (viewBox 640 × 520): sky colours, sun / moon / stars,
 * clouds, lightning, rain, snow and fog. Own vector drawing, no images.
 */

/** sky gradient (top, bottom) per weather; clear keeps the colours of the palette */
export const SKY_DAY: Partial<Record<Weather, [string, string]>> = {
    partly: ['#a3c2de', '#dfe8ef'],
    cloudy: ['#9aa6b2', '#d3d9de'],
    fog: ['#b8c0c7', '#dfe2e5'],
    rain: ['#8a95a0', '#c2c9cf'],
    snow: ['#a7b0b9', '#dde1e5'],
    storm: ['#737c87', '#aeb5bc'],
};
/** darker secondary text on the dark day skies of rain and storm */
export const SUB_DAY_DARK = '#262e36';
export const SKY_NIGHT: Partial<Record<Weather, [string, string]>> = {
    cloudy: ['#12161b', '#272d34'],
    fog: ['#1a1f25', '#2e343b'],
    rain: ['#0f1317', '#232930'],
    snow: ['#161b21', '#2c323a'],
    storm: ['#0a0c10', '#1d2128'],
};

const SUN = '#ffd166';
const MOON = '#e7e2cf';

/** deterministic pseudo random numbers: the drops stay in place between renders */
function rnd(seed: number): () => number {
    let x = seed;
    return () => {
        x = (x * 1103515245 + 12345) % 2147483648;
        return x / 2147483648;
    };
}

/** cloud colours: [light, mid, dark] */
function cloudCols(day: boolean): [string, string, string] {
    return day ? ['#f6f8fa', '#d2d8de', '#5f6873'] : ['#3d4550', '#2e353e', '#23292f'];
}

/** a cloud of four puffs on a flat base, centred at (cx, cy), s = width / 2.4 */
function cloud(key: string, cx: number, cy: number, s: number, fill: string, opacity = 1): React.JSX.Element {
    return (
        <g
            key={key}
            fill={fill}
            opacity={opacity}
        >
            <circle
                cx={cx - 0.75 * s}
                cy={cy}
                r={0.42 * s}
            />
            <circle
                cx={cx - 0.2 * s}
                cy={cy - 0.3 * s}
                r={0.55 * s}
            />
            <circle
                cx={cx + 0.45 * s}
                cy={cy - 0.15 * s}
                r={0.45 * s}
            />
            <circle
                cx={cx + 0.95 * s}
                cy={cy + 0.08 * s}
                r={0.32 * s}
            />
            <rect
                x={cx - 1.15 * s}
                y={cy - 0.05 * s}
                width={2.4 * s}
                height={0.47 * s}
                rx={0.23 * s}
            />
        </g>
    );
}

function sun(key: string, cx: number, cy: number, r: number, halo: boolean): React.JSX.Element {
    return (
        <g key={key}>
            {halo ? (
                <circle
                    cx={cx}
                    cy={cy}
                    r={r * 1.55}
                    fill={SUN}
                    opacity=".18"
                />
            ) : null}
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={SUN}
            />
        </g>
    );
}

/** crescent: a disc covered by a second disc in the sky colour */
function moon(key: string, cx: number, cy: number, r: number, skyCol: string): React.JSX.Element {
    return (
        <g key={key}>
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={MOON}
            />
            <circle
                cx={cx + r * 0.46}
                cy={cy - r * 0.38}
                r={r * 0.92}
                fill={skyCol}
            />
        </g>
    );
}

function bolt(key: string, x: number, y: number, s: number, anim: boolean): React.JSX.Element {
    const p = [
        [0, 0],
        [-0.45, 1.1],
        [-0.05, 1.1],
        [-0.4, 2.2],
        [0.55, 0.8],
        [0.12, 0.8],
        [0.45, 0],
    ]
        .map(([a, b]) => `${(x + a * s).toFixed(1)},${(y + b * s).toFixed(1)}`)
        .join(' ');
    return (
        <polygon
            key={key}
            points={p}
            fill="#ffe27a"
            className={anim ? 'sig-eh-bolt' : undefined}
        />
    );
}

/** Sky: sun or moon with stars, clouds by the weather, lightning in a storm. */
export function drawSky(
    els: React.JSX.Element[],
    key: () => number,
    w: Weather,
    day: boolean,
    anim: boolean,
    skyCol: string,
): void {
    const [light, mid, dark] = cloudCols(day);
    const k = (): string => `sky${key()}`;
    const showSun = w === 'clear' || w === 'partly';

    if (!day && (w === 'clear' || w === 'partly')) {
        const stars: [number, number][] = [
            [60, 140],
            [110, 30],
            [200, 120],
            [560, 90],
            [610, 160],
            [470, 20],
            [300, 12],
            [520, 130],
            [30, 230],
        ];
        stars
            .filter((_, i) => w === 'clear' || i % 2 === 0)
            .forEach(([x, y], i) =>
                els.push(
                    <circle
                        key={k()}
                        cx={x}
                        cy={y}
                        r={i % 3 ? 0.9 : 1.4}
                        fill="#cfd8e3"
                        opacity=".55"
                    />,
                ),
            );
    }
    if (showSun) {
        els.push(day ? sun(k(), 588, 40, 18, w === 'clear') : moon(k(), 590, 38, 13, skyCol));
    } else if (w === 'fog' && day) {
        // the sun as a pale disc behind the fog
        els.push(
            <circle
                key={k()}
                cx="588"
                cy="40"
                r="16"
                fill="#fff6dc"
                opacity=".55"
            />,
        );
    }

    // clouds: [cx, cy, s, colour, opacity]; drawn back to front
    // small clouds in the band above the callouts, clear of the status text in the middle:
    // [cx, cy, s, colour, opacity], back to front
    let list: [number, number, number, string, number][] = [];
    const heavy = (c1: string, c2: string, o: number): [number, number, number, string, number][] => [
        [175, 18, 19, c1, o],
        [245, 24, 16, c2, o],
        [410, 16, 21, c2, o],
        [495, 22, 19, c1, o],
        [590, 20, 22, c1, o],
    ];
    switch (w) {
        case 'partly':
            list = [
                [175, 20, 18, light, 0.9],
                [560, 30, 24, light, 0.97],
            ];
            break;
        case 'cloudy':
            list = [
                [175, 18, 18, light, 0.95],
                [245, 24, 15, mid, 0.9],
                [420, 16, 20, mid, 0.9],
                [500, 22, 18, light, 0.95],
                [590, 20, 20, mid, 0.95],
            ];
            break;
        case 'fog':
            list = [
                [190, 18, 20, light, 0.6],
                [470, 16, 22, light, 0.6],
            ];
            break;
        case 'rain':
            list = heavy(dark, mid, 0.95);
            break;
        case 'snow':
            list = heavy(mid, light, 0.95);
            break;
        case 'storm':
            list = heavy(day ? '#48505a' : dark, day ? dark : mid, 1);
            break;
        default:
            break;
    }
    if (list.length) {
        els.push(
            <g
                key={k()}
                className={anim ? 'sig-eh-clouds' : undefined}
            >
                {list.map(([x, y, s, col, o], i) => cloud(`c${i}`, x, y, s, col, o))}
            </g>,
        );
    }
    if (w === 'storm') {
        els.push(bolt(k(), 596, 30, 18, anim));
        els.push(bolt(k(), 180, 27, 14, anim));
    }
}

/** Rain, snow or fog in front of the scene. */
export function drawPrecip(
    els: React.JSX.Element[],
    key: () => number,
    w: Weather,
    day: boolean,
    anim: boolean,
    uid: string,
): void {
    const k = (): string => `wx${key()}`;
    if (w === 'rain' || w === 'storm') {
        const r = rnd(7);
        const n = w === 'storm' ? 90 : 70;
        const col = day ? '#4f6a86' : '#8fa6bd';
        const drops: React.JSX.Element[] = [];
        for (let i = 0; i < n; i++) {
            const x = r() * 680;
            const y = 70 + r() * 420;
            drops.push(
                <line
                    key={i}
                    x1={x}
                    y1={y}
                    x2={x - 3}
                    y2={y + 11}
                    className={anim ? 'sig-eh-drop' : undefined}
                    style={anim ? { animationDelay: `${(-r() * 0.9).toFixed(2)}s` } : undefined}
                />,
            );
        }
        els.push(
            <g
                key={k()}
                stroke={col}
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity=".6"
            >
                {drops}
            </g>,
        );
    } else if (w === 'snow') {
        const r = rnd(11);
        const flakes: React.JSX.Element[] = [];
        for (let i = 0; i < 80; i++) {
            flakes.push(
                <circle
                    key={i}
                    cx={r() * 660}
                    cy={60 + r() * 440}
                    r={1.3 + r() * 1.4}
                    className={anim ? 'sig-eh-flake' : undefined}
                    style={anim ? { animationDelay: `${(-r() * 5).toFixed(2)}s` } : undefined}
                />,
            );
        }
        els.push(
            <g
                key={k()}
                fill="#ffffff"
                opacity={day ? 0.9 : 0.75}
            >
                {flakes}
            </g>,
        );
    } else if (w === 'fog') {
        // soft banks of fog over a light haze; the filter id is unique per widget
        const col = day ? '#eef1f3' : '#56606b';
        const fid = `sig-eh-fog-${uid}`;
        els.push(
            <g key={k()}>
                <defs>
                    <filter
                        id={fid}
                        x="-20%"
                        y="-100%"
                        width="140%"
                        height="300%"
                    >
                        <feGaussianBlur stdDeviation="9" />
                    </filter>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="640"
                    height="520"
                    fill={col}
                    opacity={day ? 0.22 : 0.18}
                />
                <g
                    fill={col}
                    filter={`url(#${fid})`}
                    className={anim ? 'sig-eh-fog' : undefined}
                >
                    {[
                        [150, 310, 230, 0.55],
                        [470, 350, 260, 0.45],
                        [120, 410, 280, 0.6],
                        [480, 455, 250, 0.5],
                        [300, 500, 380, 0.45],
                    ].map(([cx, cy, rx, o], i) => (
                        <ellipse
                            key={i}
                            cx={cx}
                            cy={cy}
                            rx={rx}
                            ry="20"
                            opacity={o}
                        />
                    ))}
                </g>
            </g>,
        );
    }
}

/** small weather symbol for the header, centred at (cx, cy) */
export function weatherIcon(cx: number, cy: number, w: Weather, day: boolean): React.JSX.Element {
    const [light, mid, dark] = cloudCols(day);
    const parts: React.JSX.Element[] = [];
    const body = day ? SUN : MOON;
    if (w === 'clear') {
        return day ? (
            sun('i0', cx, cy, 9, false)
        ) : (
            <circle
                cx={cx}
                cy={cy}
                r={9}
                fill={body}
            />
        );
    }
    if (w === 'partly') {
        parts.push(
            day ? (
                sun('i0', cx + 4, cy - 4, 7, false)
            ) : (
                <circle
                    key="i0"
                    cx={cx + 4}
                    cy={cy - 4}
                    r={7}
                    fill={body}
                />
            ),
        );
    }
    const cc = w === 'storm' || w === 'rain' ? (day ? dark : mid) : day ? '#c3cad1' : light;
    parts.push(cloud('i1', cx - 1, cy + 2, 8.5, cc));
    if (w === 'rain' || w === 'storm') {
        [-6, 0, 6].forEach((dx, i) =>
            parts.push(
                <line
                    key={`d${i}`}
                    x1={cx + dx}
                    y1={cy + 8}
                    x2={cx + dx - 2}
                    y2={cy + 13}
                    stroke={day ? '#4f6a86' : '#8fa6bd'}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />,
            ),
        );
    }
    if (w === 'storm') {
        parts.push(bolt('b', cx + 1, cy + 4, 7, false));
    }
    if (w === 'snow') {
        [-6, 0, 6].forEach((dx, i) =>
            parts.push(
                <circle
                    key={`f${i}`}
                    cx={cx + dx}
                    cy={cy + 11}
                    r="1.6"
                    fill={day ? '#ffffff' : '#dfe6ee'}
                    stroke={day ? '#9aa6b2' : 'none'}
                    strokeWidth=".6"
                />,
            ),
        );
    }
    if (w === 'fog') {
        [9, 13].forEach((dy, i) =>
            parts.push(
                <rect
                    key={`g${i}`}
                    x={cx - 10}
                    y={cy + dy}
                    width="20"
                    height="2"
                    rx="1"
                    fill={day ? '#8c96a1' : '#7d8792'}
                />,
            ),
        );
    }
    return <g>{parts}</g>;
}
