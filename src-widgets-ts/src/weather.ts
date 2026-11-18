import { toNum, type StateVal } from './common';

/**
 * Weather of the energy house, reduced to what the drawing can show.
 *
 * The condition comes from any weather adapter, preferably as a language-independent code: a WMO
 * weather code (open-meteo-weather; 0–99), an OpenWeatherMap icon ("10d", also as icon URL) or
 * condition id (200–804), a DasWetter / Meteored symbol (1–41, also as symbol URL) or an AccuWeather
 * icon number (1–44). English condition texts and icon names (OpenWeatherMap "main", Bright Sky,
 * Weatherunderground, Pirate Weather …) are read as well. Cloud cover (%) and precipitation (mm/h)
 * can be given in addition or instead.
 */
export type Weather = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm';

export type WeatherCode = 'auto' | 'wmo' | 'owm' | 'meteored' | 'accu';

/**
 * Keywords of English condition texts and icon names, checked in this order, the first match wins.
 * Texts in other languages are not matched: for them the language-independent code of the adapter
 * is the condition to use.
 */
const KEYWORDS: [Weather, RegExp][] = [
    ['fog', /dust ?storm|sand ?storm/],
    ['storm', /thunder|storm|lightning|tstorm/],
    ['snow', /snow|sleet|flurr|hail|ice|blizzard/],
    ['rain', /rain|drizzle|shower|precip/],
    ['fog', /fog|mist|haze|smoke|dust/],
    ['partly', /partly|mostly sunny|mostly clear|scattered|few clouds|broken|intermittent|high clouds/],
    ['cloudy', /cloud|overcast|dreary/],
    ['clear', /clear|sunny|fair|sun/],
];

/** OpenWeatherMap icon ("01d" … "50n"), keyed by its number */
const OWM_ICON: Record<number, Weather> = {
    1: 'clear',
    2: 'partly',
    3: 'partly',
    4: 'cloudy',
    9: 'rain',
    10: 'rain',
    11: 'storm',
    13: 'snow',
    50: 'fog',
};

/** WMO codes of snow, sleet and hail outside the 70–79 block */
const WMO_SNOW = new Set([22, 26, 83, 84, 85, 86, 87, 88]);

/** WMO code table 4677 as used by Open-Meteo (0–99); 1 "mainly clear" counts as clear */
function fromWmo(n: number): Weather | null {
    if (n < 0 || n > 99) {
        return null;
    }
    if (n >= 95 || n === 17 || n === 29) {
        return 'storm';
    }
    if ((n >= 70 && n <= 79) || WMO_SNOW.has(n)) {
        return 'snow';
    }
    if ((n >= 50 && n <= 69) || (n >= 80 && n <= 82) || (n >= 20 && n <= 25) || n === 91 || n === 92) {
        return 'rain';
    }
    if ((n >= 40 && n <= 49) || (n >= 4 && n <= 12) || n === 28) {
        return 'fog';
    }
    if (n === 3) {
        return 'cloudy';
    }
    if (n === 2) {
        return 'partly';
    }
    return 'clear';
}

/** OpenWeatherMap condition id (2xx … 8xx) */
function fromOwmId(n: number): Weather | null {
    const g = Math.floor(n / 100);
    if (g === 2) {
        return 'storm';
    }
    if (g === 3 || g === 5) {
        return n === 511 ? 'snow' : 'rain';
    }
    if (g === 6) {
        return 'snow';
    }
    if (g === 7) {
        return 'fog';
    }
    if (n === 800) {
        return 'clear';
    }
    if (n === 801 || n === 802) {
        return 'partly';
    }
    if (n === 803 || n === 804) {
        return 'cloudy';
    }
    return null;
}

/** DasWetter (Meteored) symbol 1–41: the order of the adapter's symbol descriptions */
function fromMeteored(n: number): Weather | null {
    if (n === 1) {
        return 'clear';
    }
    if (n >= 2 && n <= 4) {
        return 'partly';
    }
    if (n === 5) {
        return 'cloudy';
    }
    if ((n >= 6 && n <= 9) || n === 40) {
        return 'fog';
    }
    if (n === 10 || n === 11 || n === 34 || n === 35 || n === 38 || n === 39) {
        return 'storm';
    }
    if ((n >= 12 && n <= 19) || n === 28 || n === 29) {
        return 'rain';
    }
    if ((n >= 20 && n <= 27) || (n >= 30 && n <= 33) || n === 36 || n === 37 || n === 41) {
        return 'snow';
    }
    return null;
}

/** AccuWeather icon number (1–44) */
function fromAccu(n: number): Weather | null {
    if ([1, 2, 30, 31, 32, 33, 34].includes(n)) {
        return 'clear';
    }
    if ([3, 4, 5, 6, 35, 36, 37, 38].includes(n)) {
        return n === 5 || n === 37 ? 'fog' : n === 6 || n === 38 ? 'cloudy' : 'partly';
    }
    if (n === 7 || n === 8) {
        return 'cloudy';
    }
    if (n === 11) {
        return 'fog';
    }
    if ([12, 13, 14, 18, 39, 40].includes(n)) {
        return 'rain';
    }
    if ([15, 16, 17, 41, 42].includes(n)) {
        return 'storm';
    }
    if ([19, 20, 21, 22, 23, 24, 25, 26, 29, 43, 44].includes(n)) {
        return 'snow';
    }
    return null;
}

/** Condition state → weather; null when the value cannot be read. */
export function parseCondition(val: StateVal, code: WeatherCode = 'auto'): Weather | null {
    if (val === null || val === undefined || val === '') {
        return null;
    }
    const n = typeof val === 'number' || /^\s*-?\d+(\.\d+)?\s*$/.test(String(val)) ? toNum(val) : null;
    if (n !== null) {
        if (code === 'accu') {
            return fromAccu(n);
        }
        if (code === 'meteored') {
            return fromMeteored(n);
        }
        if (code === 'owm' || (code === 'auto' && n >= 200 && n <= 804)) {
            return fromOwmId(n);
        }
        return fromWmo(n);
    }
    const s = String(val).toLowerCase();
    // icon URLs of the adapters carry the code as file name
    const file = /\/(\d{1,2})(?:nh|n)?\.(?:svg|png|gif)$/.exec(s);
    if (file && s.includes('daswetter')) {
        return fromMeteored(parseInt(file[1], 10));
    }
    if (file && s.includes('open-meteo')) {
        return fromWmo(parseInt(file[1], 10));
    }
    const icon = /(?:^|[^0-9])(0[1-4]|09|1[013]|50)[dn](?:@\dx)?(?:\.png)?$/.exec(s);
    if (icon) {
        return OWM_ICON[parseInt(icon[1], 10)];
    }
    for (const [w, re] of KEYWORDS) {
        if (re.test(s)) {
            return w;
        }
    }
    return null;
}

/**
 * The weather to draw: the condition first; cloud cover and precipitation refine it or stand in
 * for a missing condition. With a cloud cover the amount of clouds follows it (e.g. the plain
 * "Clouds" of OpenWeatherMap). Rain turns into snow at or below 1 °C when only the amount is known.
 */
export function resolveWeather(
    condition: Weather | null,
    clouds: number | null,
    precip: number | null,
    temp: number | null,
): Weather {
    let w = condition;
    if (
        precip !== null &&
        precip > 0.05 &&
        (w === null || w === 'clear' || w === 'partly' || w === 'cloudy' || w === 'fog')
    ) {
        w = temp !== null && temp <= 1 ? 'snow' : 'rain';
    }
    if (clouds !== null && (w === null || w === 'clear' || w === 'partly' || w === 'cloudy')) {
        w = clouds >= 85 ? 'cloudy' : clouds >= 25 ? 'partly' : 'clear';
    }
    return w ?? 'clear';
}
