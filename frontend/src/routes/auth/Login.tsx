import { FormInput } from '../../components/shared/FormInput';
import UserForm from '../../components/shared/UserForm';
import { createStore } from 'solid-js/store';
import { Popup } from '../../components/shared/Popup';
import { Validator } from '../../utils/Validator';
import { SubmitButton } from '../../components/shared/SubmitButton';
import { useNavigate } from '@solidjs/router';
import { sendAuthRequest } from '~/utils/sendAuthRequest';

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
    const navigate = useNavigate()

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        const isSuccess = await sendAuthRequest('/api/auth/login', setState, userState)
        if (isSuccess) navigate('/')
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

