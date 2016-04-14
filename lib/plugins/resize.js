"use strict";

const Promise = require("bluebird");

const config = require("../config");
const formats = require("../formats");
let gm = require("gm");
Promise.promisifyAll(gm.prototype);
const log = require("../log");
const path = require("path");
const writer = require("./writer");
const _ = require("lodash");

function key(i, path) {
    return "resize[" + i + "]." + path;
}

function resize(image, index, length, album) {
    return Promise.each(_.range(config.get("resize").length), i => {
        const mode = config.get(key(i, "mode"), "max");
        const width = config.get(key(i, "width"));
        const height = config.get(key(i, "height"));

        log.debug("Resizing image %s/%s to %spx x %spx (%s W x H)", album.id, image.id, width, height, mode);

        let resized = gm(image.filename).resize(width, height, _.includes(["min", "crop"], mode) ? "^" : undefined);

        if (mode === "crop") {
            resized = resized.gravity("Center").crop(width, height);
        }

        if (config.has(key(i, "unsharp"))) {
            resized = resized.unsharp(
                config.get(key(i, "unsharp.radius")),
                config.get(key(i, "unsharp.sigma")),
                config.get(key(i, "unsharp.amount")),
                config.get(key(i, "unsharp.threshold"))
            );
        }

        if (config.has(key(i, "quality"))) {
            resized = resized.quality(config.get(key(i, "quality")));
        }

        const targetFilename = config.get(key(i, "filename"));
        const targetFormat = formats.getFormat(path.extname(targetFilename));


        return Promise.resolve(writer.createImageFileStream(album, image, targetFilename))
            .then(output => resized.streamAsync(targetFormat).then(stdout => stdout.pipe(output)));
    })
    .return();
}

module.exports = {
    name: "resize",
    processImage: resize
};
