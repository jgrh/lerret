"use strict";

const Promise = require("bluebird");

const fs = require("fs").promises;
const path = require("path");
const yaml = require("js-yaml");
const _ = require("lodash");

const LerretError = require("../errors").LerretError;

async function listSubdirectories(directory) {
    let filenames;
    try {
        filenames = await Promise.map(fs.readdir(directory), filename => path.join(directory, filename));
    } catch (e) {
        throw new LerretError("Error reading directory %s; %s", directory, e.message);
    }

    return Promise.filter(filenames, async (filename) => {
        try {
            return !filename.startsWith(".") && (await fs.stat(filename)).isDirectory();
        } catch (e) {
            if (e.code == "EACCES" || e.code == "EPERM") {
                return false;
            } else {
                throw e;
            }
        }
    });
}

async function readYaml(filename) {
    try {
        const fd = await fs.readFile(filename);
        const doc = yaml.safeLoad(fd);
        return _.assign({}, doc);
    } catch (e) {
        if (e.code == "ENOENT") {
            return {};
        }
        throw new LerretError("Error reading YAML file %s; %s", filename, e.message);
    }
}

module.exports.listSubdirectories = listSubdirectories;
module.exports.readYaml = readYaml;
