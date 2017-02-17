const express = require('express');
const router = express.Router();
const log = require('../Logger');
const DSB = require('dsbapi');
const path = require('path');
const appRootDir = require('app-root-dir').get();
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const verify = Promise.promisify(jwt.verify);

let glob;
let db;

router.get('/api/dsb/v1/:username/:password', (req, res) => {
    if (!req.query.key){
        res.status(429).json({error: true, message: "You need a key to use the api"});
    } else {
        verify(req.query.key, glob.config.secret || Math.random()).then(Payload => {
            log.info(`${Payload.name} | ${req.method} ${req.path} | Pending...`);
            db.findOneAsync({_id: req.params.username}).then(r => {
                const dsb = new DSB(req.params.username, req.params.password, path.join(appRootDir, `/cache/${req.params.username}/${req.params.username}.json`));
                if (r && r.uuid){
                    return dsb.getDataWithUUIDV1(r.uuid).then(Data => {
                        log.info(`${Payload.name} | ${req.method} ${req.path} | Finished!`);
                        res.json(Data);
                    });
                } else {
                    return dsb.getUUIDV1().then(uuid => {
                        return db.insertAsync({_id: req.params.username, uuid: uuid}).then(() => {
                            return dsb.getDataWithUUIDV1(uuid).then(Data => {
                                log.info(`${Payload.name} | ${req.method} ${req.path} | Finished!`);
                                res.json(Data);
                            });
                        });
                    });
                }
            }).catch(e => {
                log.error(`${Payload.name} | ${req.method} ${req.path} | Error - 500 1`, e);
                res.status(500).json({error: e});
            });
        }).catch((e) => {
            res.status(429).json({error: true, message: "You need a valid key to use the api"});
        });
    }
});

module.exports = function (Objects) {
    glob = Objects;
    db = glob.db;
    return router;
};