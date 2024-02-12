import { FormInput } from '../../components/shared/FormInput';
import UserForm from '../../components/shared/UserForm';
import { createStore } from 'solid-js/store';
import { Popup } from '../../components/shared/Popup';
import { Validator } from '../../utils/Validator';
import { SubmitButton } from '../../components/shared/buttons/SubmitButton';
import { Navigate, useNavigate } from '@solidjs/router';
import { sendAuthRequest } from '~/utils/sendAuthRequest';
import { Show } from 'solid-js';
import auth from '~/globalState/auth';
import Page from '~/components/shared/Page';
import { useQueryClient } from '@tanstack/solid-query';
import { trpcClient } from '~/trpc';

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
    const queryClient = useQueryClient()

    async function handleSubmit(e: SubmitEvent) {
        setState('loading', true)
        e.preventDefault();

        await sendAuthRequest(
            () => trpcClient.auth.loginUser.mutate(userState),
            setState,
            navigate,
            queryClient
        )
    }
    return (
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
        </Page>
    );
}

