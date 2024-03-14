import { For, type JSX, mergeProps, Show } from "solid-js";
import styles from "~/styles/components/form.module.scss"
import titleCase from "~/lib/titleCase";
import { type Require } from "~/lib/utilityTypes";
import { type ChangeEvent } from "~/lib/solidTypes";
import { type SetStoreFunction } from "solid-js/store";

function getOnChange<UserInputElement extends INPUTS>(props: Pick<Props<UserInputElement>, 'name' | 'setter'>) {
    return function onchange(e: ChangeEvent<UserInputElement>) {
        props.setter(props.name, e.target.value.trim());
    }
}
export function FormInput<T>(props: Props<HTMLInputElement, T>) {
    const merged = mergeProps({
        label: props.name,
        required: true,
        validationErrors: [] as string[]
    }, props)
    const errored = () => merged.validationErrors.length > 0
    return (
        <>
            <div class={styles.formControl} classList={{ [styles.error]: errored() }}>
                <input
                    {...props}
                    onchange={getOnChange(props)}
                    type={props.type ?? 'text'}
                    autocomplete="off"
                    name={merged.name} id={merged.name}
                    required={merged.required}
                    placeholder=" "
                    value={merged.value}
                />
                <label for={merged.name}>
                    {titleCase(merged.label)}
                    <Show when={merged.required}>*</Show>
                </label>
            </div>
            <Show when={merged.validationErrors.length > 0}>
                <ul>
                    <For each={merged.validationErrors}>
                        {error => <li> {error} </li>}
                    </For>
                </ul>
            </Show>
        </>
    )
}

export function FormTextarea<T>(props: Props<HTMLTextAreaElement, T>) {
    const merged = mergeProps({ label: props.name, required: true }, props)
    return (
        <div class={styles.formControl}>
            <textarea
                {...props}
                name={merged.name}
                onchange={getOnChange(props)}
                id={merged.name}
                required={merged.required}
                placeholder=" "
            />
            <label for={merged.name}>
                {titleCase(merged.label)}
                <Show when={merged.required}>*</Show>
            </label>
        </div>
    )
}

export function SelectInput(props: P) {
    const merged = mergeProps({ label: props.name, required: true }, props);
    return (
        <div class={styles.formControl}>
            <select name={merged.name} id={merged.name} onchange={getOnChange(props)}>
                <option value="" disabled selected={!props.default}>{titleCase(props.label)}</option>
                <For each={merged.arr}>
                    {item =>
                        <SelectOption
                            item={item}
                            default={merged.default}
                        />
                    }
                </For>
            </select>
        </div>
    )
}


function SelectOption(props: P1) {
    const value = typeof props.item == 'string' ? props.item : props.item.value
    const label = typeof props.item == 'string' ? props.item : props.item.label
    const selected = () => props.default === value
    return (
        <option
            value={value}
            selected={selected()}
        >
            {label}
        </option>
    )
}
type P = Require<InputProps<HTMLSelectElement>, 'name'> & {
    setter: SetStoreFunction<any>
    default?: string
    label: string
    arr:
    | string[]
    | {
        value: string,
        label: string
    }[]
}
type P1 = {
    item: P['arr'][number]
    default?: string
}
type INPUTS = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
type InputProps<X extends INPUTS> = JSX.InputHTMLAttributes<X>
type Props<X extends INPUTS = HTMLInputElement, Y = any> = InputProps<X> & {
    setter: SetStoreFunction<Y>,
    name: string & keyof Y,
    validationErrors?: string[]
}