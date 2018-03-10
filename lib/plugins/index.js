"use strict";

const Promise = require("bluebird");

const config = require("../config");
const fs = Promise.promisifyAll(require("fs"));
const log = require("../log");
const path = require("path");
const plugins = require("./plugins");

const LerretError = require("../errors").LerretError;

const builtInPlugins = [
    require("./convert"),
    require("./copy"),
    require("./pug")
];

function loadBuiltInPlugins() {
    log.debug("Loading built-in plugins");
    return Promise.each(builtInPlugins, module => plugins.installPlugin(module))
        .return();
}

function loadProjectPlugins() {
    log.debug("Loading project plugins");
    const pluginDirectory = config.get("pluginDirectory");
    return fs.readdirAsync(pluginDirectory)
        .map(filename => path.resolve(pluginDirectory, filename))
        .filter(filename => Promise.resolve(!path.basename(filename).startsWith(".")))
        .filter(filename => {
            return Promise.all([
                    fs.statAsync(filename).then(stat => stat.isDirectory()),
                    Promise.resolve(path.extname(filename) === ".js")
                ])
                .reduce((result, item) => result || item, false);
        })
        .each(filename => {
            return Promise.try(() => require(filename))
                .catch(err => {
                    throw new LerretError("Cannot load module %s; $s", filename, err.message);
                })
                .then(module => plugins.installPlugin(module));
        })
        .return()
        .catch({ code: "ENOENT" }, () => {});
}

function initPlugins() {
    return loadBuiltInPlugins().then(loadProjectPlugins);
}

function callPlugins(content) {
    return Promise.try(() => config.get("plugins"))
        .then(names => plugins.getPluginSequence(names)(content));
}

module.exports.callPlugins = callPlugins;
module.exports.initPlugins = initPlugins;
