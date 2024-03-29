import { FormInput } from '../../components/shared/FormInput';
import UserForm from '../../components/shared/UserForm';
import { createStore } from 'solid-js/store';
import { createMemo } from 'solid-js';
import titleCase from '~/lib/titleCase';
import { Validator } from '../../utils/Validator';
import { SubmitButton } from '../../components/shared/buttons/SubmitButton';
import { sendAuthRequest } from '~/utils/sendAuthRequest';
import { useNavigate } from '@solidjs/router';
import Page from '~/components/shared/Page';
import { trpcClient } from '~/trpc';

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
            const res = await trpcClient.auth.checkAvailability.query({
                field,
                value: userState[field].toLowerCase()
            })

            if (!res.available)
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

        await sendAuthRequest(
            () => trpcClient.auth.signupUser.mutate(userState),
            setState,
            navigate,
        )
    }
    return (
        <Page title='Sign Up'>

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
        </Page>
    );
}