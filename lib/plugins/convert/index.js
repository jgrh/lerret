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

async function convertSingle(image, album, prefix) {
    const targetFilename = config.get(prefix + "filename");
    log.verbose("Converting image %s/%s to %s", album.id, image.id, targetFilename);

    const outputFormat = formats.getFormat(path.extname(targetFilename));
    const [input, output] = await Promise.all([
        options.filter(option => option.isConfigured(prefix))
        .reduce((output, option) => option.apply(prefix, output), gm(image.path))
        .streamAsync(outputFormat),
        writer.createImageFileStream(album, image, targetFilename)
    ]);

    return input.pipe(output);
}

async function convert(image, index, length, album) {
    const prefixes = _.map(_.range(config.get("convert").length), i => "convert[" + i + "].");
    await Promise.map(prefixes, prefix => convertSingle(image, album, prefix));
}

module.exports = {
    name: "convert",
    processImage: convert
};
