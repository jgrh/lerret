"use strict";

const Promise = require("bluebird");

const config = require("../config");
const fs = Promise.promisifyAll(require("fs"));
const log = require("../log");
const path = require("path");
const writer = require("./writer");

function copy(image, index, length, album) {
    log.debug("Copying image %s/%s.", album.id, image.id);
    return Promise.resolve(config.get("copy.filename", path.basename(image.filename)))
        .then(filename => writer.createImageFileStream(album, image, filename))
        .then(outputStream => fs.createReadStream(image.filename).pipe(outputStream))
        .return();
}

module.exports = {
    name: "copy",
    processImage: copy
};
