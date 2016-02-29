"use strict";

const Promise = require("bluebird");

const exif = require("./exif");
const helpers = require("./helpers");
const path = require("path");
const _ = require("lodash");

function loadImage(image) {
    const filename = path.join(image, "image.jpg");
    return helpers.readYaml(path.join(image, "image.yaml"))
        .then(yaml => _.assign(yaml, {
            id: path.basename(image),
            exif: exif.readExif(filename),
            filename: filename
        }))
        .then(Promise.props);
}

module.exports.loadImage = loadImage;
