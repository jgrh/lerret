"use strict";

const config = require("../config");
const image = require("./image");
const helpers = require("./helpers");
const log = require("../log");
const path = require("path");
const _ = require("lodash");

function listImages(album) {
    return helpers.listSubdirectories(album)
        .tap(images => {
            log.info("Found images %s within album %s.", _.map(images, image => path.basename(image)).join(", "), path.basename(album));
        });
}

function sortImages(images) {
    if (config.has("sort.images.property")) {
        return _.orderBy(images, config.get("sort.images.property"), config.get("sort.images.order", "asc"));
    }
    else {
        return images;
    }
}

function loadImages(album) {
    return listImages(album).map(image.loadImage).then(sortImages);
}

module.exports.loadImages = loadImages;
