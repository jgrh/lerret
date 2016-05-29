"use strict";

const Promise = require("bluebird");

const config = require("../config");
const fs = Promise.promisifyAll(require("fs-extra"));
const path = require("path");

function createOutputStreamAsync(filename) {
    return fs.ensureDirAsync(path.dirname(filename))
        .then(() => fs.createWriteStream(filename));
}

function getRootFilename(name) {
    return path.join(config.get("targetDirectory"), name);
}

function getAlbumFilename(album, name) {
    return path.join(config.get("targetDirectory"), album.id, name);
}

function getImageFilename(album, image, name) {
    return path.join(config.get("targetDirectory"), album.id, image.id, name);
}

function writeRootFile(name, data) {
    return fs.outputFileAsync(getRootFilename(name), data);
}

function createRootFileStream(name) {
    return createOutputStreamAsync(getRootFilename(name));
}

function writeAlbumFile(album, name, data) {
    return fs.outputFileAsync(getAlbumFilename(album, name), data);
}

function createAlbumFileStream(album, name) {
    return createOutputStreamAsync(getAlbumFilename(album, name));
}

function writeImageFile(album, image, name, data) {
    return fs.outputFileAsync(getImageFilename(album, image, name), data);
}

function createImageFileStream(album, image, name) {
    return createOutputStreamAsync(getImageFilename(album, image, name));
}

module.exports.writeRootFile = writeRootFile;
module.exports.createRootFileStream = createRootFileStream;
module.exports.writeAlbumFile = writeAlbumFile;
module.exports.createAlbumFileStream = createAlbumFileStream;
module.exports.writeImageFile = writeImageFile;
module.exports.createImageFileStream = createImageFileStream;
