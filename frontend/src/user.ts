import { createStore } from "solid-js/store";

export const [user, setUser] = createStore({
    username: "",
    email: "",
    avatar: "",
    banner: "",
})