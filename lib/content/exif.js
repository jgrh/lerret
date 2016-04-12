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
        .catch(err => {
            log.error("Could not read file %s, %s", filename, err.message);
            throw err;
        })
        .then(function () {
            return Promise.try(() => exif.create(this).parse())
                .then(data => data.tags)
                .catch(err => {
                    log.debug("No exif read from file %s, %s", filename, err.message);
                    return {};
                });
        });
}

module.exports.readExif = readExif;
