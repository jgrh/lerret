"use strict";

const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const log = require("./log");
const yaml = require("js-yaml");

function validateCwd() {
    return fs.readdirAsync(process.cwd())
        .then(items => {
            if (items.length > 0) {
                log.error("Current working directory is not empty");
                throw new Error();
            }
        });
}

function createDirs() {
    function mkdir(name) {
        log.info("Creating directory %s.", name);
        return fs.mkdirAsync(name, 0o755)
            .catch(err => {
                log.error("Could not create directory ./%s, %s", name, err.message);
                throw err;
            });
    }
    return Promise.all([mkdir("content"), mkdir("plugins"), mkdir("target")]);
}

function createYaml() {
    log.info("Creating file lerret.yaml.");
    const config = yaml.safeDump({
        contentDirectory: "./content",
        pluginDirectory: "./plugins",
        targetDirectory: "./target",
        plugins: []
    });
    return fs.writeFileAsync("lerret.yaml", config, { mode: 0o644 })
        .catch(err => {
            log.error("Could not create lerret.yaml, %s", err.message);
            throw err;
        });
}

function init() {
    return validateCwd()
        .then(createDirs)
        .then(createYaml)
        .tap(() => {
            log.info("You're good to go!");
        })
        .catch(() => {});
}

module.exports.init = init;
