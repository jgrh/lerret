"use strict";

const Promise = require("bluebird");

const exif = require("./exif");
const formats = require("../formats");
const fs = Promise.promisifyAll(require("fs"));
const helpers = require("./helpers");
const path = require("path");
const _ = require("lodash");

const LerretError = require("../errors").LerretError;

function getImagePath(image) {
    return Promise.map(formats.getExtensions(), ext => path.join(image, "image" + ext))
        .filter(imagePath => fs.statAsync(imagePath).return(true).catchReturn(false))
        .then(imagePaths => {
            if (imagePaths.length === 0) {
                throw new LerretError("No image file found within %s", image);
            }
            else if (imagePaths.length === 1) {
                return imagePaths[0];
            }
            else {
                throw new LerretError("Found more than one image file within %s", image);
            }
        });
}

function loadImage(image) {
    return Promise.all([
            helpers.readYaml(path.join(image, "image.yaml")),
            getImagePath(image)
        ])
        .then(results => _.assign(results[0], {
            id: path.basename(image),
            exif: exif.readExif(results[1]),
            path: results[1]
        }))
        .then(Promise.props);
}

module.exports.loadImage = loadImage;
