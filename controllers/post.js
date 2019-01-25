const express = require('express')
const router = express.Router()

router.get('/new', (req, res, next) => {
    res.render('posts/form')
});

router.get('/:id/reply', (req, res, next) => {
    res.render('posts/form');
});

router.post('/:id/reply', (req, res, next) => {
    let text = req.body.text;
    let token = req.cookies['user-token'];
    let postId = req.params.id;

    let checkTokenQuery = `SELECT * FROM users where token= '${token}'`;
    db.query(checkTokenQuery, (err, result) => {
        let user = result[0];
        let userId = user.id;

        let checkPostExist = `SELECT * FROM posts where user_id=${userId} and content='${text}' AND reply_to=${postId}`;
        db.query(checkPostExist, (err, result) => {
            if (result.length > 0) {
                res.redirect('/post/' + result[0].id + '/view');
            } else {
                //insert new post
                let now = new Date().getTime();

                //get hashtags from text
                let textArray = text.split(' ');
                let hashtagCount = 0;
                let hashtags = "";
                let hashtagCheck = [];
                textArray.forEach((value) => {
                    if (value[0] == "#") {
                        hashtagCount++;
                        hashtags += value.substr(1) + ",";
                        hashtagCheck.push(value.substr(1));
                    }
                });

                if (hashtags < 2) res.send('not enough hashtags!');
                if (hashtagCount > 0) hashtags = hashtags.substr(0, hashtags.length - 1);
                let insertNewPost = `INSERT INTO posts(user_id, type, content, reply_to, hashtags_count, hashtags, created_at, updated_at) VALUES(${userId}, 'reply', '${text}', ${postId}, ${hashtagCount}, '${hashtags}', ${now}, ${now})`;

                db.query(insertNewPost, (err, result) => {
                    if (result.length > 0) {
                        db.query(`UPDATE posts SET replies_count=replies_count+1 WHERE id=${postId}`, (err, result) => {
                            // let postId = result.insertId;
                            res.redirect('/post/' + postId + '/view');
                        });
                    }
                });

                // db.query(`SELECT * FROM hashtags WHERE name IN (${hashtags})`, (err, result) => {
                //     if (result && result.length > 0) {
                //         //check which to insert
                //     }
                //     let insertHashtagsQuery = `INSERT INTO hashtags(name) VALUES(('${hashtags.split(',').join("'),('")}'))`;
                //
                //     db.query(insertHashtagsQuery , (err, result) => {
                //
                //         if (result.length > 0) {
                //             //TODO: get hashtag IDs and insert if not exist
                //             let hashtagIds = "";
                //
                //         }
                //     });
                //
                // });
            }
        });

    });
    // res.render('posts/form')
});

router.post('/new', (req, res, next) => {
    let text = req.body.text;
    let token = req.cookies['user-token'];

    let checkTokenQuery = `SELECT * FROM users where token= '${token}'`;
    db.query(checkTokenQuery, (err, result) => {
        let user = result[0];
        let userId = user.id;

        let checkPostExist = `SELECT * FROM posts where user_id=${userId} and content='${text}'`;
        db.query(checkPostExist, (err, result) => {
            if (result.length > 0) {
                res.redirect('/post/' + result[0].id + '/view');
            } else {
                //insert new post
                let now = new Date().getTime();

                //get hashtags from text
                let textArray = text.split(' ');
                let hashtagCount = 0;
                let hashtags = "";
                textArray.forEach((value) => {
                    if (value[0] == "#") {
                        hashtagCount++;
                        hashtags += value.substr(1) + ",";
                    }
                });
                if (hashtags < 2) res.send('not enough hashtags!')
                if (hashtagCount > 0) hashtags = hashtags.substr(0, hashtags.length - 1)

                //TODO: get hashtag IDs and insert if not exist
                let hashtagIds = "";

                let insertNewPost = `INSERT INTO posts(user_id, type, content, hashtags_count, hashtags, hashtag_ids, created_at, updated_at) 
               VALUES(${userId}, 'original_post', '${text}', ${hashtagCount}, '${hashtags}', '${hashtagIds}', ${now}, ${now})`;

                db.query(insertNewPost, (err, result) => {
                    let postId = result.insertId;
                    res.redirect('/post/' + postId + '/view');
                });
            }
        });

    });
    // res.render('posts/form')
});

router.get('/:id/like', (req, res, next) => {
    let token = req.cookies['user-token'];
    let postId = req.params.id;
    db.query(`SELECT * FROM posts WHERE id=${postId}`, (err, result) => {
        let targetPost = result[0];
        if (result.length > 0) {
            db.query(`SELECT * FROM users WHERE token='${token}'`, (err, result) => {
                if (result != null && result.length > 0) {
                    let userId = result[0].id;
                    if (userId == targetPost.user_id) res.send("cant like your own post")
                    db.query(`SELECT * FROM likes WHERE user_id=${userId} AND post_id=${postId}`, (err, result) => {
                        if (result.length > 0) {
                            res.send("already liked!");
                        } else {
                            let now = new Date().getTime();
                            db.query(`INSERT INTO likes(post_id, user_id, created_at) VALUES(${postId}, ${userId}, ${now})`, (err, result) => {
                                db.query(`UPDATE posts SET likes_count=likes_count+1 WHERE id=${postId}`, (err, result) => {
                                    if (result.length > 0) {
                                        res.send("now its liked!");
                                    } else {
                                    }
                                });
                            });
                        }
                    });
                } else {
                    res.redirect('/account/login')
                }
            });
        } else {
            res.render('errors/404');
        }
    });
});

router.get('/:id/view', (req, res, next) => {
    let getPostQuery = `SELECT * FROM posts where id=${req.params.id}`;
    db.query(getPostQuery, (err, result) => {
        if (result.length > 0) {
            let post = result[0];
            contentArray = post.content.split(" ");
            contentArray.forEach((value) => {
                if (value[0] == "#") {
                    post.content = post.content.replace(value, `<a href='/hashtags/${value.substr(1)}'>${value.substr(1)}</a> `)
                }
            });
            //get user and comments
            db.query(`SELECT * FROM users where id=${post.user_id}`, (err, result) => {
                if (result.length > 0) {
                    post.user = result[0];
                    res.render('posts/show', {post: post})
                } else {
                    res.send("user not found")
                }
            });
        } else {
            res.render('errors/404');
        }
    });
});

router.get('/:id/view', (req, res, next) => {

});


module.exports = router;