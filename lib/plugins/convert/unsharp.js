"use strict";

const config = require("../../config");

function isConfigured(prefix) {
    return config.has(prefix + "unsharp");
}

function apply(prefix, input) {
    return input.unsharp(
        config.get(prefix + "unsharp.radius"),
        config.get(prefix + "unsharp.sigma"),
        config.get(prefix + "unsharp.amount"),
        config.get(prefix + "unsharp.threshold")
    );
}

module.exports.isConfigured = isConfigured;
module.exports.apply = apply;
