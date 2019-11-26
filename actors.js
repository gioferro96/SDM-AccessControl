const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();
const cors = require('cors')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./actors_routes.js')(app);
app.use(cors());
app.use(express.static(path.join(__dirname, './actors')));

const port = 5002;
app.listen(port);
//check status
console.log('Server running at http://localhost:' + port);
