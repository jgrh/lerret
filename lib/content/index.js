"use strict";

const Promise = require("bluebird");

const albums = require("./albums");
const config = require("../config");
const helpers = require("./helpers");
const path = require("path");
const _ = require("lodash");

function loadContent() {
    return helpers.readYaml(path.join(config.get("contentDirectory"), "site.yaml"))
        .then(site => _.assign(site, { albums: albums.loadAlbums() }))
        .then(Promise.props);
}

module.exports.loadContent = loadContent;
