import { useSearchParams } from "@solidjs/router";
import { createInfiniteQuery, createQuery } from "@tanstack/solid-query";
import { CustomInput } from "~/components/CustomInput";
import { PostLists } from "~/components/PostLists";
import Page from "~/components/shared/Page";
import UserForm from "~/components/shared/UserForm";
import { SubmitButton } from "~/components/shared/buttons/SubmitButton";
import { trpcClient } from "~/trpc";

export function SearchPage() {
    let inputElem!: HTMLInputElement
    const [searchParams, setSearchParams] = useSearchParams()
    const q = () => searchParams.q ?? ""
    const hashtag = () => searchParams.hashtag

    const query = createInfiniteQuery(() => ({
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