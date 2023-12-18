import { FormInput } from '../../components/shared/FormInput';
import UserForm from '../../components/shared/UserForm';
import { createStore } from 'solid-js/store';
import { Popup } from '../../components/shared/Popup';
import { Validator } from '../../utils/Validator';
import { SubmitButton } from '../../components/shared/SubmitButton';
import { Navigate, useNavigate } from '@solidjs/router';
import { sendAuthRequest } from '~/utils/sendAuthRequest';
import { Show } from 'solid-js';
import { user } from '~/globalState/user';
import Page from '~/components/shared/Page';

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
        await sendAuthRequest('/api/auth/login', setState, userState, navigate)
    }
    return (
        <Show when={!user.username} fallback={<Navigate href="/" />}>
            <Page title='Log In'>
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
            </Page>
        </Show>
    );
}

