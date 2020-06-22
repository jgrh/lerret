"use strict";

const Promise = require("bluebird");

const config = require("../config");
const fs = require("fs").promises;
const log = require("../log");
const path = require("path");
const plugins = require("./plugins");
const _ = require("lodash");

const LerretError = require("../errors").LerretError;

const builtInPlugins = [
    require("./convert"),
    require("./copy"),
    require("./pug")
];

async function loadBuiltInPlugins() {
    log.verbose("Loading built-in plugins");
    await Promise.map(builtInPlugins, module => plugins.installPlugin(module));
}

async function loadProjectPlugins() {
    log.verbose("Loading project plugins");

    let filenames;
    try {
        const pluginDirectory = config.get("pluginDirectory");
        filenames = await Promise.map(fs.readdir(pluginDirectory), filename => path.resolve(pluginDirectory, filename));
    }
    catch (e) {
        if (e.code == "ENOENT") {
            return;
        }
    }

    const pluginFilenames = await Promise.filter(filenames, async (filename) => {
        try {
            return !path.basename(filename).startsWith(".") && ((await fs.stat(filename)).isDirectory() || path.extname(filename) === ".js");
        }
        catch (e) {
            if (e.code == "EACCES" || e.code == "EPERM") {
                return false;
            }
            else {
                throw e;
            }
        }
    });

    _.each(pluginFilenames, filename => {
        let module;
        try {
            module = require(filename);
        }
        catch (e) {
            throw new LerretError("Cannot load module %s; $s", filename, e.message);
        }
        plugins.installPlugin(module);
    });
}

async function initPlugins() {
    await loadBuiltInPlugins();
    await loadProjectPlugins();
}

async function callPlugins(content) {
    return plugins.getPluginSequence(config.get("plugins"))(content);
}

module.exports.callPlugins = callPlugins;
module.exports.initPlugins = initPlugins;
