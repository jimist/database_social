const express = require('express')
const router = express.Router()

let auth = require('../middlewares/auth');
auth = auth.auth_user;

router.get('/hashtag', auth, (req, res, next) => {
    let hashtag = req.query.s
    if(hashtag.length>0)
        hashtag = hashtag.toLowerCase()
    else
        res.send('not valid')
    let following_users = '3, 4, 5';

    let hashtagSearchQuery = `SELECT * FROM posts WHERE LOWER(hashtags) like '%${hashtag}%' 
    AND type = 'original_post'
    ORDER BY 
    FIELD(user_id, ${following_users}) DESC,
    hashtags_count ASC,
    created_at DESC
    `;

    db.query(hashtagSearchQuery, (err, result) => {
        if(result.length>0){
            let contentArray;
            result.forEach((post, index) => {
                contentArray = post.content.split(" ");
                contentArray.forEach((value) => {
                    if (value[0] == "#") {
                        post.content = post.content.replace(value, `<a href='/hashtag/${value.substr(1)}'>${value.substr(1)}</a> `)
                    }
                });
                result[index] = post;
            });
            res.render('posts/list', {posts: result});
        }else{
            res.send('not found any match');
        }

    });


});

router.get('/user', auth, (req, res, next) => {
    let user = req.query.s
    if(user.length>0)
        user = user.toLowerCase()
    else
        res.send('not valid')

    let userSearchQuery = `SELECT * FROM users WHERE LOWER(username) like '%${user}%'`;

    db.query(userSearchQuery, (err, result) => {
       res.render('users/list', {users: result});
    });
});

module.exports = router;