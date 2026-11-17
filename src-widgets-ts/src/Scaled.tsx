import React, { useCallback, useLayoutEffect, useRef } from 'react';

/*
 * Port of the former `_applyScale` helper.
 *
 * The content is laid out at a fixed design width and scaled non-uniformly with
 * `transform: scale(sx, sy)`, so width and height follow the widget independently and the
 * content always fills the whole widget. Text elements get a counter-scale so that the
 * letters keep their proportions. `offsetHeight` of the inner box is the layout height
 * without the transform, so content changes (tab switch, new values) are picked up.
 */
const TEXT_SELECTOR = [
    '.sig-text',
    "[class*='-title']",
    "[class*='-lbl']",
    "[class*='-label']",
    "[class*='-val']",
    "[class*='-value']",
    "[class*='-name']",
    "[class*='-big']",
    "[class*='-sub']",
    "[class*='-soh']",
    "[class*='-head']",
    "[class*='-badge']",
    "[class*='-btn']",
    "[class*='-tab']",
    "[class*='-toggle']",
    "[class*='-startstop']",
    "[class*='-oid']",
    "[class*='-nr']",
    "[class*='-unit']",
    "[class*='-model']",
    "[class*='-serial']",
    "[class*='-fw']",
    '.sig-sm-label-id',
    '.sig-sm-label-pwr',
    '.sig-sm-label-st',
    '.sig-soc-labels span',
].join(',');

interface ScaledProps {
    designWidth: number;
    children: React.ReactNode;
}

export default function Scaled({ designWidth, children }: ScaledProps): React.JSX.Element {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    const apply = useCallback((): void => {
        const outer = outerRef.current;
        const inner = innerRef.current;
        if (!outer || !inner) {
            return;
        }
        const w = outer.clientWidth;
        const h = outer.clientHeight;
        if (!w) {
            return;
        }
        const innerH = inner.offsetHeight;
        const sx = w / designWidth;
        const sy = h > 0 && innerH > 0 ? h / innerH : sx;
        inner.style.transform = `scale(${sx}, ${sy})`;

        const comp = sx >= sy ? `scaleX(${sy / sx})` : `scaleY(${sx / sy})`;
        const texts = inner.querySelectorAll<HTMLElement>(TEXT_SELECTOR);
        for (let i = 0; i < texts.length; i++) {
            // Flex/grid containers are not compensated, their children would move.
            // MUI elements bring their own transforms (slider thumb, ripple) — leave them alone.
            const el = texts[i];
            if (el.closest('.MuiSlider-root')) {
                continue;
            }
            const d = getComputedStyle(el).display;
            if (d === 'flex' || d === 'grid' || d === 'inline-flex' || d === 'inline-grid') {
                continue;
            }
            el.style.transform = comp;
            el.style.transformOrigin = '0 50%';
        }
    }, [designWidth]);

    // after every render: new elements need their counter-scale
    useLayoutEffect(() => {
        apply();
    });

    useLayoutEffect(() => {
        const outer = outerRef.current;
        const inner = innerRef.current;
        if (!outer || !inner || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const ro = new ResizeObserver(() => apply());
        ro.observe(outer);
        ro.observe(inner);
        return () => ro.disconnect();
    }, [apply]);

    return (
        <div
            ref={outerRef}
            className="sig-scale-outer"
        >
            <div
                ref={innerRef}
                className="sig-scale-inner"
                style={{ width: designWidth }}
            >
                {children}
            </div>
        </div>
    );
}
