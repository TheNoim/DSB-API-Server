const Promise = require('bluebird');
const async = require('async');
const path = require('path');
const log = require('./Logger');
const fs = Promise.promisifyAll(require('fs'));

module.exports = function (app, cfg, directory) {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (error, Files) => {
            if (error) return reject(error);
            async.each(Files, (File, Callback) => {
                try {
                    const RequirePath = path.join(directory, File);
                    log.info(`Load router from file ${File} with path ${RequirePath}`);
                    app.use(require(RequirePath)({app: app, db: cfg.db, config: cfg.config}));
                    Callback();
                } catch (e) {
                    Callback(e);
                }
            }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    });
};