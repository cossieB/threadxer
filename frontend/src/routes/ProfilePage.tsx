import { Navigate } from "@solidjs/router";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Switch, Match } from "solid-js";
import { createStore } from "solid-js/store";
import { CustomInput } from "~/components/CustomInput";
import { TextareaWithCounter } from "~/components/CustomTextarea";
import Loader from "~/components/shared/Loader/Loader";
import Page from "~/components/shared/Page";
import { SubmitButton } from "~/components/shared/SubmitButton";
import UserForm from "~/components/shared/UserForm";
import { user } from "~/globalState/user";
import { validateUrl } from "~/lib/validateUrl";
import styles from "~/styles/routes/ProfilePage.module.scss"
import { CloseSvg } from "~/svgs";
import { customFetch } from "~/utils/customFetcher";
import { UploadBtn } from "./UploadBtn";

type ApiUserResponse = {
    username: string;
    dateJoined: Date;
    bio: string;
    avatar: string;
    banner: string;
    displayName: string;
    dob?: Date,
    location: string
};

async function fetchUser(username: string) {
    const res = await fetch(`api/users/${username.toLowerCase()}`);
    if (!res.ok) {
        if (res.headers.get('Content-Type')?.includes('application/json')) {
            const data = await res.json();
            throw new Error(data.error);
        }
        else {
            throw new Error("Something went wrong. Please try again later.")
        }
    }
    if (res.ok) {
        return await res.json() as ApiUserResponse;
    }
}
async function mutateUser(e: SubmitEvent) {
    e.preventDefault()

    const fd = new FormData(e.target as HTMLFormElement);
    const res = await customFetch('/api/users', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(Object.fromEntries(fd))
    });
    if (!res.ok) {
        if (res.headers.get('Content-Type')?.includes("application/json"))
            throw new Error((await res.json()).error)
        else 
            throw new Error("Something went wrong. Please try again later")
    }
    
}

const [fieldErrors, setFieldErrors] = createStore({
    username: [] as string[],
    website: [] as string[],
})

export default function PreferencesPage() {
    const errored = () => Object.values(fieldErrors).flat().length > 0;
    const queryClient = useQueryClient()

    const data = createQuery(() => ({
        get enabled() {
            return !!user.username
        },
        queryKey: ['users', user.username.toLowerCase()],
        queryFn: (key) => fetchUser(key.queryKey[1]),
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    }))


    const mutation = createMutation(() => ({
        mutationFn: mutateUser,
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: ['users', user.username.toLowerCase()]
            })
        },
        onError(error, variables, context) {
            console.log(error)
        },
    }))

    return (
        <Page title="Preferences">
            <Switch>
                <Match when={!user.username}>
                    <Navigate href="/auth/login?redirect=%2Fprofile" />
                </Match>
                <Match when={data.isLoading}>
                    <Loader />
                </Match>
                <Match when={data.isError}>
                    {data.error?.message}
                </Match>
                <Match when={data.isSuccess}>
                    <div class={styles.profile}>
                        <div class={styles.userImages} style={{ 'background-image': `url(${data.data?.banner})` }}>
                            <UploadBtn />
                            <button type="button">
                                <CloseSvg />
                            </button>
                            <div class={styles.avatar} style={{ 'background-image': `url(${data.data?.avatar})` }}>
                                <UploadBtn />
                            </div>
                        </div>
                        <UserForm onsubmit={mutation.mutate}>
                            <CustomInput
                                name="username"
                                disabled
                                minlength={3}
                                value={data.data?.username}
                                maxlength={15}
                                onchange={e => {
                                    e.target.value = e.target.value.trim().replace(/\s/g, '_').replace(/\W/g, "")
                                }}
                            />
                            <CustomInput
                                name="displayName"
                                value={data.data?.displayName}
                            />
                            <CustomInput
                                name="location"
                                required={false}
                                value={data.data?.location}
                            />
                            <TextareaWithCounter
                                name="bio"
                                required={false}
                                value={data.data?.bio}

                                maxLength={180}
                            />
                            <CustomInput
                                name="website"
                                type="url"
                                required={false}
                                oninput={() => setFieldErrors('website', [])}
                                validatorFn={value => {
                                    if (!value)
                                        return setFieldErrors('website', [])
                                    const url = validateUrl(value)
                                    if (!url)
                                        setFieldErrors('website', ["Enter valid URL with starting with https"])

                                }}
                                validationErrors={fieldErrors.website}

                            />
                            <SubmitButton
                                finished={mutation.isSuccess}
                                loading={mutation.isPending}
                                disabled={errored()}
                            />
                        </UserForm>
                    </div>
                </Match>
            </Switch>
        </Page>
    )
}