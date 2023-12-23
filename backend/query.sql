WITH l AS (
    SELECT count(*) as c, post_id FROM likes
    GROUP BY post_id
)


-- SELECT 
--     posts.*, COALESCE(l.c, 0) as likes 
-- FROM
--     posts
-- LEFT JOIN
--     l
-- USING
--    ( post_id)

SELECT  posts.*, users.username, COALESCE (l.c, 0) as "likes", likes.user_id IS NOT NULL as "liked"
FROM  posts
INNER JOIN users USING (user_id)
LEFT JOIN likes ON posts.post_id = likes.post_id AND likes.user_id = 'fd3a761a-c52c-4106-8ce3-8c692d82c34a'
LEFT JOIN l ON posts.post_id = l.post_id
