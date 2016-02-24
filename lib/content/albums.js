"use strict";

const album = require("./album");
const config = require("../config");
const helpers = require("./helpers");
const log = require("../log");
const path = require("path");
const _ = require("lodash");

function listAlbums() {
    return helpers.listSubdirectories(config.get("contentDirectory"))
        .tap(albums => {
            log.info("Found albums %s.", _.map(albums, album => path.basename(album)).join(", "));
        });
}

function sortAlbums(albums) {
    if (config.has("sort.albums.property")) {
        return _.orderBy(albums, config.get("sort.albums.property"), config.get("sort.albums.order", "asc"));
    }
    else {
        return albums;
    }
}

function loadAlbums() {
    return listAlbums().map(album.loadAlbum).then(sortAlbums);
}

module.exports.loadAlbums = loadAlbums;
