import { Navigate } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { Switch, Match } from "solid-js";
import Loader from "~/components/shared/Loader/Loader";
import Page from "~/components/shared/Page";
import { user } from "~/globalState/user";

type ApiUserResponse = {
    username: string;
    dateJoined: Date;
    bio: string;
    avatar: string;
    banner: string;
    displayName: string;
};

async function fetchUser(username: string) {
    const res = await fetch(`api/users/${username.toLowerCase()}`);
    if (!res.ok) {
        if (res.headers.get('Content-Type') == 'application/json') {
            const data = await res.json();
            throw new Error(data.error)
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
    const data = createQuery(() => ({
        enabled: !!user.username,
        queryKey: ['users', user.username.toLowerCase()],
        queryFn: (key) => fetchUser(key.queryKey[1]),
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false
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
                <Match when={data.isSuccess}>
                    <img src={data.data?.banner} alt="" />

                </Match>
            </Switch>
        </Page>
    )
}