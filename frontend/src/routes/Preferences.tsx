import { createQuery } from "@tanstack/solid-query";
import { type Setter } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { FormInput } from "~/components/shared/FormInput";
import Page from "~/components/shared/Page";
import UserForm from "~/components/shared/UserForm";
import { user } from "~/globalState/user";
import { customFetch } from "~/utils/customFetcher";

async function fetchUser(username: string, setter: SetStoreFunction<{error: string}>) {
    const res = await customFetch(`api/users/${username.toLowerCase()}`)
    if (!res.ok) 
        setter('error', "Something Went Wrong. Please try again later")
    if (res.ok) {

    }
}

export default function PreferencesPage() {
    const data = createQuery(() => ({
        queryKey: ['users', user.username.toLowerCase()],
        queryFn: 
    }))

    return (
        <Page title="Preferences">
            <UserForm>
                <FormInput

                />
            </UserForm>
        </Page>
    )
}