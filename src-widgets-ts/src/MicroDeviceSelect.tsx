import React, { useEffect, useState } from 'react';
import { Button, FormControl, MenuItem, Select } from '@mui/material';

import type {
    RxWidgetInfoAttributesField,
    RxWidgetInfoCustomComponentProperties,
    WidgetData,
} from '@iobroker/types-vis-2';

/*
 * Editor helpers of the SigenMicro widget: the micro-inverter is chosen by its device
 * (serial number) instead of one of its states. The adapter (ioBroker.sigenergy >= 3.5.0)
 * creates one device object per micro-inverter: <ns>.sigenmicro.<serial>, native.sn = serial.
 */

// Minimal structural socket type (avoids clashes between the Connection typings of the packages)
interface SocketLike {
    getObjectViewSystem: (
        type: 'device',
        start: string,
        end: string,
    ) => Promise<Record<string, ioBroker.Object | null | undefined>>;
}

export interface MicroDeviceDef {
    /** device object ID, e.g. "sigenergy.0.sigenmicro.SN0001" */
    id: string;
    serial: string;
    name: string;
    instance: string;
}

const DEVICE_RE = /^(sigenergy\.\d+)\.sigenmicro\.([^.]+)$/;

function objName(obj: ioBroker.Object): string {
    const n = obj.common?.name;
    if (!n) {
        return '';
    }
    if (typeof n === 'string') {
        return n;
    }
    return n.en || Object.values(n)[0] || '';
}

/** All SigenMicro devices of all sigenergy instances, sorted by instance and serial number. */
export async function readMicroDevices(socket: SocketLike): Promise<MicroDeviceDef[]> {
    try {
        const objs = await socket.getObjectViewSystem('device', 'sigenergy.', 'sigenergy.香');
        const list: MicroDeviceDef[] = [];
        for (const [id, obj] of Object.entries(objs || {})) {
            const m = DEVICE_RE.exec(id);
            if (!m || !obj) {
                continue;
            }
            const serial = String((obj.native as { sn?: string } | undefined)?.sn || m[2]);
            // the adapter names a device "SigenMicro <name>" or "SigenMicro <serial>"
            const name = objName(obj).replace(/^SigenMicro\s+/, '');
            list.push({ id, serial, name: name === serial ? '' : name, instance: m[1] });
        }
        return list.sort((a, b) => a.instance.localeCompare(b.instance) || a.serial.localeCompare(b.serial));
    } catch {
        return [];
    }
}

function useMicroDevices(socket: SocketLike): MicroDeviceDef[] | null {
    const [devices, setDevices] = useState<MicroDeviceDef[] | null>(null);
    useEffect(() => {
        let active = true;
        void readMicroDevices(socket).then(list => active && setDevices(list));
        return () => {
            active = false;
        };
    }, [socket]);
    return devices;
}

/** Device prefix of a legacy anchor state ("…sigenmicro.<serial>.<state>" → "…sigenmicro.<serial>"). */
export function prefixOfAnchor(oid: string): string {
    const parts = String(oid).split('.');
    const idx = parts.indexOf('sigenmicro');
    return idx >= 0 && parts.length > idx + 1 ? parts.slice(0, idx + 2).join('.') : '';
}

type Translate = (key: string) => string;

function MicroDeviceSelect(props: {
    socket: SocketLike;
    fieldName: string;
    index: string;
    data: WidgetData;
    onDataChange: (newData: WidgetData) => void;
    label: string;
    t: Translate;
}): React.JSX.Element {
    const { data, index, onDataChange, t } = props;
    const devices = useMicroDevices(props.socket);
    // a widget from before 2.0.0 stored a state of the device in oid_micro<N>
    const value = (data[props.fieldName] as string) || prefixOfAnchor((data[`oid_micro${index}`] as string) || '');
    const several = new Set((devices || []).map(d => d.instance)).size > 1;
    const known = (devices || []).some(d => d.id === value);

    return (
        <FormControl
            fullWidth
            variant="standard"
            size="small"
        >
            <Select
                value={value}
                displayEmpty
                onChange={e => {
                    const nd: WidgetData = { ...data, [props.fieldName]: e.target.value };
                    // the device replaces a legacy anchor state
                    delete nd[`oid_micro${index}`];
                    onDataChange(nd);
                }}
            >
                <MenuItem value="">
                    <em>{devices && !devices.length ? t('micro_device_none') : '—'}</em>
                </MenuItem>
                {value && !known ? <MenuItem value={value}>{value}</MenuItem> : null}
                {(devices || []).map(d => (
                    <MenuItem
                        key={d.id}
                        value={d.id}
                    >
                        {d.serial}
                        {d.name ? ` — ${d.name}` : ''}
                        {several ? ` (${d.instance})` : ''}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

/** Attribute field: pick the micro-inverter of an indexed group by its device. */
export function microDeviceField(t: Translate): RxWidgetInfoAttributesField {
    return {
        name: 'micro_device',
        type: 'custom',
        label: 'micro_device',
        component: (
            field: RxWidgetInfoAttributesField,
            data: WidgetData,
            onDataChange: (newData: WidgetData) => void,
            compProps: RxWidgetInfoCustomComponentProperties,
        ): React.JSX.Element => {
            // inside the indexed group vis-2 names the field "micro_device<N>"
            const fieldName = field.name || 'micro_device1';
            const index = fieldName.replace(/^micro_device/, '');
            return (
                <MicroDeviceSelect
                    socket={compProps.context.socket}
                    fieldName={fieldName}
                    index={index}
                    data={data}
                    onDataChange={onDataChange}
                    label={t('micro_device')}
                    t={t}
                />
            );
        },
    };
}

function TakeAllButton(props: {
    socket: SocketLike;
    data: WidgetData;
    onDataChange: (newData: WidgetData) => void;
    t: Translate;
}): React.JSX.Element {
    const devices = useMicroDevices(props.socket);
    const list = (devices || []).slice(0, 20);
    return (
        <Button
            variant="outlined"
            size="small"
            fullWidth
            disabled={!list.length}
            onClick={() => {
                const nd: WidgetData = { ...props.data, micro_count: list.length };
                list.forEach((d, i) => {
                    nd[`micro_device${i + 1}`] = d.id;
                    delete nd[`oid_micro${i + 1}`];
                });
                props.onDataChange(nd);
            }}
        >
            {devices && !devices.length
                ? props.t('micro_device_none')
                : `${props.t('micro_take_btn')} (${list.length})`}
        </Button>
    );
}

/** Attribute field: take over all SigenMicro devices of the account at once. */
export function takeAllField(t: Translate): RxWidgetInfoAttributesField {
    return {
        name: 'micro_take_all',
        type: 'custom',
        label: 'micro_take_all',
        noBinding: true,
        component: (
            _field: RxWidgetInfoAttributesField,
            data: WidgetData,
            onDataChange: (newData: WidgetData) => void,
            compProps: RxWidgetInfoCustomComponentProperties,
        ): React.JSX.Element => (
            <TakeAllButton
                socket={compProps.context.socket}
                data={data}
                onDataChange={onDataChange}
                t={t}
            />
        ),
    };
}
