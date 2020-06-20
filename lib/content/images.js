"use strict";

const Promise = require("bluebird");

const config = require("../config");
const image = require("./image");
const helpers = require("./helpers");
const log = require("../log");
const path = require("path");
const _ = require("lodash");

function sortImages(images) {
    if (config.has("sort.images.property")) {
        return _.orderBy(images, config.get("sort.images.property"), config.get("sort.images.order", "asc"));
    }
    else {
        return images;
    }
}

async function loadImages(album) {
    const images = await helpers.listSubdirectories(album);
    log.info("Found images %s within album %s", _.map(images, image => path.basename(image)).join(", "), path.basename(album));
    return sortImages(await Promise.map(images, image.loadImage));
}

module.exports.loadImages = loadImages;
