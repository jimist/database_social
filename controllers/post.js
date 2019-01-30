const express = require('express')
const router = express.Router()

let auth = require('../middlewares/auth');
auth = auth.auth_user;

router.get('/new', auth, (req, res, next) => {
    res.render('posts/form')
});

router.get('/:id/reply', auth, (req, res, next) => {
    let postId = req.params.id;

    //check if depth is passed or not
    let checkDepthQuery = `
        SELECT p1.id as parent_id
        FROM posts as p1, posts as p2 
        WHERE p2.id=${postId} and p2.reply_to=p1.id and p1.type='comment'
        `;

    db.query(checkDepthQuery, (err, result) => {
        if (result.length > 0) {
            postId = result[0].parent_id;
            res.redirect(`/post/${postId}/reply`)
        }else{
            res.render('posts/form');
        }
    });
});

router.post('/:id/reply', auth, (req, res, next) => {
    let text = req.body.text;
    let token = req.cookies['user-token'];
    let postId = req.params.id;

    let checkTokenQuery = `SELECT * FROM users where token= '${token}'`;
    db.query(checkTokenQuery, (err, result) => {
        let user = result[0];
        let userId = user.id;

        //check if depth is passed or not
        let checkDepthQuery = `
        SELECT p1.id as parent_id
        FROM posts as p1, posts as p2 
        WHERE p2.id=${postId} and p2.reply_to=p1.id and p1.type='comment'
        `;

        db.query(checkDepthQuery, (err, result) => {

            if (result.length > 0) {
                postId = result[0].parent_id;
                res.send('depth more than 2 is not allowed')
            } else {
                //do nothing
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
                        let insertNewPost = `INSERT INTO posts(user_id, type, content, reply_to, hashtags_count, hashtags, created_at, updated_at) VALUES(${userId}, 'comment', '${text}', ${postId}, ${hashtagCount}, '${hashtags}', ${now}, ${now})`;

                        db.query(insertNewPost, (err, result) => {
                            if (result.length > 0) {
                                db.query(`UPDATE posts SET replies_count=replies_count+1 WHERE id=${postId}`, (err, result) => {
                                    // let postId = result.insertId;
                                    db.query(`UPDATE users SET posts_count=posts_count+1 WHERE id=${userId}`, (err, result) => {
                                        res.redirect('/post/' + postId + '/view');
                                    });
                                });
                            }
                        });
                    }
                });
            }

        });

    });
    // res.render('posts/form')
});

router.post('/new', auth, (req, res, next) => {
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
                    if (result.length > 0) {
                        let postId = result.insertId;
                        db.query(`UPDATE users SET posts_count=posts_count+1 WHERE id=${userId}`, (err, result) => {
                            res.redirect('/post/' + postId + '/view');
                        });
                    }
                });
            }
        });

    });
    // res.render('posts/form')
});

router.get('/:id/like', auth, (req, res, next) => {
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

router.get('/:id/view', auth, (req, res, next) => {
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

router.get('/seed', auth, (req, res, next) => {
    let data =
        [
            {
                "sentiment": "positive",
                "text": "Dallas TX USA - Data Scientist Statistician - Technical Lead - Advanced degree in Statistics Data Sc: Advanced degr\u2026 https://t.co/3waFsSfwMr",
                "user": "Jobs_Statistics"
            },
            {
                "sentiment": "positive",
                "text": "RT @beeonaposy: The data science community (and my laptop aesthetic) would be much better if Python had hex stickers.",
                "user": "putkaputka"
            },
            {
                "sentiment": "positive",
                "text": "Wrapping up the visit to India with the last stop to Mumbai, a beautiful city with 20 million people. UNT COI\u2019s und\u2026 https://t.co/amO3fC9KOX",
                "user": "yunfei_du"
            },
            {
                "sentiment": "neutral",
                "text": "Is It Possible To Learn Data Science &amp; Machine Learning Without Mathematics?\nhttps://t.co/KuQfRsP44v\u2026 https://t.co/FDsZzHH3ac",
                "user": "amydyslex"
            },
            {
                "sentiment": "neutral",
                "text": "Let #Curiosity Drive: Fostering Innovation in Data Science https://t.co/DTs4wi5tht via @stitchfix_algo #DataScience\u2026 https://t.co/GzXcRyDkFW",
                "user": "AvrioAnalytics"
            },
            {
                "sentiment": "neutral",
                "text": "RT @kdnuggets: Introduction to Statistics for Data Science https://t.co/9xfAnmBr2y https://t.co/h0T6svlUnD",
                "user": "pollovoraz"
            },
            {
                "sentiment": "neutral",
                "text": "What are businesses doing to stay ahead of the curve? https://t.co/hDl5woKQNa",
                "user": "DD_Bun_"
            },
            {
                "sentiment": "negative",
                "text": "@pius_adesanmi It's pathetic. However, the situation is better in some and worse in others today. For instance, the\u2026 https://t.co/R6eAS7rlNb",
                "user": "muhsin234"
            },
            {
                "sentiment": "positive",
                "text": "RT @damiagroup: New #job: Solutions Architect/Data Science Tech Lead Location: Cambridge Salary: 650pd - 750pd .. https://t.co/QQrP6hXaRn #\u2026",
                "user": "SurreySeagulls"
            },
            {
                "sentiment": "negative",
                "text": "RT @njr0: I\u2019m excited to be speaking on The Science of Bad Data at the new #DataTech19 event as part of #DataFest19 this year.\n\nhttps://t.c\u2026",
                "user": "BrianHills"
            },
            {
                "sentiment": "negative",
                "text": "RT @WorkHuman: Learn about the data behind the #WorkHuman movement. Check out the powerful sessions \u2013 and speakers \u2013 that back up working h\u2026",
                "user": "MervynDinnen"
            },
            {
                "sentiment": "neutral",
                "text": "RT @DNAlawyer: \"Toward unrestricted use of public genomic data\" https://t.co/NFzqUX1zkE",
                "user": "UBGEMCOE"
            },
            {
                "sentiment": "negative",
                "text": "Learn about the data behind the #WorkHuman movement. Check out the powerful sessions \u2013 and speakers \u2013 that back up\u2026 https://t.co/ewMFQ9MbEt",
                "user": "WorkHuman"
            },
            {
                "sentiment": "positive",
                "text": "RT @MohammadZahedul: Get your #Computer #Science #work or #Database #project done in a professional way.\n\n#Database #Designer #Developer: h\u2026",
                "user": "WebExpert1971"
            },
            {
                "sentiment": "positive",
                "text": "RT @BelongCo: Join us for \u201cCareer Talkies \u201d series - \u201cHack your Data Science Growth\u201d on 2nd Feb in our office. Click here to know more: htt\u2026",
                "user": "rishabhkaul"
            },
            {
                "sentiment": "positive",
                "text": "RT @ICRAR: How do you transport unprecedented amounts of data over vast distances for the Square Kilometre Array? You ask the SaDT engineer\u2026",
                "user": "Nicochan33"
            },
            {
                "sentiment": "negative",
                "text": "RT @njr0: I\u2019m excited to be speaking on The Science of Bad Data at the new #DataTech19 event as part of #DataFest19 this year.\n\nhttps://t.c\u2026",
                "user": "Chicco_Stat"
            },
            {
                "sentiment": "positive",
                "text": "Quality over quantity: building the perfect data science project by @jeremiecharris https://t.co/vHc85NEkl6",
                "user": "JohnDellape"
            },
            {
                "sentiment": "neutral",
                "text": "Introduction to Data Science in Python https://t.co/LEcnkrxWOl  #MachineLearning #DeepLearning #BigData #ai #DataScience #NeuralNetworks",
                "user": "marcovisibelli"
            },
            {
                "sentiment": "negative",
                "text": "RT @SenSherrodBrown: \"Our science is shut down. The telescopes are still collecting data, but we can\u2019t look at it. We can\u2019t talk to our stu\u2026",
                "user": "Chrisx1987"
            },
            {
                "sentiment": "negative",
                "text": "How to fail the Data Science business case\n3. Upskilling by online learning\u200a only \u2014\u200a Online learning is available 2\u2026 https://t.co/Vkkf41GMOh",
                "user": "10kDSforEU"
            },
            {
                "sentiment": "neutral",
                "text": "RT @MaibornWolff: Konrad Schreiber und Fabian Hertwig waren am Dienstag mit ihrem Workshop \"Fahrr\u00e4der verteilen in San Francisco. Ein Data-\u2026",
                "user": "LenzBelzner"
            },
            {
                "sentiment": "negative",
                "text": "RT @chingos: tbh, I was skeptical of the value of data science for social science research until I started working with @GrahamIMac. https:\u2026",
                "user": "davidconnell"
            },
            {
                "sentiment": "neutral",
                "text": "Presenting the digital strategy of @unige_en during the third luncheon on advancing data science ecosystem for epid\u2026 https://t.co/YMVuEJqFvG",
                "user": "FlueckigerYves"
            },
            {
                "sentiment": "positive",
                "text": "RT @CapitaCustMgt: In our latest issue of Intelligence Alan Linter, Capita Innovation and Science Director identifies the 8 ways data will\u2026",
                "user": "CapitaPlc"
            },
            {
                "sentiment": "negative",
                "text": "RT @shannonmstirone: A reminder that Voyager2 is not only still communicating after 41 years but is actively collecting science data, from\u2026",
                "user": "LuzetteH"
            },
            {
                "sentiment": "negative",
                "text": "RT @HEPfeickert: After being confused for quite some time with how to actually use pipenv to provide #Python virtual environments for multi\u2026",
                "user": "HumansAnalytics"
            },
            {
                "sentiment": "positive",
                "text": "Get your #Computer #Science #work or #Database #project done in a professional way.\n\n#Database #Designer #Developer\u2026 https://t.co/sEUvhiNhRe",
                "user": "MohammadZahedul"
            },
            {
                "sentiment": "positive",
                "text": "RT @jeroenbosman: Some interesting figures in this short report by @digitalsci on open access development 2000-2016 based on @DSDimensions\u2026",
                "user": "apmireia"
            },
            {
                "sentiment": "negative",
                "text": "RT @SLFcommunity: Science reminder \u261d\ud83c\udffd\ud83d\udd2c\ud83e\udda0\ud83e\uddea\n\n@safecast has developed real-time radiation monitoring devices - #bGeigie.\n\nHere are disturbing d\u2026",
                "user": "Cecalli_Helper"
            },
            {
                "sentiment": "negative",
                "text": "RT @UrBroda: #MindSync is creating a unified platform to establish an active community of experts in the field of #AI technologies like mac\u2026",
                "user": "jayeshmthakur"
            },
            {
                "sentiment": "positive",
                "text": "@RayMcMullen1 @CBCNews So you know more about science than scientists, and you have a better, rigorous, peer-review\u2026 https://t.co/ze2SQgtEa9",
                "user": "thewaffle2dot0"
            },
            {
                "sentiment": "positive",
                "text": "@HarbinsonJoel @OmarHamada Rich coming from a JD scientists. You should stay in your own lane. BTW: Science is abou\u2026 https://t.co/JW3OlLz5hZ",
                "user": "700uspr"
            },
            {
                "sentiment": "neutral",
                "text": "Data Science and Machine Learning for Managers and MBAs\n\n\u261e https://t.co/Nh3W5cVk6v\n\n#DeepLearning #programming https://t.co/4rc8djSx8Q",
                "user": "tensorflow_dev"
            },
            {
                "sentiment": "neutral",
                "text": "Data Science and Machine Learning for Managers and MBAs\n\n\u261e https://t.co/Dc8PrtBtcP\n\n#DeepLearning #programming https://t.co/7A8iBbUiaH",
                "user": "tensorflow_devp"
            },
            {
                "sentiment": "negative",
                "text": "\"Outside of social media, fake news has been\rexamined among U.S. voters via surveys and web\nbrowsing data.\" Detaile\u2026 https://t.co/mbzIr30qTq",
                "user": "TabWilke"
            },
            {
                "sentiment": "positive",
                "text": "RT @davdittrich: Spotify data shows how music preferences change with latitude:\nThe farther from the equator, the greater the seasonal swin\u2026",
                "user": "MarekGiebel"
            },
            {
                "sentiment": "positive",
                "text": "RT @kaggle: [scroll to the bottom for] 9  Math-Free Techniques Covering A Good Chunk Of Data Science | via @Analyticsindiam #datascience #m\u2026",
                "user": "paippb"
            },
            {
                "sentiment": "neutral",
                "text": "Winter Of Data Week 2 Day 5: Daily Data 10 of 69 Correlation - Learn Data Science in 2 mins a day! Join any time. F\u2026 https://t.co/cPaxaO1TLK",
                "user": "1mwtt"
            },
            {
                "sentiment": "positive",
                "text": "\u2018Let the small fire spread!\u2019 powerful message by #GaryWolf to advance  #learning from #selftracking #data by promot\u2026 https://t.co/KhQIT24eV5",
                "user": "okulyk"
            },
            {
                "sentiment": "neutral",
                "text": "Are you going to the Orlando Machine Learning &amp; Data Science meetup tomorrow? You should check it out: https://t.co/MKbmTIfu9q",
                "user": "OFLTechEvents"
            },
            {
                "sentiment": "positive",
                "text": "RT @GrahamIMac: Ever wonder what a data scientist does at a research organization... where so many \"researchers\" could just as easily be \"d\u2026",
                "user": "AdaptiveToolbox"
            },
            {
                "sentiment": "positive",
                "text": "#Dr. @pnbennett explains how research in #ML and data science is helping contextually intelligent assistants antici\u2026 https://t.co/t6b6s5OxNX",
                "user": "ButlerMartinsnr"
            },
            {
                "sentiment": "positive",
                "text": "RT @turinginst: Deadline to apply for this year's Data Science for Social Good Summer Internship (AKA Fellowship in the States) is coming u\u2026",
                "user": "guerrero_oa"
            },
            {
                "sentiment": "positive",
                "text": "RT @turinginst: Deadline to apply for this year's Data Science for Social Good Summer Internship (AKA Fellowship in the States) is coming u\u2026",
                "user": "Thechangemonkey"
            },
            {
                "sentiment": "negative",
                "text": "RT @andyjko: CS departments are overwhelmed with demand. So is the @uw_ischool and other disciplines related to data and info. No easy solu\u2026",
                "user": "rhemalinder"
            },
            {
                "sentiment": "neutral",
                "text": "Konrad Schreiber und Fabian Hertwig waren am Dienstag mit ihrem Workshop \"Fahrr\u00e4der verteilen in San Francisco. Ein\u2026 https://t.co/UMo5lpeDEK",
                "user": "MaibornWolff"
            },
            {
                "sentiment": "negative",
                "text": "RT @shannonmstirone: A reminder that Voyager2 is not only still communicating after 41 years but is actively collecting science data, from\u2026",
                "user": "MattCoulter97"
            },
            {
                "sentiment": "neutral",
                "text": "#MyOpenScienceStory Last 7 years I've been working @Addgene making research data AND materials open for scientists\u2026 https://t.co/dmTVTIfydY",
                "user": "JKamens"
            },
            {
                "sentiment": "neutral",
                "text": "RT @tensorflow_fan: Data Science and Machine Learning for Managers and MBAs\n\n\u261e https://t.co/1uroL5oUhW\n\n#DeepLearning #programming https://\u2026",
                "user": "AaronCuddeback"
            },
            {
                "sentiment": "neutral",
                "text": "Data Science and Machine Learning for Managers and MBAs\n\n\u261e https://t.co/xwz1pMxGk5\n\n#DeepLearning #programming https://t.co/Bw8Cfou4cs",
                "user": "tensorflow_geek"
            },
            {
                "sentiment": "neutral",
                "text": "SQL For Audit, Revenue Assurance and Data Science https://t.co/kIW78GZFwh  #machinelearning #ad   @machinelearnflx",
                "user": "machinelearnflx"
            },
            {
                "sentiment": "positive",
                "text": "RT @ktanweer123: Urgent Hiring, we are looking for our Client-DATA  SCIENTISTS  (Many Positions) \nExperience: 1-6yrs, Location: New Delhi\u2026",
                "user": "FernandaKellner"
            },
            {
                "sentiment": "neutral",
                "text": "Data Science and Machine Learning for Managers and MBAs\n\n\u261e https://t.co/1uroL5oUhW\n\n#DeepLearning #programming https://t.co/F6f3XlR6Mg",
                "user": "tensorflow_fan"
            },
            {
                "sentiment": "positive",
                "text": "RT @AnalyticsVidhya: (2/3) Articles to learn and brush up on your #MachineLearning skills in #R:\n\nA Complete Tutorial to learn Data Science\u2026",
                "user": "machinelearnflx"
            },
            {
                "sentiment": "neutral",
                "text": "#Spotify je prikazao podatke kako se muzi\u010dki ukus menja sa promenom geografskog podru\u010dja.https://t.co/35yaO3ZVRy",
                "user": "_ExecutiveGroup"
            },
            {
                "sentiment": "positive",
                "text": "RT @marcusborba: The Data Science Gold Rush: Top Jobs in #DataScience and How to Secure Them\n\nhttps://t.co/v1QHd3tyIo @kdnuggets \n\n#Artific\u2026",
                "user": "harsh9125"
            },
            {
                "sentiment": "positive",
                "text": "RT @BitmakerGA: Our Data Science Immersive grads have been hired at leading companies like @telusdigital. Learn more about what it's like t\u2026",
                "user": "AK_Mullin"
            },
            {
                "sentiment": "positive",
                "text": "The class is a better theory class complementing our data science curriculum because networks are more common as ar\u2026 https://t.co/4QcABVCiJv",
                "user": "causalinf"
            },
            {
                "sentiment": "neutral",
                "text": "Or they go into industry, these days competing at entry level data science, consulting and banking positions, where\u2026 https://t.co/5ESL0oGo04",
                "user": "causalinf"
            },
            {
                "sentiment": "positive",
                "text": "Want to work in #Tempe, AZ? View our latest opening: https://t.co/6x5mXTvHCg",
                "user": "JobsAtInsight"
            },
            {
                "sentiment": "neutral",
                "text": "RT @mscavazzin: Detecting Credit Card Fraud Using Machine Learning \u2013 Towards Data Science https://t.co/KRc0ivdd42 #ML #AI https://t.co/U73C\u2026",
                "user": "mscavazzin"
            },
            {
                "sentiment": "positive",
                "text": "From Digital Media Jobs Network\nLatest Data Science Jobs -NY\n.\nRecruithook -Data Scientist -NY,NY\u2026 https://t.co/ivDTBb5gt4",
                "user": "DMJNcom"
            },
            {
                "sentiment": "neutral",
                "text": "Like in almost every business function, collecting &amp; analyzing data can help HR teams identify trends and root caus\u2026 https://t.co/oyNWBL7waX",
                "user": "p4parity"
            },
            {
                "sentiment": "positive",
                "text": "RT @DataScienceCtrl: Free eBook: Applied Data Science (Columbia University) https://t.co/LJd2LbxqYH",
                "user": "petersunny6789"
            },
            {
                "sentiment": "positive",
                "text": "RT @DataScienceCtrl: Free eBook: Applied Data Science (Columbia University) https://t.co/TpV8gzfsoJ",
                "user": "petersunny6789"
            },
            {
                "sentiment": "positive",
                "text": "Next Tuesday, we\u2019ll be in Pasadena for a State of the Science Summit on GI Cancers to sift through all the latest d\u2026 https://t.co/fiXyVIamtt",
                "user": "OncLiveSOSS"
            },
            {
                "sentiment": "positive",
                "text": "#GOR19: Two exciting keynotes are waiting for you! \nDay 1: The Future of Consumer Insight in the Digital Era\n(Stefa\u2026 https://t.co/VHGBylVzW5",
                "user": "dgof_gor"
            },
            {
                "sentiment": "negative",
                "text": "After being confused for quite some time with how to actually use pipenv to provide #Python virtual environments fo\u2026 https://t.co/fu7Om8zcCA",
                "user": "HEPfeickert"
            },
            {
                "sentiment": "negative",
                "text": "RT @twittendoc: ARTE Data Science vs Fake https://t.co/JWGRbjVlRE S\u00e9rie de films d\u2019animation con\u00e7ue pour lutter contre les id\u00e9es re\u00e7ues et\u2026",
                "user": "petit_nanne"
            },
            {
                "sentiment": "neutral",
                "text": "RT @fmartin1954: Toward unrestricted use of public genomic data https://t.co/qnZozvrqQs",
                "user": "ixenario"
            },
            {
                "sentiment": "negative",
                "text": "RT @kareem_carr: Statisticians Dream: You are seated in an unfamiliar room. Your clothes are hip, but casual. You have just the right amoun\u2026",
                "user": "DavidJohnBaker"
            },
            {
                "sentiment": "positive",
                "text": "RT @nugalite: If you have some free time, data and a laptop and you are interested in learning some IT skills you need to help land the IT\u2026",
                "user": "phemodee"
            },
            {
                "sentiment": "positive",
                "text": "RT @sivagurus: In the latest episode of software lifecycle stories, I talk to @lravi_vellore , COO Tech Mahindra, on Data Science, Learning\u2026",
                "user": "karthgan"
            },
            {
                "sentiment": "neutral",
                "text": "RT @emblebi: A case for the unrestricted use of public #genomic data - by @cathbrooksbank, @robdfinn and colleagues. Published in @sciencem\u2026",
                "user": "hewgreen"
            },
            {
                "sentiment": "neutral",
                "text": "RT @dssgber: Non-profit auf der Suche nach Daten-Experten? Es sind noch Pl\u00e4tze frei f\u00fcr unser n\u00e4chstes Speed Dating im M\u00e4rz! You are a non-\u2026",
                "user": "miskaknapek"
            },
            {
                "sentiment": "positive",
                "text": "RT @trainingsinusa: Find the best #data #science #training at OPTnation.\nCourse details: https://t.co/0JQ1AI5yJH\n#DataScience #course #cert\u2026",
                "user": "machinelearn_d"
            },
            {
                "sentiment": "positive",
                "text": "RT @davdittrich: Spotify data shows how music preferences change with latitude:\nThe farther from the equator, the greater the seasonal swin\u2026",
                "user": "tejendrapsingh"
            },
            {
                "sentiment": "positive",
                "text": "RT @Carlo_Abrate: \u201cThink less about how #DataScience will support and execute your plans and think more about how to create an environment\u2026",
                "user": "machinelearn_d"
            },
            {
                "sentiment": "positive",
                "text": "Spotify data shows how music preferences change with latitude:\nThe farther from the equator, the greater the season\u2026 https://t.co/h96e9wq4E8",
                "user": "davdittrich"
            },
            {
                "sentiment": "positive",
                "text": "RT @MsBaleTweets: Time to collect data during the sour apples lab. Labs are fun during science stations. @CypressPalm @CollierScience https\u2026",
                "user": "CypressPalm"
            },
            {
                "sentiment": "negative",
                "text": "@BBCAmos The data is not coming back slowly because of the distance. It's because of the limited power supply of th\u2026 https://t.co/IkDhxbHbQN",
                "user": "nmac1968"
            },
            {
                "sentiment": "positive",
                "text": "New #job: Solutions Architect/Data Science Tech Lead Location: Cambridge Salary: 650pd - 750pd .. https://t.co/QQrP6hXaRn #jobs #hiring",
                "user": "damiagroup"
            },
            {
                "sentiment": "neutral",
                "text": "RT @Tweets_By_Derek: Final Report - Capstone Project for the @ibm Applied Data Science Program on @coursera.\n\nhttps://t.co/SG64lChpy4\n\n@git\u2026",
                "user": "machinelearn_d"
            },
            {
                "sentiment": "neutral",
                "text": "Thorough discussion of what constitutes human behavior data (hint: anything a person does, collected via any method\u2026 https://t.co/UxuJL8iFKm",
                "user": "DrRoessger"
            },
            {
                "sentiment": "positive",
                "text": "RT @_brohrer_: With my co-authors, I am proud to share a data science curriculum roadmap, a set of topic recommendations for data-centric a\u2026",
                "user": "gjmount"
            },
            {
                "sentiment": "positive",
                "text": "RT @SouthernVasc: Early morning science!moderated poster session at SAVS with amazing participation  and great data. https://t.co/GLnH5mLmyL",
                "user": "leils"
            },
            {
                "sentiment": "positive",
                "text": "RT @GrahamIMac: Ever wonder what a data scientist does at a research organization... where so many \"researchers\" could just as easily be \"d\u2026",
                "user": "machinelearn_d"
            },
            {
                "sentiment": "positive",
                "text": "RT @marctorrens: Magnificent talk for our MBA students by @pauagullo (founder and CEO) from @KernelAnalytics on how to apply advanced Busin\u2026",
                "user": "KernelAnalytics"
            },
            {
                "sentiment": "neutral",
                "text": "RT @data_minings: Machine Learning A-Z\u2122: Hands-On Python &amp; R In Data Science\n\n\u261e https://t.co/Mj0xcCigPb\n\n#bigdata #programming https://t.co\u2026",
                "user": "chidambara09"
            },
            {
                "sentiment": "positive",
                "text": "RT @Datascience__: Coleridge-Initiative/big-data-and-social-science https://t.co/Ko3SgEmwiP  #BigData",
                "user": "machinelearn_d"
            },
            {
                "sentiment": "positive",
                "text": "RT @JG_NoPlanet_B: This is just awesomely cool. Far away from all the \"stuff\" that's going on here in the US right now, there's this small\u2026",
                "user": "leesgirl9"
            },
            {
                "sentiment": "positive",
                "text": "RT @rzembo: \u201c2018\u2019s Top 7 R Packages for Data Science and AI\u201d\n\n#AI #MachineLearning #DataScience #rstats via @kdnuggets https://t.co/AUT01S\u2026",
                "user": "rzembo"
            },
            {
                "sentiment": "positive",
                "text": "RT @GaviSeth: At @UNIGEnews @FLAHAULT lunch on Advancing Data Science Ecosystem for Epidemics where Amandeep Singh Gill ED of @UN High Leve\u2026",
                "user": "yoshi_nagamine"
            },
            {
                "sentiment": "neutral",
                "text": "RT @bigdata_dataa: Machine Learning A-Z\u2122: Hands-On Python &amp; R In Data Science\n\n\u261e https://t.co/PfmvXMrBRe\n\n#bigdata #programming https://t.c\u2026",
                "user": "chidambara09"
            },
            {
                "sentiment": "negative",
                "text": "Oooh bru tringat ttg MBA transformasi and data science yerk,,, sdh ketemuikan kpd AI subject ...term",
                "user": "AtiqaAinin"
            },
            {
                "sentiment": "positive",
                "text": "RT @MAASTROclinic: New #PhD vacancy in our Knowledge Engineering / #DataScience research division: https://t.co/c6NpvM8OsS #datascience #co\u2026",
                "user": "PaulissenJohn"
            },
            {
                "sentiment": "negative",
                "text": "tbh, I was skeptical of the value of data science for social science research until I started working with\u2026 https://t.co/XVTm5gzMU7",
                "user": "chingos"
            },
            {
                "sentiment": "neutral",
                "text": "RT @RogerMoore: 4 #DataScience #Certificates to boost your #Career and #Salary @bicorner #BigData #Analytics #DataScience https://t.co/UMGD\u2026",
                "user": "machinelearn_d"
            },
            {
                "sentiment": "neutral",
                "text": "RT @simplivllc: Data Visualizations using R with Data Processing\nhttps://t.co/geGvwGDShB\n#edtech #technology #innovation #AI #MachineLearni\u2026",
                "user": "sectest9"
            }
        ];

    let insertQueryParams = "";
    let hashtags;
    let hashtagCount;
    let textArray;
    let text;
    let now = new Date().getTime()
    data.forEach((tweet) => {
        text = tweet.text;
        //get hashtags from text
        textArray = text.split(' ');
        hashtagCount = 0;
        hashtags = "";
        textArray.forEach((value) => {
            if (value[0] == "#") {
                hashtagCount++;
                hashtags += value.substr(1) + ",";
            }
        });
        // if (hashtags < 2) res.send('not enough hashtags!')
        if (hashtagCount > 0) hashtags = hashtags.substr(0, hashtags.length - 1);
        text = text.replace('"', "'")
        insertQueryParams += `(${Math.floor(Math.random() * (33 - 9)) + 9}, 'original_post', "${text}", ${hashtagCount}, '${hashtags}', ${now}, ${now}),`
    });
    insertQueryParams = insertQueryParams.substr(0, insertQueryParams.length - 1);
    let insertNewPost = `INSERT INTO posts(user_id, type, content, hashtags_count, hashtags, created_at, updated_at) 
    VALUES ${insertQueryParams}`;
    res.send(insertNewPost)
});

router.get('/hot', auth, (req, res, next) => {
    // let token = req.cookies['user-token'];
    let postFetchQuery = `SELECT * FROM posts 
        WHERE type='original_post'  
        ORDER BY
        likes_count*2+hashtags_count*0.5 DESC,
        created_at DESC
        LIMIT 100`;
    // res.send(postFetchQuery)
    db.query(postFetchQuery, (err, result) => {
        if (result.length > 0) {
            res.render('posts/list', {posts: result});
        } else {
            res.send('no posts yet!');
        }

    });
});

module.exports = router;