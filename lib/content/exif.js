"use strict";

const Promise = require("bluebird");

const exif = require("exif-parser");
const fs = Promise.promisifyAll(require("fs"));
const log = require("../log");

const LerretError = require("../errors").LerretError;

async function readExif(filename) {
    const buffer = Buffer.alloc(65635);
    try {
        const fd = await fs.openAsync(filename, "r");
        await fs.readAsync(fd, buffer, 0, buffer.length, 0);
    }
    catch (e) {
        throw new LerretError("Could not read file %s; %s", filename, e.message);
    }

    try {
        return exif.create(buffer).parse().tags;
    }
    catch (e) {
        log.verbose("No exif read from file %s; %s", filename, e.message);
        return {};
    }
}

module.exports.readExif = readExif;
