"use strict";

const config = require("../config");
const fs = require("fs");
const log = require("../log");
const match = require("./match");
const path = require("path");
const writer = require("./writer");

async function copy(image, index, length, album) {
    if (match.image("copy", image)) {
        log.verbose("Copying image %s/%s", album.id, image.id);
        const filename = config.get("copy.filename", path.basename(image.path));
        const output = await writer.createImageFileStream(album, image, filename);
        await fs.createReadStream(image.filename).pipe(output);
    }
}

module.exports = {
    name: "copy",
    processImage: copy
};
