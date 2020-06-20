"use strict";

const Promise = require("bluebird");

const helpers = require("./helpers");
const images = require("./images");
const path = require("path");
const _ = require("lodash");

async function loadAlbum(album) {
    return Promise.props(_.assign(
        await helpers.readYaml(path.join(album, "album.yaml")),
        {
            id: path.basename(album),
            images: images.loadImages(album)
        }
    ));
}

module.exports.loadAlbum = loadAlbum;
