const express = require('express');
const router = express.Router();
const log = require('../Logger');
const DSB = require('dsbapi');
const path = require('path');
const appRootDir = require('app-root-dir').get();
let glob;
let db;

router.get('/api/dsb/v2/:username/:password', (req, res) => {
    log.info(`${req.method} ${req.path} | Pending...`);
    const dsb = new DSB(req.params.username, req.params.password, path.join(appRootDir, `/cache/${req.params.username}/${req.params.username}.json`));
    dsb.getData().then(Data => {
        log.info(`${req.method} ${req.path} | Finished!`);
        res.json(Data);
    }).catch(e => {
        log.error(`${req.method} ${req.path} | Error - 500 1`, e);
        res.status(500).json({error: e});
    });
});

module.exports = function (Objects) {
    glob = Objects;
    db = glob.db;
    return router;
};