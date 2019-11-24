const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { execSync } = require('child_process');
execSync('rm -r .key-store; mkdir .key-store', (err, stdout, stderr) => {
    if (err) {
        console.log('Error launching the server - key-store not created')
        return;
    }
});

require('./actors_routes.js')(app);

app.use(express.static(path.join(__dirname, './actors')));

const port = 5002;
app.listen(port);
//check status
console.log('Server running at http://localhost:' + port);