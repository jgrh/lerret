"use strict";

const content = require("./content");
const log = require("./log");
const plugins = require("./plugins");

const LerretError = require("./errors").LerretError;

async function generate() {
    try {
        await plugins.initPlugins();
        const site = await content.loadContent();
        await plugins.callPlugins(site);
        log.info("All done :)");
    }
    catch (e) {
        if (e instanceof LerretError) {
            log.error(e.message);
        }
        else {
            throw e;
        }
    }
}

module.exports.generate = generate;
