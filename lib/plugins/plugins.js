"use strict";

const Promise = require("bluebird");

const config = require("../config");
const log = require("../log");
const timer = require("../timer");
const _ = require("lodash");

const LerretError = require("../errors").LerretError;

const plugins = (function () {
    const registered = {};

    function validate(that, message) {
        if (!that) {
            throw new LerretError(message);
        }
    }

    function returnWithDefault(otherwise) {
        return function (actual) {
            return (actual !== undefined) ? actual : otherwise;
        };
    }

    function getPlugin(name) {
        validate(_.has(registered, name), "Plugin " + name + " could not be found");
        return registered[name];
    }

    function installPlugin(name, processSite, processAlbum, processImage) {
        validate(name !== undefined, "Plugin does not define a name");
        log.debug("Installing plugin %s", name);

        validate(processSite !== undefined || processAlbum !== undefined || processImage !== undefined,
            "Plugin " + name + " does not define a processSite, processAlbum or processImage function");
        validate(!_.has(registered, name), "Plugin " + name + " already registered");

        registered[name] = function (content) {
            log.info("Calling plugin %s", name);
            const time = timer.create().stamp("start");

            return Promise.resolve(content)
                .then(content => {
                    if (processSite !== undefined) {
                        return Promise.resolve(processSite(_.cloneDeep(content), config))
                            .then(returnWithDefault(content));
                    }
                    else {
                        return content;
                    }
                })
                .then(content => {
                    if (processAlbum !== undefined) {
                        return Promise.resolve(content.albums)
                            .map((album, index, length) => {
                                return Promise.resolve(processAlbum(_.cloneDeep(album), index, length, _.cloneDeep(content), config))
                                    .then(returnWithDefault(album));
                            })
                            .then(albums => _.assign(content, { albums: albums }));
                    }
                    else {
                        return content;
                    }

                })
                .then(content => {
                    if (processImage !== undefined) {
                        return Promise.resolve(content.albums)
                            .map(album => {
                                return Promise.resolve(album.images)
                                    .map((image, index, length) => {
                                        return Promise.resolve(processImage(_.cloneDeep(image), index, length, _.cloneDeep(album), _.cloneDeep(content), config))
                                            .then(returnWithDefault(image));
                                    })
                                    .then(images => _.assign(album, { images: images }));
                            })
                            .then(albums => _.assign(content, { albums: albums }));
                    }
                    else {
                        return content;
                    }
                })
                .catch(err => {
                    throw new LerretError("Plugin %s threw an error; %s", name, err.message);
                })
                .tap(() => {
                    log.info("Plugin %s finished in %s", name, time.since("start"));
                });
        };
    }

    return {
        getPluginSequence: function (names) {
            const sequence = Promise.map(names, name => getPlugin(name));
            return function (content) {
                return sequence.reduce((result, fn) => fn(result, config), content);
            };
        },

        installPlugin: function (plugin) {
            installPlugin(plugin.name, plugin.processSite, plugin.processAlbum, plugin.processImage);
        },

        _uninstallAllPlugins: function () {
            _.each(registered, (value, key) => delete registered[key]);
        }
    };
})();

module.exports = plugins;
