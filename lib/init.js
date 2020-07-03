"use strict";

const Promise = require("bluebird");

const fs = require("fs").promises;
const log = require("./log");
const yaml = require("js-yaml");

const LerretError = require("./errors").LerretError;

async function validateCwd() {
    let items;
    try {
        items = await fs.readdir(process.cwd());
    } catch (e) {
        throw new LerretError("Could not read current working directory; %s", e.message);
    }
    if (items.length > 0) {
        throw new LerretError("Current working directory is not empty");
    }
}

async function createDirs() {
    async function mkdir(name) {
        log.info("Creating directory %s", name);
        try {
            return await fs.mkdir(name, 0o755);
        } catch (e) {
            throw new LerretError("Could not create directory ./%s; %s", name, e.message);
        }
    }
    return Promise.all([mkdir("content"), mkdir("plugins"), mkdir("target")]);
}

async function createYaml() {
    log.info("Creating file lerret.yaml");
    const config = yaml.safeDump({
        contentDirectory: "./content",
        pluginDirectory: "./plugins",
        targetDirectory: "./target",
        plugins: []
    });
    try {
        return await fs.writeFile("lerret.yaml", config, {
            mode: 0o644
        });
    } catch (e) {
        throw new LerretError("Could not create lerret.yaml; %s", e.message);
    }
}

async function init() {
    try {
        await validateCwd();
        await createDirs();
        await createYaml();
        log.info("You're good to go!");
    } catch (e) {
        if (e instanceof LerretError) {
            log.error(e.message);
        } else {
            throw e;
        }
    }
}

module.exports.init = init;
