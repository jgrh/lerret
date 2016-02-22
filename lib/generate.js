"use strict";

const content = require("./content");
const log = require("./log");
const plugins = require("./plugins");

function generate() {
    return plugins.initPlugins()
        .then(content.loadContent)
        .then(plugins.callPlugins)
        .tap(() => {
            log.info("All done :)");
        })
        .catch(() => {});
}

module.exports.generate = generate;
