"use strict";

const Promise = require("bluebird");

const config = require("../config");
const pug = require("pug");
const log = require("../log");
const path = require("path");
const writer = require("./writer");

function loadHelpers() {
    if (config.has("pug.helpers")) {
        return require(path.resolve(config.get("pug.helpers")));
    }
    else {
        return {};
    }
}

function compileTemplate(filename) {
    return Promise.resolve(pug.compileFile(filename, { cache: true, filename: filename }));
}

function renderHome(content) {
    return Promise.resolve(config.get("pug.templates.home"))
        .tap(template => {
            log.verbose("Rendering home template %s", template);
        })
        .then(template => compileTemplate(template))
        .then(fn => fn({ site: content, helpers: loadHelpers() }))
        .then(html => writer.writeRootFile("index.html", html))
        .return();
}

function renderAlbum(album, index, length, content) {
    return Promise.resolve(config.get("pug.templates.album"))
        .tap(template => {
            log.verbose("Rendering album template %s for album %s", template, album.id);
        })
        .then(template => compileTemplate(template))
        .then(fn => fn({ site: content, album: album, helpers: loadHelpers() }))
        .then(html => writer.writeAlbumFile(album, "index.html", html))
        .return();
}

function renderImage(image, index, length, album, content) {
    return Promise.resolve(config.get("pug.templates.image"))
        .tap(template => {
            log.verbose("Rendering image template %s for image %s/%s", template, album.id, image.id);
        })
        .then(template => compileTemplate(template))
        .then(fn => fn({ site: content, album: album, image: image, helpers: loadHelpers() }))
        .then(html => writer.writeImageFile(album, image, "index.html", html))
        .return();
}

module.exports = {
    name: "pug",
    processSite: renderHome,
    processAlbum: renderAlbum,
    processImage: renderImage
};
