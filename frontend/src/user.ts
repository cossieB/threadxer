import { createStore } from "solid-js/store";

type U = {
    username: string,
    email: string,
    avatar: string,
    banner: string
}

const str = localStorage.getItem('user')

const storedUser: U = str ? JSON.parse(str) : {
    username: "",
    email: "",
    avatar: "",
    banner: "",
}
export const [user, setUser] = createStore(storedUser)