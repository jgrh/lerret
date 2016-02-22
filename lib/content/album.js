"use strict";

const Promise = require("bluebird");

const helpers = require("./helpers");
const images = require("./images");
const path = require("path");
const _ = require("lodash");

function loadAlbum(album) {
    return helpers.readYaml(path.join(album, "album.yaml"))
        .then(yaml => _.assign(yaml, {
            id: path.basename(album),
            images: images.loadImages(album)
        }))
        .then(Promise.props);
}

module.exports.loadAlbum = loadAlbum;
