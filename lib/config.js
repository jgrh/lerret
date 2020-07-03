"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const _ = require("lodash");

const LerretError = require("./errors").LerretError;

const config = function() {
    let _config;
    return function() {
        if (_config === undefined) {
            try {
                _config = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), "lerret.yaml")));
            } catch (e) {
                throw new LerretError("Unable to load ./lerret.yaml; %s", e.message);
            }
        }

        _.defaults(_config, {
            contentDirectory: "./content",
            pluginDirectory: "./plugins"
        });

        return _config;
    };
}();

function get(key, defaultValue) {
    const value = _.get(config(), key, defaultValue);
    if (value === undefined) {
        throw new LerretError("Configuration parameter %s does not exist", key);
    } else {
        return _.cloneDeep(value);
    }
}

function has(key) {
    return _.has(config(), key);
}

module.exports.get = get;
module.exports.has = has;
