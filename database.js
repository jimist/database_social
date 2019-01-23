let mysql = require('mysql')

let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'dbsocial'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
})

global.db = connection
