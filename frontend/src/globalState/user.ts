import { createStore } from "solid-js/store";

export type User = {
    username: string,
    email: string,
    avatar: string,
    banner: string,
    isUnverified: boolean
}

const str = localStorage.getItem('user')

const storedUser: User = str ? JSON.parse(str) : {
    username: "",
    email: "",
    avatar: "",
    banner: "",
    isUnverified: true
}
export const [user, setUser] = createStore(storedUser)