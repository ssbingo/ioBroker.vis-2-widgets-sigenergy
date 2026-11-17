import type { RxWidgetInfoAttributesField, VisRxWidgetProps, VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

import { injectStyles } from './styles';
import { isDark, type StateVal } from './common';

export const VIS_SET = 'vis-2-widgets-sigenergy';
export const SET_COLOR = '#f39c12';
export const SET_ICON = 'widgets/vis-2-widgets-sigenergy/img/vis-2-widgets-sigenergy.png';

export interface SigRxData {
    sig_title?: string;
    sig_darkmode?: boolean | string;
}

export interface SigState extends VisRxWidgetState {
    /** values of the derived OIDs (not attributes) — keyed by the full object ID */
    extra: Record<string, ioBroker.StateValue | null>;
}

/** Fields of the "Appearance" group most widgets share. */
export function appearanceFields(withTitle = true): RxWidgetInfoAttributesField[] {
    const fields: RxWidgetInfoAttributesField[] = [];
    if (withTitle) {
        fields.push({ name: 'sig_title', type: 'text', label: 'sig_title', tooltip: 'sig_title_tooltip' });
    }
    fields.push({ name: 'sig_darkmode', type: 'checkbox', label: 'sig_darkmode', default: true });
    return fields;
}

/** An object-ID attribute with a default from the sigenergy adapter. */
export function oidField(name: string, def?: string): RxWidgetInfoAttributesField {
    return def ? { name, type: 'id', label: name, default: def } : { name, type: 'id', label: name };
}

/**
 * Common base of all Sigenergy widgets.
 *
 * Object IDs that are widget attributes (type `id`) are subscribed by vis-2 and arrive in
 * `state.values`. Object IDs a widget derives itself (the SigenMicro devices, the DC
 * charger's running state and protocol version) are listed by `extraIds()` and subscribed
 * here through the socket; their values land in `state.extra`.
 */
export default abstract class SigWidget<
    TRxData extends SigRxData & Record<string, any>,
    TState extends SigState = SigState,
> extends (window.visRxWidget as typeof VisRxWidget)<TRxData, TState> {
    static adapter: string;

    private extraSubscribed: string[] = [];
    private sigMounted = false;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, extra: {} };
    }

    static getI18nPrefix(): string {
        return `${this.adapter || VIS_SET}_`;
    }

    /** Translation with the prefix of this widget set (`%s` placeholders are filled from args). */
    protected t(key: string, ...args: (string | number)[]): string {
        return (this.constructor as typeof SigWidget).t(key, ...args.map(a => String(a)));
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.sigMounted = true;
        injectStyles();
        void this.subscribeExtra();
    }

    componentWillUnmount(): void {
        this.sigMounted = false;
        this.unsubscribeExtra();
        super.componentWillUnmount();
    }

    onRxDataChanged(prevRxData: typeof this.state.rxData): void {
        super.onRxDataChanged?.(prevRxData);
        void this.subscribeExtra();
    }

    /** Derived object IDs this widget needs besides its attributes. */
    // eslint-disable-next-line class-methods-use-this
    protected extraIds(): string[] {
        return [];
    }

    /** The object ID configured in an attribute ('' if empty). */
    protected oid(attr: string): string {
        const v = (this.state.rxData as Record<string, unknown>)[attr];
        return typeof v === 'string' ? v.trim() : '';
    }

    /** Current value of the object ID configured in an attribute. */
    protected v(attr: string): StateVal {
        const id = this.oid(attr);
        return id ? (this.state.values[`${id}.val`] as StateVal) : undefined;
    }

    /** Current value of a derived object ID (falls back to an attribute subscription of the same ID). */
    protected ev(id: string): StateVal {
        if (!id) {
            return undefined;
        }
        if (Object.prototype.hasOwnProperty.call(this.state.extra, id)) {
            return this.state.extra[id];
        }
        return this.state.values[`${id}.val`] as StateVal;
    }

    /** Writes a value to the object ID of an attribute. Never in the editor: a click there selects the widget. */
    protected write(attr: string, val: ioBroker.StateValue): void {
        const id = this.oid(attr);
        if (id && !this.state.editMode) {
            this.props.context.setValue(id, val);
        }
    }

    protected dark(): boolean {
        return isDark(this.state.rxData.sig_darkmode);
    }

    protected title(fallbackKey: string): string {
        const t = this.state.rxData.sig_title;
        return typeof t === 'string' && t.trim() ? t : this.t(fallbackKey);
    }

    private async subscribeExtra(): Promise<void> {
        const ids = [...new Set(this.extraIds().filter(Boolean))];
        const same = ids.length === this.extraSubscribed.length && ids.every(id => this.extraSubscribed.includes(id));
        if (same) {
            return;
        }
        this.unsubscribeExtra();
        if (!ids.length) {
            return;
        }
        this.extraSubscribed = ids;
        try {
            // the socket client delivers the current value of every ID right after subscribing
            await this.props.context.socket.subscribeState(ids, this.onExtraState);
        } catch {
            // the values then arrive with the next change
        }
    }

    private unsubscribeExtra(): void {
        if (this.extraSubscribed.length) {
            try {
                this.props.context.socket.unsubscribeState(this.extraSubscribed, this.onExtraState);
            } catch {
                // already gone
            }
            this.extraSubscribed = [];
        }
    }

    private onExtraState = (id: string, state: ioBroker.State | null | undefined): void => {
        if (!this.sigMounted) {
            return;
        }
        const val = state ? state.val : null;
        (this.setState as unknown as (u: (s: SigState) => Partial<SigState>) => void)(s =>
            s.extra[id] === val ? {} : { extra: { ...s.extra, [id]: val } },
        );
    };
}
