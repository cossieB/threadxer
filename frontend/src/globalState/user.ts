import { JwtPayload, jwtDecode } from "jwt-decode";
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

export function deleteUser() {
    const blankUser = {
        avatar: "",
        banner: "",
        email: "",
        username: "",
        isUnverified: false,
        userId: ""
    };
    setUser(blankUser)
    localStorage.removeItem('user')
    setToken("jwt", "")
    return blankUser
}
export function createUser(jwt: string) {
    const decoded = jwtDecode<{ user: User } & JwtPayload>(jwt);
    setUser(decoded.user);
    localStorage.setItem('user', JSON.stringify(decoded.user));
    setToken({ jwt })
    return decoded.user
}
