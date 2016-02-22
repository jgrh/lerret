"use strict";

const Promise = require("bluebird");

const exif = require("exif-parser");
const fs = Promise.promisifyAll(require("fs"));
const log = require("../log");

function readExif(filename) {
    return fs.openAsync(filename, "r")
        .bind(new Buffer(65635))
        .then(function (fd) {
            return fs.readAsync(fd, this, 0, this.length, 0);
        })
        .then(function () {
            return exif.create(this).parse();
        })
        .then(data => data.tags)
        .catch(err => {
            log.error("Error reading exif from file %s. %s", filename, err.message);
        });
}

module.exports.readExif = readExif;
