import React, { useState } from 'react';
import { Slider, Tooltip } from '@mui/material';

/**
 * Status badge with an explanation tooltip (MUI Tooltip). The tooltip renders in a portal at
 * the document body, outside the scaled widget tree: it is never cut off by `overflow: hidden`
 * and keeps a readable size whatever the widget scale. A dark widget gets a light tooltip and
 * vice versa, like the former popup.
 */
export function TipBadge(props: { className: string; label: string; tip: string; dark: boolean }): React.JSX.Element {
    const bg = props.dark ? '#f8fafc' : '#1e293b';
    const fg = props.dark ? '#1e293b' : '#f8fafc';
    const border = props.dark ? 'rgba(15,23,42,.3)' : 'rgba(255,255,255,.2)';
    return (
        <Tooltip
            title={props.tip}
            arrow
            placement="bottom-end"
            enterTouchDelay={0}
            leaveTouchDelay={8000}
            slotProps={{
                tooltip: {
                    sx: {
                        maxWidth: 280,
                        p: '10px 12px',
                        borderRadius: '8px',
                        bgcolor: bg,
                        color: fg,
                        border: `1px solid ${border}`,
                        fontSize: 13,
                        fontWeight: 500,
                        lineHeight: 1.45,
                        boxShadow: '0 8px 24px rgba(0,0,0,.4)',
                    },
                },
                arrow: { sx: { color: bg, '&::before': { border: `1px solid ${border}` } } },
            }}
        >
            <span
                className={props.className}
                tabIndex={0}
            >
                {props.label}
            </span>
        </Tooltip>
    );
}

/**
 * MUI Slider that shows the live value while dragging and writes only when released —
 * the former range input wrote on mouseup/touchend as well.
 */
export function CommitSlider(props: {
    value: number;
    min: number;
    max: number;
    step?: number;
    disabled?: boolean;
    color?: string;
    format: (v: number) => string;
    valueClassName: string;
    onCommit: (v: number) => void;
}): React.JSX.Element {
    const [drag, setDrag] = useState<number | null>(null);
    const shown = Math.min(Math.max(drag ?? props.value, props.min), props.max);
    const color = props.color || '#3498db';
    return (
        <>
            <Slider
                size="small"
                value={shown}
                min={props.min}
                max={props.max}
                step={props.step ?? 1}
                disabled={props.disabled}
                onChange={(_e, v) => setDrag(Array.isArray(v) ? v[0] : v)}
                onChangeCommitted={(_e, v) => {
                    setDrag(null);
                    props.onCommit(Array.isArray(v) ? v[0] : v);
                }}
                sx={{ flex: 1, mx: 0.5, color, py: '10px' }}
            />
            <span className={props.valueClassName}>{props.format(shown)}</span>
        </>
    );
}
