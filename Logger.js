const pino = require('pino');
const pretty = pino.pretty();
pretty.pipe(process.stdout);
const log = pino({
    name: 'DSB-API-Server',
    safe: true
}, pretty);

module.exports = log;