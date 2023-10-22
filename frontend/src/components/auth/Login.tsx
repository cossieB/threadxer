import { FormInput } from '../shared/FormInput';
import UserForm from '../shared/UserForm';
import { createStore } from 'solid-js/store';
import { Popup } from '../shared/Popup';
import { Validator } from './Validator';
import SubmitButton from '../shared/SubmitButton';
import { sendAuthRequest } from '../../utils/sendAuthRequest';

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
    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        await sendAuthRequest('/api/auth/login', setState, userState);
    }
    return (
        <>
            <UserForm onsubmit={handleSubmit}>
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

