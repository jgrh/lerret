"use strict";

const Promise = require("bluebird");

const config = require("../../config");
const formats = require("../../formats");
let gm = require("gm");
Promise.promisifyAll(gm.prototype);
const log = require("../../log");
const path = require("path");
const writer = require("../writer");
const _ = require("lodash");

const options = [
    require("./resize"),
    require("./unsharp"),
    require("./quality")
];

function convert(image, index, length, album) {
    return Promise.map(_.range(config.get("convert").length), i => "convert[" + i + "].")
        .each(prefix => {
            const targetFilename = config.get(prefix + "filename");

            log.debug("Converting image %s/%s to %s", album.id, image.id, targetFilename);

            return Promise.all([
                    _.reduce(
                        _.filter(options, option => option.isConfigured(prefix)),
                        (output, option) => option.apply(prefix, output),
                        gm(image.path)
                    )
                    .streamAsync(formats.getFormat(path.extname(targetFilename))),
                    writer.createImageFileStream(album, image, targetFilename)
                ])
                .spread((input, output) => input.pipe(output));
    })
    .return();
}

module.exports = {
    name: "convert",
    processImage: convert
};
