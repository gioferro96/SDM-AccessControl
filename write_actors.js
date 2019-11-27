const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();
const cors = require('cors')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*const { execSync } = require('child_process');
execSync('rm -r .key-store; mkdir .key-store', (err, stdout, stderr) => {
    if (err) {
        console.log('Error launching the server - key-store not created')
        return;
    }
});*/

require('./write_actors_route.js')(app);
app.use(cors());
app.use(express.static(path.join(__dirname, './write_actors')));

const port = 5003;
app.listen(port);
//check status
console.log('Server running at http://localhost:' + port);
