let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');

let app = express()
let port = 3000 //process.env.PORT || 3000

app.use(cookieParser())

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(require('./controllers'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
