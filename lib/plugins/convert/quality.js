"use strict";

const config = require("../../config");

function isConfigured(conversion) {
    return config.has("convert[" + conversion + "].quality");
}

function apply(conversion, input) {
    return input.quality(config.get("convert[" + conversion + "].quality"));
}

module.exports.isConfigured = isConfigured;
module.exports.apply = apply;
