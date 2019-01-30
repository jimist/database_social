const express = require('express')
const router = express.Router()

let auth = require('../middlewares/auth');
auth = auth.auth_analysor;

router.get('/list/follow_back', auth, (req, res, next) => {
    let followBackCountQuery = `
    SELECT COUNT(*) as count, r1.target_id as user_id
    FROM relationships as r1, relationships as r2
    WHERE r1.type='follow' and r2.type='follow'
    and r2.target_id=r1.actor_id and r1.target_id=r2.actor_id
    GROUP BY r1.target_id 
    HAVING count>0
    `;

    db.query(followBackCountQuery, (err, result) => {
       if(result.length>0){
           usersFollowBackCounts = {};
           let userIdsToCheck = [];
           result.forEach((res) => {
               usersFollowBackCounts[res.user_id] = res.count;
               userIdsToCheck.push(res.user_id);
           });
           db.query(`SELECT * FROM users WHERE id IN (${userIdsToCheck.join(',')})`, (err, result) => {
               let usersToShow = [];
               result.forEach((tmpUser) => {
                    if(usersFollowBackCounts[tmpUser.id]==tmpUser.followers_count){
                        usersToShow.push(tmpUser);
                    }
               });
               res.render('users/list', {users: usersToShow})
           });
       }else{
           res.send('no body has followed back anybody!')
       }
    });
});

router.get('/list/elite_users', auth, (req, res, next) => {
    let getAllWhoPostEachDay = `
        select T.user_id as user_id from 
        (
        select user_id, count(*) as days_count from
        (
        SELECT user_id as user_id, count(*) as post_count
        FROM posts 
        GROUP BY user_id, round(created_at/86400)
        HAVING count(*)>0
        )tt
        GROUP BY tt.user_id
        )T, users as U
        WHERE T.user_id=U.id and round((NOW()-U.created_at)/86400)<=T.days_count
    `;

    db.query(getAllWhoPostEachDay, (err, result) => {
        if(result.length>0){
            let usersList = [];
            result.forEach((val) => {
               usersList.push(val.user_id);
            });


            let getUsersWithValidFollwingsCount = `
                select * from (
                SELECT actor_id as actor_id, count(*) as valid_follow_count FROM relationships
                where type='follow' and target_id IN (${usersList.join(',')})
                GROUP BY actor_id
                )T, users as U where T.actor_id=U.id and T.valid_follow_count=U.followings_count
            `;

            db.query(getUsersWithValidFollwingsCount, (err, result) => {
               if(result.length>0){
                   res.render('users/list', {users: result});
               } else{
                   res.send('no user who only follows users with one post every day!');
               }
            });
        }else{
            res.send("no user who post every day!");
        }
    });



});

module.exports = router;