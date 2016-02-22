"use strict";

const fs = require("fs");
const log = require("./log");
const path = require("path");
const yaml = require("js-yaml");
const _ = require("lodash");

const config = function() {
    let _config;
    return function() {
        if (_config === undefined) {
            try {
                _config = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), "lerret.yaml")));
            }
            catch(err) {
                log.error("Unable to load ./lerret.yaml, %s", err.message);
                throw err;
            }
        }

        // Set some defaults
        _.defaults(_config, {
            contentDirectory: "./content",
            pluginDirectory: "./plugins"
        });

        return _config;
    };
}();

function get(path, defaultValue) {
    const value = _.get(config(), path, defaultValue);
    if (value === undefined) {
        throw new Error("Configuration parameter '" + path + "' does not exist.");
    }
    else {
        return _.cloneDeep(value);
    }
}

function has(path) {
    return _.has(config(), path);
}

module.exports.get = get;
module.exports.has = has;
