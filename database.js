let mysql = require('mysql')

let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'dbsocial'
});

connection.connect()

module.exports.default = connection
