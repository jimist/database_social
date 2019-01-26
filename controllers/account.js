const express = require('express')
const router = express.Router()
const passwordHash = require('password-hash');
let auth = require('../middlewares/auth');
auth = auth.auth_user;

router.get('/login', (req, res, next) => {
    res.render('pages/login')
});

router.post('/login', (req, res, next) => {
    let email = req.body.email;
    let pwd = req.body.password;

    let checkUserExistQuery = `SELECT * FROM users where (username = '${email}' OR email = '${email}')`;
    db.query(checkUserExistQuery, (err, result) => {
        if(result.length>0 && passwordHash.verify(pwd, result[0].password)){
            let now = new Date().getTime();
            let token = now+email+"APP_SECRET";
            token = passwordHash.generate(token)
            let updateQuery = `UPDATE users SET updated_at=${now}, token='${token}' where (username = '${email}' OR email = '${email}')`;
            db.query(updateQuery , (err, result) => {
                if(!err){
                    res.cookie('user-token', token);
                    res.redirect('/');
                }
            });
        }else{
            res.redirect('/account/login?exist=retry');
        }
    });
});

router.get('/logout', auth, (req, res, next) => {
    res.cookie('user-token', '');
    res.redirect('/account/login?type=logout')
});

router.get('/register', (req, res, next) => {
    res.render('pages/register', {
        usernameExist: false,
        emailExist: false
    })
});

router.post('/register', (req, res) =>{
    let username = req.body.username;
    let email = req.body.email;
    let pwd = req.body.password;

    //check if username exist
    let checkUserExistQuery = `SELECT * FROM users where username = '${username}' OR email = '${email}'`;
    db.query(checkUserExistQuery, (err, result) => {
        console.log(result.length);
        if(result.length>0){
            res.redirect('/account/register?exist=true');
        }else{
            let now = (new Date()).getTime();
            console.log(now);
            pwd = passwordHash.generate(pwd);
            let token = now+username+"APP_SECRET";
            token = passwordHash.generate(token)
            let insertUserQuery = `INSERT INTO users(email, username, password, token, created_at, updated_at) 
            VALUES('${email}', '${username}', '${pwd}', '${token}', ${now}, ${now})`;
            console.log(insertUserQuery )

            db.query(insertUserQuery , (err, result) => {
                if(!err){
                    res.cookie('user-token', token);
                    res.redirect("/");
                }
            });
        }
    });

});


router.get('/seed', (req, res) =>{
    let usersToSeed = [
        {
            "node": {
                "id": "5775266706",
                "username": "mahsa.s76",
                "full_name": "Msa",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/12d169c4c2d4ff3e0da6ecb7914c75c1/5CC50B13/t51.2885-19/s150x150/30079814_2541164766108571_8848169393297817600_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": true,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "5775266706",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "5775266706",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/12d169c4c2d4ff3e0da6ecb7914c75c1/5CC50B13/t51.2885-19/s150x150/30079814_2541164766108571_8848169393297817600_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "mahsa.s76"
                    }
                }
            }
        },
        {
            "node": {
                "id": "10627722057",
                "username": "somayehashemabadi",
                "full_name": "Somaye Hashemabadi",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/991d9bf57ff1cedea415f50d6a6332d6/5CE30984/t51.2885-19/s150x150/49361067_612617102519405_9003691091093880832_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "10627722057",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "10627722057",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/991d9bf57ff1cedea415f50d6a6332d6/5CE30984/t51.2885-19/s150x150/49361067_612617102519405_9003691091093880832_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "somayehashemabadi"
                    }
                }
            }
        },
        {
            "node": {
                "id": "1701659732",
                "username": "parisa_maryami_",
                "full_name": "je viens du ciel\u2b50",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/1a57b2e3e822654877b81f20694807d7/5CE93579/t51.2885-19/s150x150/47694163_1130715757090440_9085802323103449088_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": true,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "1701659732",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "1701659732",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/1a57b2e3e822654877b81f20694807d7/5CE93579/t51.2885-19/s150x150/47694163_1130715757090440_9085802323103449088_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "parisa_maryami_"
                    }
                }
            }
        },
        {
            "node": {
                "id": "6358367932",
                "username": "mahsa_apn98",
                "full_name": "mahsa",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/03fb014b9e208bd01a5820d91ce23558/5CFD7F7F/t51.2885-19/s150x150/46028538_581518888972744_3684648328659730432_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": true,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "6358367932",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "6358367932",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/03fb014b9e208bd01a5820d91ce23558/5CFD7F7F/t51.2885-19/s150x150/46028538_581518888972744_3684648328659730432_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "mahsa_apn98"
                    }
                }
            }
        },
        {
            "node": {
                "id": "8770710382",
                "username": "startupacademy.ir",
                "full_name": "startupacademy",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/5a728d77a1958de2dc4e8c29f014eed4/5CFD9ED9/t51.2885-19/s150x150/47691715_2218749485112199_3913185479805108224_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "8770710382",
                    "expiring_at": 1548511578,
                    "latest_reel_media": 1548408468,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "8770710382",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/5a728d77a1958de2dc4e8c29f014eed4/5CFD9ED9/t51.2885-19/s150x150/47691715_2218749485112199_3913185479805108224_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "startupacademy.ir"
                    }
                }
            }
        },
        {
            "node": {
                "id": "8100456720",
                "username": "virals_cartoons",
                "full_name": "VIRALS CARTOONS",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/12e352ce21054ebdf142448e3fae4038/5CCA9932/t51.2885-19/s150x150/43462023_266631123875193_106028277088387072_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "8100456720",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "8100456720",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/12e352ce21054ebdf142448e3fae4038/5CCA9932/t51.2885-19/s150x150/43462023_266631123875193_106028277088387072_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "virals_cartoons"
                    }
                }
            }
        },
        {
            "node": {
                "id": "2719264825",
                "username": "faktillon",
                "full_name": "Faktillon - Das Original",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/52703aa8fe68e261e0d58b5767da772f/5CC38966/t51.2885-19/s150x150/12446164_1531816930449153_741926419_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "2719264825",
                    "expiring_at": 1548511578,
                    "latest_reel_media": 1548419809,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "2719264825",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/52703aa8fe68e261e0d58b5767da772f/5CC38966/t51.2885-19/s150x150/12446164_1531816930449153_741926419_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "faktillon"
                    }
                }
            }
        },
        {
            "node": {
                "id": "1522222419",
                "username": "_ehsankarimi",
                "full_name": "Ehsan Karimi",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/67829eb572278e8a5556c5ee753bcd94/5CFC2284/t51.2885-19/s150x150/46656796_2196556667223956_8781040622124400640_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": true,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "1522222419",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "1522222419",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/67829eb572278e8a5556c5ee753bcd94/5CFC2284/t51.2885-19/s150x150/46656796_2196556667223956_8781040622124400640_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "_ehsankarimi"
                    }
                }
            }
        },
        {
            "node": {
                "id": "8205574271",
                "username": "shiva.ehsanii.r",
                "full_name": "shiva.ehsani",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/8f576c42f9a0e91e82d1b9bf4391f584/5CE5904C/t51.2885-19/s150x150/46528349_342507259909060_4238289206754934784_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": true,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "8205574271",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": 1548334612,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "8205574271",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/8f576c42f9a0e91e82d1b9bf4391f584/5CE5904C/t51.2885-19/s150x150/46528349_342507259909060_4238289206754934784_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "shiva.ehsanii.r"
                    }
                }
            }
        },
        {
            "node": {
                "id": "6032876504",
                "username": "witzvorlage",
                "full_name": "Michi Brezel",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/b9f317097c0a0d414d5da8ad500e1610/5CE74ACC/t51.2885-19/s150x150/46599073_267826620757617_4414613505634729984_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "6032876504",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "6032876504",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/b9f317097c0a0d414d5da8ad500e1610/5CE74ACC/t51.2885-19/s150x150/46599073_267826620757617_4414613505634729984_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "witzvorlage"
                    }
                }
            }
        },
        {
            "node": {
                "id": "37704179",
                "username": "sara_usinger",
                "full_name": "sara",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/45d32a8d735412ec0e5f30e6ae5b1b79/5CCA8BFB/t51.2885-19/s150x150/19228414_125750831344906_4312291080948154368_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "37704179",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "37704179",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/45d32a8d735412ec0e5f30e6ae5b1b79/5CCA8BFB/t51.2885-19/s150x150/19228414_125750831344906_4312291080948154368_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "sara_usinger"
                    }
                }
            }
        },
        {
            "node": {
                "id": "3015037605",
                "username": "totaberlustig.de",
                "full_name": "Tot, aber lustig",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/fe725ccfd88bbb160a682af024b67ebd/5D002C2D/t51.2885-19/s150x150/12677513_599060730245497_547616851_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "3015037605",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "3015037605",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/fe725ccfd88bbb160a682af024b67ebd/5D002C2D/t51.2885-19/s150x150/12677513_599060730245497_547616851_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "totaberlustig.de"
                    }
                }
            }
        },
        {
            "node": {
                "id": "8246243329",
                "username": "herrmann_comix",
                "full_name": "Herrmann Comix",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/54cfe1fa62fd7dd6f64d1146101f7a27/5CE0ED4F/t51.2885-19/s150x150/47693068_2270247536565568_6787444385324728320_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "8246243329",
                    "expiring_at": 1548511578,
                    "latest_reel_media": 1548420858,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "8246243329",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/54cfe1fa62fd7dd6f64d1146101f7a27/5CE0ED4F/t51.2885-19/s150x150/47693068_2270247536565568_6787444385324728320_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "herrmann_comix"
                    }
                }
            }
        },
        {
            "node": {
                "id": "2024855200",
                "username": "ruthe_offiziell",
                "full_name": "Ralph Ruthe",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/b0da8a9731051577b229c7ea1d70d1a4/5CFC966E/t51.2885-19/11176428_524264974378817_1607670377_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": true,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "2024855200",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "2024855200",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/b0da8a9731051577b229c7ea1d70d1a4/5CFC966E/t51.2885-19/11176428_524264974378817_1607670377_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "ruthe_offiziell"
                    }
                }
            }
        },
        {
            "node": {
                "id": "5743069648",
                "username": "proselfmade",
                "full_name": "\u0633\u0627\u0645\u0627\u0646 \u062f\u0627\u062f\u0645\u0646\u062f\u06cc\u0627\u0646 | \u062e\u0648\u062f\u0633\u0627\u062e\u062a\u0647",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/565f34fcfdfccfd8da42248ebfdebabd/5CF2C044/t51.2885-19/s150x150/42068899_429918194205848_9109663782715523072_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "5743069648",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "5743069648",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/565f34fcfdfccfd8da42248ebfdebabd/5CF2C044/t51.2885-19/s150x150/42068899_429918194205848_9109663782715523072_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "proselfmade"
                    }
                }
            }
        },
        {
            "node": {
                "id": "2053698496",
                "username": "sookhtejet.ir",
                "full_name": "\u0631\u0648\u0632\u0627\u0646\u0647 \u0633\u0640\u0648\u062e\u0640\u062a \u062c\u0640\u062a \u062f\u0631\u06cc\u0627\u0641\u062a \u06a9\u0646\u06cc\u062f",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/07e9c0191772366e09fbad403fbfb3e3/5CE946FF/t51.2885-19/s150x150/1169901_557193794441934_296551820_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "2053698496",
                    "expiring_at": 1548511578,
                    "latest_reel_media": 1548409470,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "2053698496",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/07e9c0191772366e09fbad403fbfb3e3/5CE946FF/t51.2885-19/s150x150/1169901_557193794441934_296551820_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "sookhtejet.ir"
                    }
                }
            }
        },
        {
            "node": {
                "id": "10104584995",
                "username": "goriz_atelier",
                "full_name": "\u06a9\u0627\u0631\u06af\u0627\u0647 \u0622\u062a\u0644\u06cc\u0647 \u06af\u0631\u06cc\u0632",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/7b9319f50638a9b717aa1eaf424ffd90/5CF26C1B/t51.2885-19/s150x150/47694231_755243234862054_3064305380096999424_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "10104584995",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "10104584995",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/7b9319f50638a9b717aa1eaf424ffd90/5CF26C1B/t51.2885-19/s150x150/47694231_755243234862054_3064305380096999424_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "goriz_atelier"
                    }
                }
            }
        },
        {
            "node": {
                "id": "2894082692",
                "username": "nilofar_nazif",
                "full_name": "",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/c72aee7a25cbd09b37f55087c03bd912/5CC2B7E9/t51.2885-19/s150x150/44392044_553568085056749_8324348013577240576_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": true,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "2894082692",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "2894082692",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/c72aee7a25cbd09b37f55087c03bd912/5CC2B7E9/t51.2885-19/s150x150/44392044_553568085056749_8324348013577240576_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "nilofar_nazif"
                    }
                }
            }
        },
        {
            "node": {
                "id": "3244882616",
                "username": "_zahra.lotfi_",
                "full_name": "\u0632\u0647\u0640\u0640\u0640\u0640\u0640\u0640\u0640\ud83c\udf43\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0640\u0631\u0627",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/8cc62f43ccb0c3839d7a74a7b3d76228/5CC73687/t51.2885-19/s150x150/43818156_263226037726957_2169741620226818048_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": true,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "3244882616",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "3244882616",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/8cc62f43ccb0c3839d7a74a7b3d76228/5CC73687/t51.2885-19/s150x150/43818156_263226037726957_2169741620226818048_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "_zahra.lotfi_"
                    }
                }
            }
        },
        {
            "node": {
                "id": "7442382360",
                "username": "miss_m.a.h.d.i.y.e.h_",
                "full_name": "",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/c14fe9b7031cda764312613ad910ac32/5CFE307B/t51.2885-19/s150x150/49913306_343558936490390_2174107317044248576_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": true,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "7442382360",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "7442382360",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/c14fe9b7031cda764312613ad910ac32/5CFE307B/t51.2885-19/s150x150/49913306_343558936490390_2174107317044248576_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "miss_m.a.h.d.i.y.e.h_"
                    }
                }
            }
        },
        {
            "node": {
                "id": "1452889657",
                "username": "avatech.ir",
                "full_name": "\u0622\u0648\u0627\u062a\u06a9 | Avatech",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/9a1c21694d91ae44edc802fe063a2d76/5CE8E323/t51.2885-19/s150x150/23967427_540163026318331_2397747123140427776_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "1452889657",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "1452889657",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/9a1c21694d91ae44edc802fe063a2d76/5CE8E323/t51.2885-19/s150x150/23967427_540163026318331_2397747123140427776_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "avatech.ir"
                    }
                }
            }
        },
        {
            "node": {
                "id": "179690872",
                "username": "snicklink",
                "full_name": "Snicklink",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/0c33487587406d0afb8e6716a6ec7313/5D00FF95/t51.2885-19/s150x150/22639034_1992778997673547_1976144101048844288_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": false,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "179690872",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "179690872",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/0c33487587406d0afb8e6716a6ec7313/5D00FF95/t51.2885-19/s150x150/22639034_1992778997673547_1976144101048844288_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "snicklink"
                    }
                }
            }
        },
        {
            "node": {
                "id": "6599939120",
                "username": "seyyedhasan.a",
                "full_name": "Seyyed Hasan | Ayubi",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/e97c9c9ffc36e38192819c1d494af542/5CF2E376/t51.2885-19/s150x150/49858258_2061426757246657_5362202454999957504_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": true,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "6599939120",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "6599939120",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/e97c9c9ffc36e38192819c1d494af542/5CF2E376/t51.2885-19/s150x150/49858258_2061426757246657_5362202454999957504_n.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "seyyedhasan.a"
                    }
                }
            }
        },
        {
            "node": {
                "id": "5877979552",
                "username": "mashhad.beautiful",
                "full_name": "\u062e\u0648\u0634\u06af\u0644 \u0648\u062e\u0648\u0634\u062a\u064a\u067e\u0627\u06cc \u0645\u0634\u0647\u062f",
                "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/4d61804d80f5d9bf3ab45842c7d03272/5CF889B8/t51.2885-19/s150x150/20837446_1934026983518458_4017750384226336768_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                "is_private": true,
                "is_verified": false,
                "followed_by_viewer": true,
                "requested_by_viewer": false,
                "reel": {
                    "id": "5877979552",
                    "expiring_at": 1548511578,
                    "latest_reel_media": null,
                    "seen": null,
                    "owner": {
                        "__typename": "GraphUser",
                        "id": "5877979552",
                        "profile_pic_url": "https://instagram.fgyd4-2.fna.fbcdn.net/vp/4d61804d80f5d9bf3ab45842c7d03272/5CF889B8/t51.2885-19/s150x150/20837446_1934026983518458_4017750384226336768_a.jpg?_nc_ht=instagram.fgyd4-2.fna.fbcdn.net",
                        "username": "mashhad.beautiful"
                    }
                }
            }
        }
    ];

    let now = (new Date()).getTime();

    let userInsertQuery = "";
    let pwd = passwordHash.generate('123456');

    usersToSeed.forEach((user) => {
       user = user.node;
        userInsertQuery+=`('${user.username}@yahoo.com', '${user.username}', 'test bio', '${pwd}', '', ${now}, ${now}),`;
    });
    userInsertQuery = userInsertQuery.substr(0, userInsertQuery.length-1)

    let insertUserQuery = `INSERT INTO users(email, username, password, bio, token, created_at, updated_at)
            VALUES ${userInsertQuery}`;
    res.send(insertUserQuery);

});


module.exports = router