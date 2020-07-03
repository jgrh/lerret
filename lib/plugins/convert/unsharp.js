"use strict";

const config = require("../../config");

function isConfigured(conversion) {
    return config.has("convert[" + conversion + "].unsharp");
}

function apply(conversion, input) {
    return input.unsharp(
        config.get("convert[" + conversion + "].unsharp.radius"),
        config.get("convert[" + conversion + "].unsharp.sigma"),
        config.get("convert[" + conversion + "].unsharp.amount"),
        config.get("convert[" + conversion + "].unsharp.threshold")
    );
}

module.exports.isConfigured = isConfigured;
module.exports.apply = apply;
