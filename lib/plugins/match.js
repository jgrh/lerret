"use strict";

const config = require("../config");
const _ = require("lodash");

function image(configPath, image) {
    if (config.has(configPath + ".match")) {
        const property = config.get(configPath + ".match.property");
        const regex = new RegExp(config.get(configPath + ".match.regex"));
        return _.has(image, property) && regex.test(_.get(image, property));
    } else {
        return true;
    }
}

module.exports.image = image;
