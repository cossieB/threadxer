import { useNavigate } from "@solidjs/router";
import { Index, Setter, createEffect, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Popup } from "~/components/shared/Popup";
import { SubmitButton } from "~/components/shared/SubmitButton";
import { createUser, user } from "~/globalState/user";
import styles from '~/styles/components/VerificationCode.module.scss'
import { customFetch } from "~/utils/customFetcher";
import { CodeBlock } from "./CodeBlock";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [state, setState] = createStore({
        submitting: false,
        finished: false,
        isResending: false,
        resendSuccessful: false,
        error: ""
    })
    const [code, setCode] = createStore(["", "", "", "", "", ""])
    const isDisabled = () => code.some(letter => !letter)

    async function handleSubmit() {
        const res = await customFetch('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: code.join('') })
        });
        if (!res.ok) {
            const data = await res.json()
            return setState('error', data?.error ?? "")
        }
        const data = await res.json();
        createUser(data.jwt)
        navigate("/profile")
    }
    async function handleResend() {
        setState('isResending', true);

        try {
            const response = await customFetch('/api/auth/verify')
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
                            <CodeBlock
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
                    onclick={handleSubmit}
                />
                <SubmitButton
                    loading={state.isResending}
                    finished={state.resendSuccessful}
                    text="Send Me Another"
                    type="button"
                    style={{ background: 'white', color: 'var(--blue1)' }}
                    onclick={handleResend}
                />
            </div>
            <Popup
                when={!!state.error}
                close={() => setState('error', "")}
                text={state.error}
            />
        </main>
    )
}
