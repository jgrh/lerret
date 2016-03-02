"use strict";

const Promise = require("bluebird");

const fs = Promise.promisifyAll(require("fs"));
const log = require("../log");
const path = require("path");
const yaml = require("js-yaml");
const _ = require("lodash");

function listSubdirectories(directory) {
    function isAccessible(filename) {
        return fs.statAsync(filename)
            .return(true)
            .catch({ code: "EACCES" }, { code: "EPERM" }, () => false);
    }

    function isNotHidden(filename) {
        return !filename.startsWith(".");
    }

    function isDirectory(filename) {
        return fs.statAsync(filename)
            .then(stat => stat.isDirectory());
    }

    return fs.readdirAsync(directory)
        .catch(err => {
            log.error("Error reading directory %s, %s", directory, err.message);
            throw err;
        })
        .map(filename => path.join(directory, filename))
        .filter(isAccessible)
        .filter(isNotHidden)
        .filter(isDirectory);
}

function readYaml(filename) {
    return Promise.resolve(filename)
        .then(fs.readFileAsync)
        .then(yaml.safeLoad)
        .then(nullable => _.assign({}, nullable))
        .catch({ code: "ENOENT" }, () => ({}))
        .catch(err => {
            log.error("Error reading YAML file %s, %s", filename, err.message);
            throw err;
        });
}

module.exports.listSubdirectories = listSubdirectories;
module.exports.readYaml = readYaml;
