import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { FormInput } from "~/components/shared/FormInput";
import { SubmitButton } from "~/components/shared/SubmitButton";
import UserForm from "~/components/shared/UserForm";
import { user } from "~/globalState/user";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = createSignal(false)
    const [finished, setFinished] = createSignal(false)
    const [state, setState] = createStore({ verificationCode: "" })
    let ref!: HTMLInputElement
    createEffect(() => {
        const encoded = encodeURIComponent("/auth/verify")
        if (!user.username) navigate(`/auth/login?redirect=${encoded}`, { state: { message: "Please login to verify your account" } })
        if (user.isUnverified === false) navigate("/")
    })
    return (
        <main style={{ "text-align": 'center', 'padding-top': '25vh' }}>
            <h1 >Verify your e-mail address</h1>
            <p>Check your email for the verification code and enter it below.</p>
            <UserForm onsubmit={() => { }}            >

                <FormInput
                    name="verificationCode"
                    setter={setState}
                    oninput={e => setState('verificationCode', e.target.value)}
                />
                <SubmitButton
                    loading={isLoading()}
                    finished={finished()}
                    disabled={state.verificationCode.length < 6}
                />
            </UserForm>
        </main>
    )
}