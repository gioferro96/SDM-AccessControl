const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./routes.js')(app);

app.use(express.static(path.join(__dirname, './patient')));

const port = 5001;
app.listen(port);
//check status
console.log('Server running at http://localhost:' + port);
