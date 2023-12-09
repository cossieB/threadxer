import { useNavigate } from "@solidjs/router";
import { Accessor, For, Index, Setter, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { FormInput } from "~/components/shared/FormInput";
import { SubmitButton } from "~/components/shared/SubmitButton";
import UserForm from "~/components/shared/UserForm";
import { user } from "~/globalState/user";
import { sleep } from "~/lib/sleep";
import styles from '~/styles/components/VerificationCode.module.scss'
import { customFetch } from "~/utils/customFetcher";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [state, setState] = createStore({
        submitting: false,
        finished: false,
        isResending: false,
        resendSuccessful: false
    })
    const [code, setCode] = createStore(["", "", "", "", "", ""])
    const isDisabled = () => code.some(letter => !letter)

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
    }
    async function handleResend() {
        setState('isResending', true);
        
        try {
            const response = await customFetch('/api/auth/resend', undefined, true)
            if (!response.ok) {
                // TODO handle error
                return
            }
            setState('resendSuccessful', true)
        } 
        catch (error) {
            
        }
        finally {
            setState('isResending', false)
        }
    }
    onMount(() => {
        document.querySelector<HTMLDivElement>(`.${styles.code}`)?.focus()
    })
    createEffect(() => {
        const encoded = encodeURIComponent("/auth/verify")
        if (!user.username) navigate(`/auth/login?redirect=${encoded}`, { state: { message: "Please login to verify your account" } })
        if (user.isUnverified === false) navigate("/")
    })
    return (
        <main class={styles.main}>
            <h1 >Verify your e-mail address</h1>
            <p>Check your email for the verification code and enter it below.</p>
            <div class={styles.form}>
                <div class={styles.row}>
                    <Index each={code}>
                        {(letter, i) =>
                            <Block
                                i={i}
                                letter={letter}
                                code={code}
                                setCode={setCode}
                            />
                        }
                    </Index>
                </div>
                <SubmitButton
                    loading={state.submitting}
                    finished={state.finished}
                    disabled={isDisabled()}
                />
                <SubmitButton
                    loading={state.isResending}
                    finished={state.resendSuccessful}
                    text="Send Me Another"
                    type="button"
                    style={{background: 'white', color: 'var(--blue1)'}}
                    onclick={handleResend}
                />
            </div>
        </main>
    )
}
type P = {
    letter: Accessor<string>
    i: number
    code: string[]
    setCode: Setter<string[]>
}
function Block(props: P) {
    let ref!: HTMLDivElement
    function handleInput(e: KeyboardEvent) {
        if (e.key == "Backspace" || e.key == "Delete") {
            //@ts-expect-error
            props.setCode(props.i, "")
            return
        }
        const next = ref.nextSibling as HTMLDivElement | null;
        const prev = ref.previousSibling as HTMLDivElement | null;
        if (e.key == "ArrowLeft") 
            return prev?.focus()
        if (e.key == "ArrowRight")
            return next?.focus()

        else if (/\D/.test(e.key)) return
        //@ts-expect-error
        props.setCode(props.i, e.key)
        if (next)
            next.focus()
        else
            document.querySelector('button')?.focus()

    }
    onMount(() => {
        ref.addEventListener('keyup', handleInput)
        onCleanup(() => ref.removeEventListener('keyup', handleInput))
    })
    return (
        <div
            ref={ref}
            tabIndex={0}
            onclick={() => ref.focus()}
            class={styles.code}
            innerText={props.code[props.i]}
        />
    )
}