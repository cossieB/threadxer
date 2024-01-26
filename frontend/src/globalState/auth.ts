import { JwtPayload, jwtDecode } from "jwt-decode";
import { createStore } from "solid-js/store";
import { firebaseAuth } from "../../firebase";
import { signInWithCustomToken, signOut } from "firebase/auth";

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
    private readonly setUser
    private readonly setToken
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
        this._user = user
        this.setUser = setUser
        this._token = token
        this.setToken = setToken
    }
    createUser = (jwt: string) => {
        const decoded = jwtDecode<{ user: User } & JwtPayload>(jwt);
        this.setUser(decoded.user);
        localStorage.setItem('user', JSON.stringify(decoded.user));
        this.setToken({ jwt }); 
        return decoded.user
    }
    modifyUser = (partialUser: Partial<User>) => {
        const newUser = { ...this._user, ...partialUser }
        this.setUser(newUser)
        localStorage.setItem('user', JSON.stringify(newUser))
    }
    deleteUser = async () => {
        signOut(firebaseAuth)
        const blankUser = {
            avatar: "",
            banner: "",
            email: "",
            username: "",
            isUnverified: false,
            userId: ""
        };
        this.setUser(blankUser)
        localStorage.removeItem('user')
        this.setToken("jwt", "")
        return blankUser
    }
    firebaseSignin = async (jwt: string) => {
        try {
            await signInWithCustomToken(firebaseAuth, jwt)
            this.setToken('firebase', jwt)
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