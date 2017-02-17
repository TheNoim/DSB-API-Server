const jwt = require('jsonwebtoken');
const owner = process.argv[2];
if (!owner) process.exit(1);
console.log(jwt.sign({
    name: owner
}, require('./config.json').secret));