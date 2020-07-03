"use strict";

const Promise = require("bluebird");

const albums = require("./albums");
const config = require("../config");
const helpers = require("./helpers");
const path = require("path");
const _ = require("lodash");

async function loadContent() {
    const site = await helpers.readYaml(path.join(config.get("contentDirectory"), "site.yaml"));
    return Promise.props(_.assign(site, {
        albums: albums.loadAlbums()
    }));
}

module.exports.loadContent = loadContent;
