"use strict";

const Promise = require("bluebird");

const config = require("../config");
const log = require("../log");
const timer = require("../timer");
const _ = require("lodash");

const LerretError = require("../errors").LerretError;

const plugins = (function() {
    const registered = {};

    function validate(that, message) {
        if (!that) {
            throw new LerretError(message);
        }
    }

    function defaultTo(otherwise) {
        return function(actual) {
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

        registered[name] = async function(content) {
            log.info("Calling plugin %s", name);
            const time = timer.create().stamp("start");

            try {
                if (processSite !== undefined) {
                    content = defaultTo(content)(await processSite(_.cloneDeep(content), config));
                }

                if (processAlbum !== undefined) {
                    content.albums = await Promise.map(content.albums,
                        async (album, index, length) => defaultTo(album)(await processAlbum(_.cloneDeep(album), index, length, _.cloneDeep(content), config))
                    );
                }

                if (processImage !== undefined) {
                    await Promise.each(content.albums,
                        async album => {
                            return _.assign(album, {
                                images: await Promise.map(album.images,
                                    async (image, index, length) => defaultTo(image)(await processImage(_.cloneDeep(image), index, length, _.cloneDeep(album), _.cloneDeep(content), config))
                                )
                            });
                        }
                    );
                }
            } catch (e) {
                throw new LerretError("Plugin %s threw an error; %s", name, e.message);
            }
            log.info("Plugin %s finished in %s", name, time.since("start"));
            return content;
        };
    }

    return {
        getPluginSequence: function(names) {
            return async function(content) {
                return Promise.reduce(_.map(names, name => getPlugin(name)), (result, fn) => fn(result), content);
            };
        },

        installPlugin: function(plugin) {
            installPlugin(plugin.name, plugin.processSite, plugin.processAlbum, plugin.processImage);
        },

        _uninstallAllPlugins: function() {
            _.each(registered, (value, key) => delete registered[key]);
        }
    };
})();

module.exports = plugins;
