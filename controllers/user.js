const express = require('express')
const router = express.Router()

let auth = require('../middlewares/auth');
auth = auth.auth_user;

router.get('/:username', auth, (req, res, next) => {
    let username = req.params.username;
    let token = req.cookies['user-token'];
    db.query(`SELECT * FROM users WHERE username='${username}' OR token='${token}'`, (err, result) => {
        if (result.length > 0) {
            let visiter, targetUser;
            result.forEach((tempUser) => {
                if (tempUser.token == token) {
                    visiter = tempUser;
                }
                if (tempUser.username == username) {
                    targetUser = tempUser
                }
            });

            db.query(`SELECT * FROM relationships WHERE ((actor_id=${visiter.id} AND target_id=${targetUser.id}) 
             OR (target_id=${visiter.id} AND actor_id=${targetUser.id})) AND type='block'`, (err, result) => {
                if (result.length > 0) {
                    res.render('errors/404')
                } else {
                    db.query(`SELECT * FROM posts WHERE user_id=${targetUser.id}`, (err, result) => {

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

                        res.render('users/show', {
                            user: targetUser,
                            posts: result,
                        });
                    });
                }
            });

        }

    });
});

router.get('/:username/followers', auth, (req, res, next) => {
    let username = req.params.username;
    let token  = req.cookies['user-token'];

    db.query(`SELECT * FROM users WHERE username = '${username}' OR token='${token}'`, (err, result) => {
        let user;
        let currentUser;
        result.forEach((tmpUser) => {
           if(tmpUser.username == username) user = tmpUser;
           if(tmpUser.token == token) currentUser = tmpUser;
        });
        db.query(`SELECT * FROM relationships WHERE target_id=${user.id}`, (err, result) => {
            let follwerUserIdList = [];
            result.forEach((tempRel) => {
               follwerUserIdList.push(tempRel.actor_id);
            });

            db.query(`SELECT * FROM users WHERE id IN (${follwerUserIdList.join(",")})`, (err, result) => {
                let followerUserList = result;
                if(followerUserList.length>0) {
                    db.query(`SELECT * FROM relationships WHERE type='follow' AND actor_id=${currentUser.id} AND target_id IN (${follwerUserIdList.join(",")})`, (err, result) => {
                        if (!(result.length > 0)) {
                            followerUserList.forEach((tempFollowList, index) => {
                                tempFollowList.follow_status = 'not';
                                if(tempFollowList.id == currentUser.id){
                                    tempFollowList.follow_status = 'follow';
                                }
                                followerUserList[index] = tempFollowList;
                            });
                        } else {
                            let userIds = [];
                            result.forEach((tempUser) => {
                                userIds.push(tempUser.target_id);
                            });

                            followerUserList.forEach((tempFollowList, index) => {
                                if(userIds.includes(tempFollowList.id) || tempFollowList.id == currentUser.id){
                                    tempFollowList.follow_status = 'follow';
                                }else{
                                    tempFollowList.follow_status = 'not';
                                }
                                followerUserList[index] = tempFollowList;
                            });
                        }
                        res.render('users/list', {users: followerUserList});
                    });
                }else{
                    res.render('users/list', {users: []});
                }
            });
        });
    });
});

router.get('/:username/followings', auth, (req, res, next) => {
    let username = req.params.username;
    let token  = req.cookies['user-token'];

    db.query(`SELECT * FROM users WHERE username = '${username}' OR token='${token}'`, (err, result) => {
        let user;
        let currentUser;
        result.forEach((tmpUser) => {
            if(tmpUser.username == username) user = tmpUser;
            if(tmpUser.token == token) currentUser = tmpUser;
        });
        db.query(`SELECT * FROM relationships WHERE actor_id=${user.id}`, (err, result) => {
            let follwerUserIdList = [];
            result.forEach((tempRel) => {
                follwerUserIdList.push(tempRel.target_id);
            });

            db.query(`SELECT * FROM users WHERE id IN (${follwerUserIdList.join(",")})`, (err, result) => {
                let followerUserList = result;
                if(followerUserList.length>0) {
                    db.query(`SELECT * FROM relationships WHERE type='follow'
                     AND actor_id=${currentUser.id} 
                     AND target_id IN (${follwerUserIdList.join(",")})`, (err, result) => {
                        if (!(result.length > 0)) {
                            followerUserList.forEach((tempFollowList, index) => {
                                tempFollowList.follow_status = 'not';
                                if(tempFollowList.id == currentUser.id){
                                    tempFollowList.follow_status = 'follow';
                                }
                                followerUserList[index] = tempFollowList;
                            });
                        } else {
                            let userIds = [];
                            result.forEach((tempUser) => {
                                userIds.push(tempUser.target_id);
                            });
                            followerUserList.forEach((tempFollowList, index) => {
                                if(userIds.includes(tempFollowList.id) || tempFollowList.id == currentUser.id){
                                    tempFollowList.follow_status = 'follow';
                                }else{
                                    tempFollowList.follow_status = 'not';
                                }
                                followerUserList[index] = tempFollowList;
                            });
                        }
                        res.render('users/list', {users: followerUserList});
                    });
                }else{
                    res.render('users/list', {users: []});
                }
            });
        });
    });
});

router.get('/:username/follow', auth, (req, res, next) => {
    let token = req.cookies['user-token'];
    let targetUsername = req.params.username;
    let targetUser;
    let currentUser;
    let now = new Date().getTime();

    db.query(`SELECT * FROM users WHERE token='${token}' OR username='${targetUsername}'`, (err, result) => {
        // if(tempUser.username = targetUsername){
        if (result.length > 0) {
            result.forEach((tempUser) => {
                //     targetUser = tempUser;
                if (tempUser.token == token) {
                    currentUser = tempUser;
                }
                if (tempUser.username == targetUsername) {
                    targetUser = tempUser;
                }
            });
            // res.send(targetUser)
            // res.send('s')

            // }
            let relCheck = `SELECT * FROM relationships WHERE  
           (type='block' AND actor_id=${targetUser.id} AND target_id=${currentUser.id}) 
            OR 
           (type='block' AND actor_id=${currentUser.id} AND target_id=${targetUser.id}) 
            OR
           (type='follow' AND actor_id=${currentUser.id} AND target_id=${targetUser.id}) 
           `;

            db.query(relCheck, (err, result) => {
                if (result.length > 0) {
                    let block = 0;
                    let follow = 0;

                    result.forEach((rel) => {
                        if (rel.type == 'block') block++;
                        if (rel.type == 'follow') follow++;
                    });
                    if (block > 0) {
                        res.send('cant see');
                    } else if (follow > 0) {
                        res.send('already followed');
                    }
                }

                db.query(`INSERT INTO relationships(actor_id, target_id, type, created_at, updated_at) 
                VALUES(${currentUser.id}, ${targetUser.id}, 'follow', ${now}, ${now})`, (err, result) => {
                            db.query(`UPDATE users SET followings_count=followings_count+1 WHERE id=${currentUser.id}`, (err, result) => {
                                db.query(`UPDATE users SET followers_count=followers_count+1 WHERE id=${targetUser.id}`, (err, result) => {
                                    res.send("followed")
                                });
                            })
                        });
            });

        }
    });
});

router.get('/:username/block', auth, (req, res, next) => {
});

router.get('/:username/unfollow', auth, (req, res, next) => {
});

module.exports = router;