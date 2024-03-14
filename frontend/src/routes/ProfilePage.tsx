import { Navigate } from "@solidjs/router";
import { Switch, Match, createEffect, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import Loader from "~/components/shared/Loader/Loader";
import Page from "~/components/shared/Page";
import UserForm from "~/components/shared/UserForm";
import auth from "~/globalState/auth";
import { validateUrl } from "~/lib/validateUrl";
import styles from "~/styles/routes/ProfilePage.module.scss"
import { DeleteSvg } from "~/svgs";
import { UploadBtn } from "~/components/ImageUploader/UploadBtn";
import { Popup } from "~/components/shared/Popup";
import { useUser, useUserMutation } from "~/data/user";
import { SubmitButton } from "~/components/shared/buttons/SubmitButton";
import { FormInput, FormTextarea } from "~/components/shared/FormInput";
import { compareObjects } from "../utils/compareObjects";
import { CharacterCounter } from "~/components/CharacterCounter";

type NewType = Parameters<ReturnType<typeof useUserMutation>['mutate']>[0];

const [state, setState] = createStore<NewType>({})

export default function PreferencesPage() {
    let ref!: HTMLFormElement

    const query = useUser(auth.user.username)
    const mutation = useUserMutation()

    createEffect(() => {
        query.data && setState(query.data)
    })
    const websiteErrors = createMemo(() => {
        if (!state.website || validateUrl(state.website)) return []
        return ["Invalid URL. Copy and paste your website here including the http(s)"]
    })
    const usernameErrors = createMemo(() => {
        const arr: string[] = []
        if (typeof state.username !== 'string') return arr
        if (state.username.length < 3 || state.username.length > 15)
            arr.push("Username must be between 3 and 15 characters");
        if (/\W/.test(state.username))
            arr.push("Username can only contain letters, numbers and underscores");
        return arr
    })
    const errored = () => websiteErrors().length > 0 || usernameErrors().length > 0;

    const hasNotChanged = () => compareObjects(state, query.data!)

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        const obj: NewType = {};
        let canSend = false
        for (const key in state) {
            // @ts-expect-error
            if (state[key] !== query.data?.[key]) {
                // @ts-expect-error
                obj[key] = state[key]
                canSend = true;
            }
        }
        obj.website ||= null;
        if (canSend)
            mutation.mutate(obj)
    }

    return (
        <Page title="Preferences">
            <Switch>
                <Match when={!auth.user.username}>
                    <Navigate href="/auth/login?redirect=%2Fprofile" />
                </Match>
                <Match when={query.isLoading}>
                    <Loader />
                </Match>
                <Match when={query.isError}>
                    {query.error?.message}
                </Match>
                <Match when={query.isSuccess}>
                    <div class={styles.profile}>
                        <div class={styles.userImages} style={{ 'background-image': `url(${query.data?.banner})` }}>
                            <UploadBtn path="banner" mutation={mutation} />
                            <button type="button">
                                <DeleteSvg />
                            </button>
                            <div class={styles.avatar} style={{ 'background-image': `url(${query.data?.avatar})` }}>
                                <UploadBtn path="avatar" mutation={mutation} />
                            </div>
                        </div>
                        <UserForm
                            ref={ref}
                            onsubmit={handleSubmit}>
                            <FormInput
                                name="username"
                                setter={setState}
                                disabled
                                minlength={3}
                                value={query.data?.username}
                                maxlength={15}
                                onchange={e => {
                                    e.target.value = e.target.value.trim().replace(/\s/g, '_').replace(/\W/g, "")
                                }}
                            />
                            <FormInput
                                name="displayName"
                                setter={setState}
                                value={query.data?.displayName}
                            />
                            <FormInput
                                name="location"
                                setter={setState}
                                required={false}
                                value={query.data?.location}
                            />
                            <FormTextarea
                                name="bio"
                                setter={setState}
                                required={false}
                                value={query.data?.bio}
                                maxLength={180}
                                oninput={e => setState('bio', e.target.value)}
                            />
                            <CharacterCounter inputLength={state.bio?.length ?? 0} max={180} />
                            <FormInput
                                name="website"
                                setter={setState}
                                type="url"
                                required={false}
                                validationErrors={websiteErrors()}
                                value={query.data?.website as string | undefined}
                            />
                            <SubmitButton
                                finished={mutation.isSuccess}
                                loading={mutation.isPending}
                                disabled={errored() || mutation.isPending || hasNotChanged()}
                            />
                        </UserForm>
                    </div>
                </Match>
            </Switch>
            <Popup
                close={mutation.reset}
                text={mutation.error?.message ?? ""}
                when={mutation.isError}
            />
        </Page>
    )
}