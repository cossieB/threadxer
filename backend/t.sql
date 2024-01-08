with "l" as (
    select "post_id",
        count(*) as "like_count"
    from "likes"
    group by "likes"."post_id"
),
"r" as (
    select "post_id",
        count(*) as "repost_count"
    from "reposts"
    group by "reposts"."post_id"
),
"rp" as (
    select "reposts"."repost_id",
        "reposts"."user_id",
        "reposts"."post_id",
        "reposts"."date_created",
        "posts"."post_id",
        "users"."username"
    from "reposts"
        inner join "posts" on "reposts"."post_id" = "posts"."post_id"
        inner join "users" on "users"."user_id" = "reposts"."user_id"
    where "users"."username_lower" = 'quoter'
)
select "posts"."post_id",
    "posts"."user_id",
    "posts"."text",
    "posts"."date_created",
    "posts"."views",
    "posts"."reply_to",
    "posts"."did_reply",
    "posts"."quoting",
    "posts"."did_quote",
    "users"."user_id",
    "users"."username",
    "users"."avatar",
    "users"."avatar",
    "users"."display_name",
    "qa"."username",
    "qa"."avatar",
    "qa"."avatar",
    "qa"."display_name",
    "q"."post_id",
    "q"."user_id",
    "q"."text",
    "q"."date_created",
    "q"."views",
    "q"."reply_to",
    "q"."did_reply",
    "q"."quoting",
    "q"."did_quote",
    "opa"."username",
    "opa"."avatar",
    "opa"."avatar",
    "opa"."display_name",
    "op"."post_id",
    "op"."user_id",
    "op"."text",
    "op"."date_created",
    "op"."views",
    "op"."reply_to",
    "op"."did_reply",
    "op"."quoting",
    "op"."did_quote",
    COALESCE ("like_count"::INT, 0),
    COALESCE ("repost_count"::INT, 0),
    "reposts"."date_created" is not null
from "posts"
    inner join "users" on "users"."user_id" = "posts"."user_id"
    left join "l" on "posts"."post_id" = "l"."post_id"
    left join "r" on "posts"."post_id" = "r"."post_id"
    left join "posts" "q" on "q"."post_id" = "posts"."quoting"
    left join "users" "qa" on "q"."user_id" = "qa"."user_id"
    left join "posts" "op" on "op"."post_id" = "posts"."reply_to"
    left join "users" "opa" on "op"."user_id" = "opa"."user_id"
    left join "reposts" on "reposts"."post_id" = "posts"."post_id" -- params: ["quoter"]