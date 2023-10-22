import { FormInput } from '../shared/FormInput';
import UserForm from '../shared/UserForm';
import { createStore } from 'solid-js/store';
import { Popup } from '../shared/Popup';
import { Validator } from './Validator';
import SubmitButton from '../shared/SubmitButton';

const [userState, setUserState] = createStore({
    email: "",
    password: "",
})

export function Login() {
    const [state, setState] = createStore({
        error: null as null | string,
        loading: false,
        success: false
    })
    const error = () => {
        if (userState.email.length == 0)
            return []
        const validator = new Validator;
        validator.validateEmail(userState.email)
        return validator.errors.email
    }
    async function handleLogin(e: SubmitEvent) {
        e.preventDefault();
        try {
            setState('loading', true);
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userState)
            })
            const data = await res.json()
            if ('rf' in data) {
                localStorage.setItem('rf', data.rf)
                setState('success', true)
            }
            else if ('error' in data) {
                setState('error', data.error)
            }

        }
        catch (error) {
            console.log(error);
        }
        finally {
            setState('loading', false)
        }
    }
    return (
        <>
            <UserForm onsubmit={handleLogin}>
                <FormInput
                    name='email'
                    setter={setUserState}
                    type='email'
                    validationErrors={error()}
                />
                <FormInput
                    name='password'
                    setter={setUserState}
                    type='password'
                />
                <SubmitButton
                    loading={state.loading}
                    finished={state.success}
                    disabled={error().length > 0}
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
