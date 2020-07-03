"use strict";

const exif = require("exif-parser");
const fs = require("fs").promises;
const log = require("../log");

const LerretError = require("../errors").LerretError;

async function readExif(filename) {
    const buffer = Buffer.alloc(65635);
    let fd;
    try {
        fd = await fs.open(filename, "r");
        await fd.read(buffer, 0, buffer.length, 0);
    } catch (e) {
        throw new LerretError("Could not read file %s; %s", filename, e.message);
    } finally {
        if (fd !== undefined) await fd.close();
    }

    try {
        return exif.create(buffer).parse().tags;
    } catch (e) {
        log.verbose("No exif read from file %s; %s", filename, e.message);
        return {};
    }
}

module.exports.readExif = readExif;
