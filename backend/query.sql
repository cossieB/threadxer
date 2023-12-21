WITH l AS (
    SELECT count(*) as c, post_id FROM likes
    GROUP BY post_id
)


SELECT 
    posts.*, COALESCE(l.c, 0) as likes 
FROM
    posts
LEFT JOIN
    l
USING
   ( post_id)