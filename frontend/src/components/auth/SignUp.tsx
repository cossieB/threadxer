import { FormInput } from '../shared/FormInput';
import UserForm from '../UserForm';
import { createStore } from 'solid-js/store';
import { Popup } from '../Popup';

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
        usernameInput: "",
        fieldErrors: [] as {field: keyof typeof initialState, error: string}[]
    })
    
    async function handleLogin(e: SubmitEvent) {
        e.preventDefault();
        if (userState.password != userState.confirmPassword) {
            return setState('error', 'Passwords do not match');
        }
        try {
            setUserState({ ...initialState });
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setState('loading', false);
        }
    }
    return (
        <UserForm onsubmit={handleLogin}>
            <FormInput
                name='email'
                setter={setUserState}
                type='email'
            />
            <FormInput
                name='username'
                setter={setUserState}
                oninput={e => {
                    setUserState('username', e.target.value.replace(/\s/g, '_'))
                }}
                value={userState.username}
            />
            <FormInput
                name='password'
                setter={setUserState}
            />
            <FormInput
                name='confirmPassword'
                setter={setUserState}
            />
            <button type="submit">Signup</button>
            <Popup
                close={() => setState('error', null)}
                text={state.error!}
                when={!!state.error}
                colorDeg='270'
            />
        </UserForm>
    );
}

function StepTwo() {
    function handleNext() {

    }
    return (
        <UserForm onsubmit={handleNext}>
            
        </UserForm>
    )
}