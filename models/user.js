class utils {
    checkIfUserExistsWithUsername(username){
        let query = `SELECT * FROM users where username = '${username}1'`;

        db.query(query, (err, result) => {
            if (err) {
                //res.redirect('/');
            }
            console.log(result.length)
            // if(result.length>0) return false;
            callback(null, true)
        });
    }

    checkIfUserExistsWithEmail(email){

    }

    checkDatabaseUser(){
        // db.query("INSERT INTO users(email, username, password, created_at, updated_at) VALUES('arash.jeem@gmail.com', 'jimist', 'asadsadadas', 0, 0)")
        let query = "SELECT * FROM `users` ORDER BY id ASC"; // query database to get all the players

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                //res.redirect('/');
            }
            console.log(result)
        });

    }
}

module.exports.utils = utils
// export default user