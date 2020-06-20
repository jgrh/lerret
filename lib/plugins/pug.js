"use strict";

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

async function compileTemplate(filename) {
    return pug.compileFile(filename, { cache: true, filename: filename });
}

async function renderHome(content) {
    const template = config.get("pug.templates.home");
    log.verbose("Rendering home template %s", template);

    const html = (await compileTemplate(template))({ site: content, helpers: loadHelpers() });
    await writer.writeRootFile("index.html", html);
}

async function renderAlbum(album, index, length, content) {
    const template = config.get("pug.templates.album");
    log.verbose("Rendering album template %s for album %s", template, album.id);

    const html = (await compileTemplate(template))({ site: content, album: album, helpers: loadHelpers() });
    await writer.writeAlbumFile(album, "index.html", html);
}

async function renderImage(image, index, length, album, content) {
    const template = config.get("pug.templates.image");
    log.verbose("Rendering image template %s for image %s/%s", template, album.id, image.id);

    const html = (await compileTemplate(template))({ site: content, album: album, image: image, helpers: loadHelpers() });
    await writer.writeImageFile(album, image, "index.html", html);
}

module.exports = {
    name: "pug",
    processSite: renderHome,
    processAlbum: renderAlbum,
    processImage: renderImage
};
