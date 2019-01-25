let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let mysql = require('mysql');

let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'dbsocial'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});


global.db = connection;

let app = express();
let port = process.env.PORT || 3000;

app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(require('./controllers'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
