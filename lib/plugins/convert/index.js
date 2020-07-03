"use strict";

const Promise = require("bluebird");

const config = require("../../config");
const formats = require("../../formats");
let gm = require("gm");
Promise.promisifyAll(gm.prototype);
const log = require("../../log");
const matcher = require("../matcher");
const path = require("path");
const writer = require("../writer");
const _ = require("lodash");

const options = [
    require("./resize"),
    require("./unsharp"),
    require("./quality")
];

async function convertSingle(image, album, conversion) {
    const targetFilename = config.get("convert[" + conversion + "].filename");
    log.verbose("Converting image %s/%s to %s", album.id, image.id, targetFilename);

    const outputFormat = formats.getFormat(path.extname(targetFilename));
    const [input, output] = await Promise.all([
        options.filter(option => option.isConfigured(conversion))
        .reduce((output, option) => option.apply(conversion, output), gm(image.path))
        .streamAsync(outputFormat),
        writer.createImageFileStream(album, image, targetFilename)
    ]);

    return input.pipe(output);
}

async function convert(image, index, length, album) {
    await Promise.map(_.range(config.get("convert").length), conversion => convertSingle(image, album, conversion));
}

module.exports = {
    name: "convert",
    processImage: convert
};
