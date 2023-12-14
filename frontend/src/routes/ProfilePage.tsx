import { Navigate } from "@solidjs/router";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { Switch, Match } from "solid-js";
import { createStore } from "solid-js/store";
import { CustomInput, CustomTextarea } from "~/components/CustomInput";
import { FormInput, FormTextarea } from "~/components/shared/FormInput";
import Loader from "~/components/shared/Loader/Loader";
import Page from "~/components/shared/Page";
import { SubmitButton } from "~/components/shared/SubmitButton";
import UserForm from "~/components/shared/UserForm";
import { user } from "~/globalState/user";
import styles from "~/styles/routes/ProfilePage.module.scss"
import { CloseSvg, UploadSvg } from "~/svgs";

type ApiUserResponse = {
    username: string;
    dateJoined: Date;
    bio: string;
    avatar: string;
    banner: string;
    displayName: string;
    dob?: Date
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

export default function PreferencesPage() {
    let avatarSelector!: HTMLInputElement
    let bannerSelector!: HTMLInputElement;

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
    async function submitForm(e: SubmitEvent) {
        e.preventDefault()
    }
    const mutation = createMutation(() => ({
        mutationFn: submitForm
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
                            <button type="button" onclick={() => bannerSelector.click()}>
                                <UploadSvg />
                            </button>
                            <button type="button">
                                <CloseSvg />
                            </button>
                            <div class={styles.avatar} style={{ 'background-image': `url(${data.data?.avatar})` }}>
                                <button type="button" onclick={() => avatarSelector.click()}>
                                    <UploadSvg />
                                </button>
                            </div>
                            <input type="file" hidden ref={avatarSelector} accept="image/*" />
                            <input type="file" hidden ref={bannerSelector} accept="image/*" />
                        </div>
                        <UserForm onsubmit={mutation.mutate}>
                            <CustomInput
                                name="username"
                                minlength={3}
                                maxlength={15}
                                onchange={e => {
                                    e.target.value = e.target.value.trim().replace(/\s/g, '_').replace(/\W/g, "")
                                }}
                            />
                            <CustomInput name="displayName" />
                            <CustomTextarea
                                name="bio"
                                required={false}
                            />
                            <CustomInput name="location" />
                            <SubmitButton
                                finished={mutation.isSuccess}
                                loading={mutation.isPending}
                            />
                        </UserForm>
                    </div>
                </Match>
            </Switch>
        </Page>
    )
}