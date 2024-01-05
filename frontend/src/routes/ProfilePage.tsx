import { Navigate } from "@solidjs/router";
import { Switch, Match } from "solid-js";
import { createStore } from "solid-js/store";
import { CustomInput } from "~/components/CustomInput";
import { TextareaWithCounter } from "~/components/CustomTextarea";
import Loader from "~/components/shared/Loader/Loader";
import Page from "~/components/shared/Page";
import { SubmitButton } from "~/components/shared/SubmitButton";
import UserForm from "~/components/shared/UserForm";
import auth from "~/globalState/auth";
import { validateUrl } from "~/lib/validateUrl";
import styles from "~/styles/routes/ProfilePage.module.scss"
import { DeleteSvg } from "~/svgs";
import { UploadBtn } from "../components/ImageUploader/UploadBtn";
import { Popup } from "~/components/shared/Popup";
import { useUser } from "~/data/user";

const [fieldErrors, setFieldErrors] = createStore({
    username: [] as string[],
    website: [] as string[],
})

export default function PreferencesPage() {
    const errored = () => Object.values(fieldErrors).flat().length > 0;
    const {query, imageMutation, mutation} = useUser(auth.user.username)

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
                            <UploadBtn path="banner" mutation={imageMutation} />
                            <button type="button">
                                <DeleteSvg />
                            </button>
                            <div class={styles.avatar} style={{ 'background-image': `url(${query.data?.avatar})` }}>
                                <UploadBtn path="avatar" mutation={imageMutation} />
                            </div>
                        </div>
                        <UserForm onsubmit={mutation.mutate}>
                            <CustomInput
                                name="username"
                                disabled
                                minlength={3}
                                value={query.data?.username}
                                maxlength={15}
                                onchange={e => {
                                    e.target.value = e.target.value.trim().replace(/\s/g, '_').replace(/\W/g, "")
                                }}
                            />
                            <CustomInput
                                name="displayName"
                                value={query.data?.displayName}
                            />
                            <CustomInput
                                name="location"
                                required={false}
                                value={query.data?.location}
                            />
                            <TextareaWithCounter
                                name="bio"
                                required={false}
                                value={query.data?.bio}

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
                                value={query.data?.website}
                            />
                            <SubmitButton
                                finished={mutation.isSuccess}
                                loading={mutation.isPending}
                                disabled={errored() || imageMutation.isPending || mutation.isPending}
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
            <Popup
                close={imageMutation.reset}
                text={imageMutation.error?.message ?? ""}
                when={imageMutation.isError}
            />
        </Page>
    )
}