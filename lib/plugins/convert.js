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

const LerretError = require("../errors").LerretError;

function convert(image, index, length, album) {
    return Promise.map(_.range(config.get("convert").length), i => "convert[" + i + "].")
        .each(prefix => {
            const targetFilename = config.get(prefix + "filename");

            log.debug("Converting image %s/%s to %s", album.id, image.id, targetFilename);

            let output = gm(image.path);

            if (config.has(prefix + "resize")) {
                const width = config.get(prefix + "resize.width", null);
                const height = config.get(prefix + "resize.height", null);

                if (config.get(prefix + "resize.crop", false) === true) {
                    if (width === null || height === null) {
                        throw new LerretError("Cropping requires both a width and a height");
                    }
                    output = output.resize(width, height, "^").gravity("Center").crop(width, height);
                }
                else {
                    if (width === null && height === null) {
                        throw new LerretError("Resizing requires at least a width or a height");
                    }
                    output = output.resize(width, height);
                }
            }

            if (config.has(prefix + "unsharp")) {
                output = output.unsharp(
                    config.get(prefix + "unsharp.radius"),
                    config.get(prefix + "unsharp.sigma"),
                    config.get(prefix + "unsharp.amount"),
                    config.get(prefix + "unsharp.threshold")
                );
            }

            if (config.has(prefix + "quality")) {
                output = output.quality(config.get(prefix + "quality"));
            }

            return output.streamAsync(formats.getFormat(path.extname(targetFilename)))
                .then(stream => stream.pipe(writer.createImageFileStream(album, image, targetFilename)));
    })
    .return();
}

module.exports = {
    name: "convert",
    processImage: convert
};
