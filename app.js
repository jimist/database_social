let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');

let app = express()
let port = 3000

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.get('/', (req, res) => {
   res.render('index', {title: 'arash'});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
