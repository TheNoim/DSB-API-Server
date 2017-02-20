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

router.get('/api/dsb/v2/:username/:password', (req, res) => {
    if (!req.query.key) {
        res.status(429).json({error: true, message: "You need a key to use the api"});
    } else {
        verify(req.query.key, glob.config.secret || Math.random()).then(Payload => {
            glob.User.findOneAsync({_id: Payload.name})
                .then((User) => {
                    return new Promise((resolve, reject) => {
                        if (!User){
                            let requestUser = new glob.User();
                            requestUser.owner = Payload.name;
                            requestUser.save();
                            log.info(`${Payload.name} | ${req.method} ${req.path} | Created new user!`);
                            resolve();
                        } else {
                            if (!User.blocked){
                                log.info(`${Payload.name} | ${req.method} ${req.path} | User is not blocked!`);
                                resolve();
                            } else {
                                log.info(`${Payload.name} | ${req.method} ${req.path} | User is blocked!`);
                                reject({error: true, message: "You are blocked!"});
                            }
                        }
                    });
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                        try {
                            let query = new glob.Query();
                            query.date = new Date();
                            query.by = Payload.name;
                            query.ip = req.ip;
                            query.url = req.path;
                            query.save();
                            resolve();
                        } catch (e) {
                            reject({error: true, message: e});
                        }

                    });
                })
                .then(() => {
                    log.info(`${Payload.name} | ${req.method} ${req.path} | Pending...`);
                    const dsb = new DSB(req.params.username, req.params.password, path.join(appRootDir, `/cache/${req.params.username}/${req.params.username}.json`));
                    dsb.getData().then(Data => {
                        log.info(`${Payload.name} | ${req.method} ${req.path} | Finished!`);
                        res.json(Data);
                    }).catch(e => {
                        log.error(`${Payload.name} | ${req.method} ${req.path} | Error - 500 1`, e);
                        res.status(500).json({error: e});
                    });
                })
                .catch((e) => {
                    res.status(500).send(e);
                });
        }).catch((e) => {
            log.error(e);
            res.status(429).json({error: true, message: "You need a valid key to use the api"});
        });
    }
});

module.exports = function (Objects) {
    glob = Objects;
    db = glob.db;
    glob.User = Promise.promisifyAll(glob.User);
    return router;
};