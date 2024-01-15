import { useNavigate } from "@solidjs/router";
import { Index, createEffect, createMemo, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Popup } from "~/components/shared/Popup";
import { SubmitButton } from "~/components/shared/SubmitButton";
import styles from '~/styles/components/VerificationCode.module.scss'
import { CodeBlock } from "../../components/CodeBlock";
import { handleSubmit, handleResend } from "./Verify.fetcher";
import { Numberpad } from "./Numberpad";

const [state, setState] = createStore({
    submitting: false,
    finished: false,
    isResending: false,
    resendSuccessful: false,
    error: ""
})

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [code, setCode] = createStore({
        pointer: 0,
        splitUp: ["", "", "", "", "", ""],
        enterNumber(num: string) {
            setCode('splitUp', code.pointer, num.toString())
            setCode('pointer', prev => Math.min(5, prev + 1))
        },
        deleteNumber() {
            setCode('splitUp', code.pointer, "")
            setCode('pointer', prev => Math.max(0, prev - 1))
        },
        clear() {
            setCode('splitUp', ["", "", "", "", "", ""])
            setCode('pointer', 0)    
        }
    })
    const joined = createMemo(() => code.splitUp.join(""))
    const isDisabled = () => code.splitUp.some(letter => !letter)

    createEffect(() => {
        // const encoded = encodeURIComponent("/auth/verify")
        // if (!auth.user.username) navigate(`/auth/login?redirect=${encoded}`, { state: { message: "Please login to verify your account" } })
        // if (auth.user.isUnverified === false) navigate("/")
    })
    return (
        <main class={styles.main}>
            <h1 >Verify your e-mail address</h1>
            <p>Check your email for the verification code and enter it below.</p>
            <div class={styles.form}>
                <div class={styles.row}>
                    <Index each={code.splitUp}>
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
                <Numberpad
                    enterNumber={num => code.enterNumber(num)}
                    deleteNumber={code.deleteNumber}
                    clear={code.clear}
                    isMaxed={joined().length == 6}
                    isDisabled={state.submitting || state.isResending}
                />
                <SubmitButton
                    loading={state.submitting}
                    finished={state.finished}
                    disabled={isDisabled()}
                    onclick={() => handleSubmit(joined(), setState, navigate)}
                />
                <SubmitButton
                    loading={state.isResending}
                    finished={state.resendSuccessful}
                    text="Send Me Another"
                    type="button"
                    style={{ background: 'white', color: 'var(--blue1)' }}
                    onclick={() => handleResend(setState)}
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