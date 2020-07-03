"use strict";

const config = require("../../config");

const LerretError = require("../../errors").LerretError;

function isConfigured(conversion) {
    return config.has("convert[" + conversion + "].resize");
}

function apply(conversion, input) {
    const width = config.get("convert[" + conversion + "].resize.width", null);
    const height = config.get("convert[" + conversion + "].resize.height", null);

    if (config.get("convert[" + conversion + "].resize.crop", false) === true) {
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
