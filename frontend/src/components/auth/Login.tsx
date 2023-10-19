import { FormInput } from '../shared/FormInput';
import UserForm from '../UserForm';
import { createStore } from 'solid-js/store';
import { Popup } from '../Popup';

const initialState = {
    email: "",
    password: "",
    confirmPassword: "",
    error: null as null | string,
    loading: false,
    username: "",
    fullName: ""
}
const [state, setState] = createStore(initialState)

export function Login() {
    async function handleLogin(e: SubmitEvent) {
        e.preventDefault();
        try {
            const res = await signInWithEmailAndPassword(auth, state.email, state.password);
            console.log(res);
            setState({ ...initialState });
        }
        catch (error) {
            console.log(error);
        }
    }
    return (
        <UserForm onsubmit={handleLogin}>
            <FormInput
                name='email'
                setter={setState} />
            <FormInput
                name='password'
                setter={setState} />
            <Popup
                close={() => setState('error', null)}
                text={state.error!}
                when={!!state.error}
                colorDeg='270'
            />
            <button type="submit">Login</button>
        </UserForm>
    );
}
