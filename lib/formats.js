"use strict";

const _ = require("lodash");

const LerretError = require("./errors").LerretError;

const formatExtensions = {
    "gif": [ "gif" ],
    "jpeg": [ "jpeg", "jpg" ],
    "png": [ "png" ],
    "tiff": [ "tif", "tiff" ]
};

const extensionFormats = _.fromPairs(_.flatMap(_.toPairs(formatExtensions), pair => _.map(pair[1], extension => [ extension, pair[0] ])));

function getExtensions() {
    return _.keys(extensionFormats);
}

function getFormat(extension) {
    const format = _.get(extensionFormats, extension);
    if (format === undefined) {
        throw new LerretError("Unsupported file extension %s", extension);
    }
    else {
        return format;
    }
}

module.exports.getExtensions = getExtensions;
module.exports.getFormat = getFormat;
