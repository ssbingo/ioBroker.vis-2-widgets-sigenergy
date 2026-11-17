// Shared formatters and value helpers of the Sigenergy widgets (port of the former
// vis.binds["vis-2-widgets-sigenergy"] helpers, same output).

export type StateVal = ioBroker.StateValue | undefined;

/** Number or null for "no value". */
export function toNum(v: StateVal): number | null {
    if (v === undefined || v === null || v === '') {
        return null;
    }
    const n = parseFloat(String(v));
    return isNaN(n) ? null : n;
}

/** Number, 0 for "no value" (the legacy `parseFloat(x) || 0`). */
export function num0(v: StateVal): number {
    return toNum(v) ?? 0;
}

/** Truthy flag as written by the adapter or by hand (true / 1 / "1" / "true"). */
export function toBool(v: StateVal): boolean {
    return v === true || v === 1 || v === '1' || v === 'true';
}

/** The dark-mode checkbox: vis-2 stores a boolean, widgets from vis-1 days a string. */
export function isDark(v: unknown): boolean {
    return v === true || v === 'true' || v === '1' || v === 1;
}

export function fmtKW(v: StateVal): string {
    const n = toNum(v);
    if (n === null) {
        return '-- kW';
    }
    return `${Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2)} kW`;
}

export function fmtPct(v: StateVal): string {
    const n = toNum(v);
    return n === null ? '--%' : `${Math.round(n)}%`;
}

export function fmtKWh(v: StateVal): string {
    const n = toNum(v);
    return n === null ? '-- kWh' : `${n.toFixed(2)} kWh`;
}

/** Minutes → "12 min" / "2h 5m". */
export function fmtMin(v: StateVal): string {
    const m = Math.round(Math.abs(toNum(v) ?? 0));
    if (!m) {
        return '0 min';
    }
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

/** Seconds → "Xh Ym" / "Y min". */
export function fmtDuration(v: StateVal): string {
    const s = Math.round(Math.abs(toNum(v) ?? 0));
    if (!s) {
        return '0 min';
    }
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m} min`;
}

/** SOC colour: > 60 % green, > 25 % orange, else red. */
export function socCol(p: StateVal): string {
    const n = toNum(p) ?? 0;
    return n > 60 ? '#27ae60' : n > 25 ? '#f39c12' : '#e74c3c';
}

/** Default text colour of the dark / light theme. */
export function textCol(dark: boolean): string {
    return dark ? '#e0e6ef' : '#2c3e50';
}
