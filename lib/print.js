"use strict";

const content = require("./content");
const log = require("./log");
const prettyjson = require("prettyjson");
const stdout = require("./stdout");
const _ = require("lodash");

const LerretError = require("./errors").LerretError;

function removeExif(site) {
    return _.assign(site, {
        "albums": _.map(site.albums, album => _.assign(album, {
            "images": _.map(album.images, image => _.omit(image, "exif"))
        }))
    });
}

function format(site, color) {
    const options = (color) ? {
        dashColor: "white",
        keysColor: "blue",
        numberColor: "yellow",
        stringColor: "white"
    } : {
        noColor: true
    };
    return prettyjson.render(site, options);
}

async function print(options) {
    log.setLevel("warn");
    try {
        const site = await content.loadContent();
        stdout.write(
            format((options.exif) ? site : removeExif(site), options.color)
        );
    } catch (e) {
        if (e instanceof LerretError) {
            log.error(e.message);
        } else {
            throw e;
        }
    }
}

module.exports.print = print;
