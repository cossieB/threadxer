import { useSearchParams } from "@solidjs/router";
import { useInfiniteQuery, createQuery } from "@tanstack/solid-query";
import { CustomInput } from "#client/components/CustomInput.js";
import { PostLists } from "#client/components/PostLists.js";
import Page from "#client/components/shared/Page.js";
import UserForm from "#client/components/shared/UserForm.js";
import { SubmitButton } from "#client/components/shared/buttons/SubmitButton.js";
import { trpcClient } from "#client/trpc.js";

export function SearchPage() {
    let inputElem!: HTMLInputElement
    const [searchParams, setSearchParams] = useSearchParams()
    const q = () => typeof searchParams.q === "string" ? searchParams.q : ""
    const hashtag = () => searchParams.hashtag

    const query = useInfiniteQuery(() => ({
        queryKey: ['search', { q: q(), h: hashtag() }],
        enabled: q().length > 2 || !!hashtag(),
        queryFn: () => trpcClient.search.byTerm.query({
            term: q(),
            hashtag: hashtag() && "#" + hashtag()
        }),
        initialPageParam: 0,
        getNextPageParam: (last, _b, prev) => last.isLastPage ? null : prev + 1,
    }))
    return (
        <Page title="Search">
            <UserForm
                onsubmit={e => {
                    e.preventDefault();
                    setSearchParams({ 'q': inputElem.value })
                }}
            >
                <CustomInput
                    name='Search'
                    ref={inputElem}
                    value={q()}
                    required={false}
                />
                <SubmitButton
                    finished={false}
                    loading={query.isLoading}
                    text="Search"
                />
            </UserForm>
            <PostLists query={query} />
        </Page>
    )
}