import { JwtPayload, jwtDecode } from "jwt-decode";
import { createStore } from "solid-js/store";
import { firebaseAuth } from "../../firebase";
import { signInWithCustomToken } from "firebase/auth";

export type User = {
    username: string,
    email: string,
    avatar: string,
    banner: string,
    isUnverified: boolean,
    userId: string
}

class Auth {
    private readonly _user
    private readonly _setUser
    private readonly _setToken
    private readonly _token

    constructor() {
        const str = localStorage.getItem('user');
        const storedUser: User = str ? JSON.parse(str) : {
            username: "",
            email: "",
            avatar: "",
            banner: "",
            isUnverified: false,
            userId: ""
        }
        const [user, setUser] = createStore(storedUser);
        this._user = user
        this._setUser = setUser
        const [token, setToken] = createStore({
            jwt: "",
            decoded: () => {
                try {
                    return jwtDecode(token.jwt)
                } catch (error) {
                    return null
                }
            },
            firebase: ""
        })
        this._token = token
        this._setToken = setToken
    }
    createUser = (jwt: string) => {
        const decoded = jwtDecode<{ user: User } & JwtPayload>(jwt);
        this._setUser(decoded.user);
        localStorage.setItem('user', JSON.stringify(decoded.user));
        this._setToken({ jwt })
        return decoded.user
    }
    modifyUser = (partialUser: Partial<User>) => {
        const newUser = { ...this._user, ...partialUser }
        this._setUser(newUser)
        localStorage.setItem('user', JSON.stringify(newUser))
    }
    deleteUser = () => {
        const blankUser = {
            avatar: "",
            banner: "",
            email: "",
            username: "",
            isUnverified: false,
            userId: ""
        };
        this._setUser(blankUser)
        localStorage.removeItem('user')
        this._setToken("jwt", "")
        return blankUser
    }
    firebaseSignin = async (jwt: string) => {
        try {
            await signInWithCustomToken(firebaseAuth, jwt)
            this._setToken('firebase', jwt)
        } catch (error) {
            console.log(error)
        }
    }
    get user () {
        return this._user
    }
    get token() {
        return this._token
    }
}

export default new Auth()