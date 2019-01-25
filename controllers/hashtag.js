const express = require('express')
const router = express.Router()

router.get('/:name', (req, res, next) => {
    let hashtag = req.params.name;
    let following_users = '3, 4, 5';
    let hashtagSearchQuery = `SELECT * FROM posts WHERE (hashtags LIKE '%,${hashtag},%' 
    OR hashtags LIKE '%,${hashtag}' 
    OR hashtags LIKE '${hashtag},%') 
    AND type = 'original_post'
    ORDER BY 
    FIELD(user_id, ${following_users}) DESC,
    hashtags_count ASC,
    created_at DESC
    `;
    db.query(hashtagSearchQuery, (err, result) => {
        if(result.length>0){
            // res.send(result)
            res.render('posts/list', {posts: result});
        }else{
            res.send('hashtag not found!')
        }
    });

});

module.exports = router;