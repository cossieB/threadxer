import { FormInput } from '../shared/FormInput';
import UserForm from '../shared/UserForm';
import { createStore } from 'solid-js/store';
import { Popup } from '../shared/Popup';
import { sleep } from '~/lib/sleep';
import { Show, createMemo } from 'solid-js';
import Loader from '../shared/Loader/Loader';
import titleCase from '~/lib/titleCase';
import { Validator } from './Validator';
import SubmitButton from '../shared/SubmitButton';

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
    const errored = createMemo(() => Object.values(state.fieldErrors).flat().length > 0)
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
                return
            }
            const data = await res.json();
            if ('available' in data && data.available === false)
                setState('fieldErrors', field, [`${titleCase(field)} not available`])
        }
        catch (error) {

        }
    }
    async function handleLogin(e: SubmitEvent) {
        e.preventDefault();
        if (errored())
            return
        try {
            setState('loading', true)
            const validator = new Validator;
            const errors = validator.validate(userState.username, userState.password, userState.confirmPassword, userState.email)
            const errorCount = Object.values(errors).flat().length;
            if (errorCount > 0)
                return setState('fieldErrors', errors)
            const res = await fetch('/api/auth/signup', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json"
                },
                body: JSON.stringify(userState)
            })
            setState('success', res.ok)
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setState('loading', false);
        }
    }
    return (
        <>
            <UserForm onsubmit={handleLogin}>
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
                close={() => setState('error', null)}
                text={state.error!}
                when={!!state.error}
                colorDeg='270'
            />
        </>
    );
}