
// PORT: 4192

const log = require('./Logger');
const express = require('express');
const RouterLoader = require('./RouterLoader');
const path = require('path');
const app = express();
const Promise = require('bluebird');
const NeDB = Promise.promisifyAll(require('nedb'));
const db = Promise.promisifyAll(new NeDB({filename: path.join(__dirname + '/Database.db'), autoload: true}));
const fs = Promise.promisifyAll(require('fs-extra'));
const config = require('./config.json');

app.enable('trust proxy');

log.info(`Dirname: `, __dirname);

fs.ensureDirAsync(path.join(__dirname + '/cache/')).then(() => {
    return RouterLoader(app, {db: db, config:config},path.join(__dirname, 'routes/')).then(() => {
        app.listen(config.port || 4192, () => {
            log.info(`Listening on ${config.port || 4192}!`);
        });
    });
}).catch(e => log.error(e));