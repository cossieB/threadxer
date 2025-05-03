import { createStore } from "solid-js/store";

type E = {
    message: string
    time: number,
}

export const [errors, setErrors] = createStore({
    list: [] as E[],
    addError: (message: string) => {
        const idx = errors.list.findIndex(x => x.message === message)
        if (idx === -1) {
            setErrors('list', prev => [...prev, {message, time: 0}])
        }
        else {
            setErrors('list', idx, {time: 0})
        }
    },
    removeError: (msg: string) => {
        setErrors('list', prev => prev.filter(x => x.message != msg))
    }
})

