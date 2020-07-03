"use strict";

const Promise = require("bluebird");

const exif = require("./exif");
const formats = require("../formats");
const fs = require("fs").promises;
const helpers = require("./helpers");
const path = require("path");
const _ = require("lodash");

const LerretError = require("../errors").LerretError;

async function getImagePath(image) {
    const possibleFilenames = _.map(formats.getExtensions(), ext => path.join(image, "image" + ext));
    const matches = await Promise.filter(possibleFilenames, async filename => {
        try {
            await fs.stat(filename);
            return true;
        } catch (e) {
            return false;
        }
    });
    if (matches.length === 0) {
        throw new LerretError("No image file found within %s", image);
    } else if (matches.length === 1) {
        return matches[0];
    } else {
        throw new LerretError("Found more than one image file within %s", image);
    }
}

async function loadImage(image) {
    const [yaml, filename] = await Promise.all([
        helpers.readYaml(path.join(image, "image.yaml")),
        getImagePath(image)
    ]);
    return Promise.props(_.assign(yaml, {
        id: path.basename(image),
        exif: exif.readExif(filename),
        path: filename
    }));
}

module.exports.loadImage = loadImage;
