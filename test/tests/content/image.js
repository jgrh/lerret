"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const path = require("path");
const _ = require("lodash");

describe("content/image.js", function() {
    //system under test
    const sut = require("../../../lib/content/image");

    const exif = require("../../../lib/content/exif");
    const helpers = require("../../../lib/content/helpers");

    const sandbox = sinon.sandbox.create();

    //stubs
    let readExif;
    let readYaml;

    beforeEach(function () {
        readExif = sandbox.stub(exif, "readExif");
        readYaml = sandbox.stub(helpers, "readYaml");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("loadImage(image)", function () {
        it("should read image.yaml from supplied directory", function () {
            const directory = "./image-1";

            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).then(() => {
                readYaml.should.have.been.calledWith(path.join(directory, "image.yaml"));
            });
        });

        it("should return parsed image.yaml", function () {
            const image = { name: "Image 1" };

            readYaml.returns(Promise.resolve(_.clone(image)));

            return sut.loadImage("").then(result => {
                _.each(image, (value, key) => result.should.have.property(key, value));
            });
        });

        it("should extend parsed image.yaml with id", function () {
            const directory = "./image-1";

            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).then(result => {
                result.should.have.property("id", path.basename(directory));
            });
        });

        it("should overwrite existing id property from image.yaml if there is one", function () {
            const directory = "./image-1";

            readYaml.returns(Promise.resolve({ id: "Original Value"}));

            return sut.loadImage(directory).then(result => {
                result.should.have.property("id", path.basename(directory));
            });
        });

        it("should extend parsed image.yaml with filename", function () {
            const directory = "./image-1";

            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).then(result => {
                result.should.have.property("filename", path.join(directory, "image.jpg"));
            });
        });

        it("should overwrite existing filename property from image.yaml if there is one", function () {
            const directory = "./image-1";

            readYaml.returns(Promise.resolve({ filename: "Original Value"}));

            return sut.loadImage(directory).then(result => {
                result.should.have.property("filename", path.join(directory, "image.jpg"));
            });
        });

        it("should extend parsed image.yaml with exif", function () {
            const directory = "./image-1";
            const exif = "exif";

            readYaml.returns(Promise.resolve({}));
            readExif.withArgs(path.join(directory, "image.jpg")).returns(exif);

            return sut.loadImage(directory).then(result => {
                result.should.have.property("exif", exif);
            });
        });

        it("should overwrite existing exif property from image.yaml if there is one", function () {
            const exif = "exif";

            readYaml.returns(Promise.resolve({ exif: "Original Value"}));
            readExif.returns(exif);

            return sut.loadImage("").then(result => {
                result.should.have.property("exif", exif);
            });
        });
    });
});
