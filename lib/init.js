"use strict";

const Promise = require("bluebird");

const fs = Promise.promisifyAll(require("fs"));
const log = require("./log");
const yaml = require("js-yaml");

const LerretError = require("./errors").LerretError;

function validateCwd() {
    return fs.readdirAsync(process.cwd())
        .catch(err => {
            throw new LerretError("Could not read current working directory; %s", err.message);
        })
        .then(items => {
            if (items.length > 0) {
                throw new LerretError("Current working directory is not empty");
            }
        });
}

function createDirs() {
    function mkdir(name) {
        log.info("Creating directory %s", name);
        return fs.mkdirAsync(name, 0o755)
            .catch(err => {
                throw new LerretError("Could not create directory ./%s; %s", name, err.message);
            });
    }
    return Promise.all([mkdir("content"), mkdir("plugins"), mkdir("target")]);
}

function createYaml() {
    log.info("Creating file lerret.yaml");
    const config = yaml.safeDump({
        contentDirectory: "./content",
        pluginDirectory: "./plugins",
        targetDirectory: "./target",
        plugins: []
    });
    return fs.writeFileAsync("lerret.yaml", config, { mode: 0o644 })
        .catch(err => {
            throw new LerretError("Could not create lerret.yaml; %s", err.message);
        });
}

function init() {
    return validateCwd()
        .then(createDirs)
        .then(createYaml)
        .tap(() => {
            log.info("You're good to go!");
        })
        .catch(LerretError, err => {
            log.error(err.message);
        });
}

module.exports.init = init;
