SELECT post_id, json_agg(t)
FROM (
        SELECT post_id,            url,            is_video
        FROM media
    ) t
GROUP BY post_id