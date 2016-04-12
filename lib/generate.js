"use strict";

const content = require("./content");
const log = require("./log");
const plugins = require("./plugins");

const LerretError = require("./errors").LerretError;

function generate() {
    return plugins.initPlugins()
        .then(content.loadContent)
        .then(plugins.callPlugins)
        .tap(() => {
            log.info("All done :)");
        })
        .catch(LerretError, err => {
            log.error(err.message);
        });
}

module.exports.generate = generate;
