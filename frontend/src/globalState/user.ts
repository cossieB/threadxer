import { jwtDecode } from "jwt-decode";
import { createStore } from "solid-js/store";

export type User = {
    username: string,
    email: string,
    avatar: string,
    banner: string,
    isUnverified: boolean,
    userId: string
}

const str = localStorage.getItem('user');

const storedUser: User = str ? JSON.parse(str) : {
    username: "",
    email: "",
    avatar: "",
    banner: "",
    isUnverified: false,
    userId: ""
}
export const [user, setUser] = createStore(storedUser)

export const [token, setToken] = createStore({
    jwt: "",
    decoded: () => {
        try {
            return jwtDecode(token.jwt)
        } catch (error) {
            return null
        }
    }
})