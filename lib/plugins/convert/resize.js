"use strict";

const config = require("../../config");

const LerretError = require("../../errors").LerretError;

function isConfigured(prefix) {
    return config.has(prefix + "resize");
}

function apply(prefix, input) {
    const width = config.get(prefix + "resize.width", null);
    const height = config.get(prefix + "resize.height", null);

    if (config.get(prefix + "resize.crop", false) === true) {
        if (width === null || height === null) {
            throw new LerretError("Cropping requires both a width and a height");
        }
        return input.resize(width, height, "^").gravity("Center").crop(width, height);
    } else {
        if (width === null && height === null) {
            throw new LerretError("Resizing requires at least a width or a height");
        }
        return input.resize(width, height);
    }
}

module.exports.isConfigured = isConfigured;
module.exports.apply = apply;
