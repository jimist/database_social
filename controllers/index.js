const express = require('express')
const router = express.Router()

let auth = require('../middlewares/auth');
auth = auth.auth_user;

router.use('/account', require('./account'));
router.use('/post', require('./post'));
router.use('/hashtag', require('./hashtag'));
router.use('/user', require('./user'));
router.use('/search', require('./search'));
router.use('/analysor', require('./analysor'));
router.use('/admin', require('./admin'));

router.get('/', auth, (req, res, next) => {
    let token = req.cookies['user-token'];
    db.query(`SELECT * FROM users WHERE token='${token}'`, (err, result) => {
        let currentUser = result[0];
        db.query(`SELECT * FROM relationships WHERE type='follow' AND actor_id=${currentUser.id}`, (err, result) => {
            if(result.length>0){
                let userIds = [];
                result.forEach((tmpRel) => {
                    userIds.push(tmpRel.target_id);
                });
                let postFetchQuery = `SELECT * FROM posts WHERE user_id IN (${userIds.join(',')}) ORDER BY created_at DESC LIMIT 100`;
                db.query(postFetchQuery, (err, result) => {
                    if(result.length>0){
                        res.render('posts/list', {posts: result});
                    }else{
                        res.send('no posts yet!');
                    }

                });

            }else{
                res.send('not following anybody');
            }

        });
    });
});

module.exports = router;