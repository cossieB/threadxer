import { FormInput } from '../../components/shared/FormInput';
import UserForm from '../../components/shared/UserForm';
import { createStore } from 'solid-js/store';
import { Popup } from '../../components/shared/Popup';
import { Show, createMemo } from 'solid-js';
import titleCase from '~/lib/titleCase';
import { Validator } from '../../utils/Validator';
import { SubmitButton } from '../../components/shared/SubmitButton';
import { sendAuthRequest } from '~/utils/sendAuthRequest';
import { Navigate, useNavigate } from '@solidjs/router';
import { user } from '~/globalState/user';

const initialState = {
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
}
const [userState, setUserState] = createStore(initialState)

export function SignUp() {
    const [state, setState] = createStore({
        loading: false,
        error: null as null | string,
        success: false,
        fieldErrors: {
            username: [] as string[],
            password: [] as string[],
            confirmPassword: [] as string[],
            email: [] as string[]
        }
    })
    const errored = createMemo(() => Object.values(state.fieldErrors).flat().length > 0);
    const navigate = useNavigate()

    async function checkAvailability(field: 'email' | 'username') {
        try {
            const res = await fetch('/api/auth/availability', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ [field]: userState[field] })
            })
            if (!res.ok) {
                // TODO: handle server error 
                return
            }

            const data = await res.json();
            if ('available' in data && data.available === false)
                setState('fieldErrors', field, [`${titleCase(field)} not available`])
        }
        catch (error) {
            // TODO: handle fetch errors
        }
    }
    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (errored())
            return

        const validator = new Validator;
        const errors = validator.validate(userState.username, userState.password, userState.confirmPassword, userState.email)
        const errorCount = Object.values(errors).flat().length;
        if (errorCount > 0)
            return setState('fieldErrors', errors)
        await sendAuthRequest('/api/auth/signup', setState, userState, navigate);
    }
    return (
        <Show when={!user.username} fallback={<Navigate href="/" />}>
            <UserForm onsubmit={handleSubmit}>
                <FormInput
                    name='email'
                    setter={setUserState}
                    type='email'
                    validationErrors={state.fieldErrors.email}
                    oninput={() => {
                        setState('fieldErrors', 'email', [])
                    }}
                    onblur={() => {
                        if (userState.email.length === 0)
                            return
                        const validator = new Validator;
                        validator.validateEmail(userState.email)
                        if (validator.isInvalid)
                            setState('fieldErrors', validator.errors)
                        else
                            checkAvailability('email')
                    }}
                />
                <FormInput
                    name='username'
                    setter={setUserState}
                    oninput={e => {
                        setState('fieldErrors', 'username', [])
                        setUserState('username', e.target.value.replace(/\s/g, '_').replace(/\W/g, ""))
                    }}
                    value={userState.username}
                    validationErrors={state.fieldErrors.username}
                    onblur={() => {
                        setUserState('username', prev => prev.replace(/\s/g, '_').replace(/\W/g, ""));
                        if (userState.username.length == 0)
                            return;
                        const validator = new Validator;
                        validator.validateUsername(userState.username)
                        if (validator.isInvalid)
                            setState('fieldErrors', validator.errors)
                        else
                            checkAvailability('username')
                    }}
                />
                <FormInput
                    name='password'
                    setter={setUserState}
                    validationErrors={state.fieldErrors.password}
                    oninput={() => {
                        setState('fieldErrors', {
                            password: [],
                            confirmPassword: []
                        })
                    }}
                    type='password'
                />
                <FormInput
                    name='confirmPassword'
                    setter={setUserState}
                    validationErrors={state.fieldErrors.confirmPassword}
                    oninput={() => {
                        setState('fieldErrors', {
                            password: [],
                            confirmPassword: []
                        })
                    }}
                    type='password'
                />
                <SubmitButton
                    disabled={errored()}
                    finished={state.success}
                    loading={state.loading}
                    text='Sign Up'
                />
            </UserForm>
            <Popup
                close={() => setState({ error: null })}
                text={state.error || (state.success && `Success! A confirmation link has been sent to ${userState.email}. Please click on the link in the email.`) || ""}
                when={!!state.error || state.success}
                colorDeg='270'
            />
        </Show>
    );
}