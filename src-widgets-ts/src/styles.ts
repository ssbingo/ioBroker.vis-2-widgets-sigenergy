// The stylesheet of the widget set. A module-federation remote cannot rely on a <link>
// in widgets.html anymore, so the CSS is bundled as a string and injected once per page.
import css from './style.css?inline';

const STYLE_ID = 'vis-2-widgets-sigenergy-css';

export function injectStyles(): void {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
        return;
    }
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = css;
    document.head.appendChild(el);
}
