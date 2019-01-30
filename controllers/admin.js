const express = require('express')
const router = express.Router()

let auth = require('../middlewares/auth');
auth = auth.auth_admin;

router.get('/gossip_users', auth, (req, res, next) => {
    let getUsersWithHighCommentsPerPost = `
        select * from (select tt.user_id as user_id from
        (
        SELECT user_id as user_id, count(*) as comment_per_post FROM posts 
        where type='comment'
        group by reply_to, user_id
        having count(id)>9
        )tt group By user_id
        having count(tt.user_id)>2)T,  users as U
        where U.id=T.user_id
    `;

    db.query(getUsersWithHighCommentsPerPost, (err, result) => {
       if(result.length>0){
           res.render('users/list', {users: result});
       } else {
           res.send('no such users!')
       }
    });
});

router.get('/fake_users', auth, (req, res, next) => {

    let fakeLikeGetListQuery = `
    select * from (select t1.actor_id as user_id
    from (select l.user_id as actor_id, a.user_id as target_id, count(*) as total_likes
    from likes as l, posts as a
    where l.post_id=a.id
    group by actor_id, target_id)t1, (
    select l.user_id as actor_id, a.user_id as target_id, count(*) as total_likes
    from likes as l, posts as a
    where l.post_id=a.id
    group by actor_id
    )t2 where t1.actor_id=t2.actor_id and t1.total_likes>=(t2.total_likes/2)
    )T, users as U
    where U.id=T.user_id and (U.posts_count / ((NOW() - U.created_at)/86400))<0.1
    group by T.user_id
    `;

    db.query(fakeLikeGetListQuery, (err, result) => {
        if(result.length>0){
            res.render('users/list', {users: result});
        }else{
            res.send('no such user found!')
        }

    });
});

module.exports = router;