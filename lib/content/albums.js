"use strict";

const Promise = require("bluebird");

const album = require("./album");
const config = require("../config");
const helpers = require("./helpers");
const log = require("../log");
const path = require("path");
const _ = require("lodash");

function sortAlbums(albums) {
    if (config.has("sort.albums.property")) {
        return _.orderBy(albums, config.get("sort.albums.property"), config.get("sort.albums.order", "asc"));
    }
    else {
        return albums;
    }
}

async function loadAlbums() {
    const albums = await helpers.listSubdirectories(config.get("contentDirectory"));
    log.info("Found albums %s", _.map(albums, album => path.basename(album)).join(", "));
    return sortAlbums(await Promise.map(albums, album.loadAlbum));
}

module.exports.loadAlbums = loadAlbums;
