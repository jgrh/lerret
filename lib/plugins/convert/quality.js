"use strict";

const config = require("../../config");

function isConfigured(prefix) {
    return config.has(prefix + "quality");
}

function apply(prefix, input) {
    return input.quality(config.get(prefix + "quality"));
}

module.exports.isConfigured = isConfigured;
module.exports.apply = apply;
