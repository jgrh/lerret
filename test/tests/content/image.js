"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const path = require("path");
const util = require("util");
const _ = require("lodash");

const LerretError = require("../../../lib/errors").LerretError;

describe("content/image.js", function() {
    //system under test
    const sut = require("../../../lib/content/image");

    const exif = require("../../../lib/content/exif");
    const formats = require("../../../lib/formats");
    const fs = require("fs");
    const helpers = require("../../../lib/content/helpers");

    const sandbox = sinon.createSandbox();

    //stubs
    let getExtensions;
    let readExif;
    let readYaml;
    let statAsync;

    beforeEach(function () {
        getExtensions = sandbox.stub(formats, "getExtensions");
        readExif = sandbox.stub(exif, "readExif");
        readYaml = sandbox.stub(helpers, "readYaml");
        statAsync = sandbox.stub(fs, "statAsync");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("loadImage(image)", function () {
        it("should look within supplied directory for a file for each extension", function () {
            const directory = "./image-1";
            const extensions = [ ".gif", ".jpg", ".png" ];

            getExtensions.returns(extensions);
            statAsync.onFirstCall().returns(Promise.resolve());
            statAsync.returns(Promise.resolve().throw(new Error()));
            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).then(() => {
                statAsync.should.have.been.calledWith(path.join(directory, "image" + extensions[0]));
                statAsync.should.have.been.calledWith(path.join(directory, "image" + extensions[1]));
                statAsync.should.have.been.calledWith(path.join(directory, "image" + extensions[2]));
            });
        });

        it("should throw a LerretError if no image file is found", function () {
            const directory = "./image-1";
            const extensions = [ ".gif", ".jpg", ".png" ];

            getExtensions.returns(extensions);
            statAsync.returns(Promise.resolve().throw(new Error()));
            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).should.be.rejectedWith(LerretError, util.format("No image file found within %s", directory));
        });

        it("should throw a LerretError if more than one image file is found", function () {
            const directory = "./image-1";
            const extensions = [ ".gif", ".jpg", ".png" ];

            getExtensions.returns(extensions);
            statAsync.onFirstCall().returns(Promise.resolve());
            statAsync.onSecondCall().returns(Promise.resolve());
            statAsync.onThirdCall().returns(Promise.resolve().throw(new Error()));
            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).should.be.rejectedWith(LerretError, util.format("Found more than one image file within %s", directory));
        });

        it("should read image.yaml from supplied directory", function () {
            const directory = "./image-1";

            getExtensions.returns([ ".jpg" ]);
            statAsync.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).then(() => {
                readYaml.should.have.been.calledWith(path.join(directory, "image.yaml"));
            });
        });

        it("should return parsed image.yaml", function () {
            const image = { name: "Image 1" };

            getExtensions.returns([ ".jpg" ]);
            statAsync.returns(Promise.resolve());
            readYaml.returns(Promise.resolve(_.clone(image)));

            return sut.loadImage("").then(result => {
                _.each(image, (value, key) => result.should.have.property(key, value));
            });
        });

        it("should extend parsed image.yaml with id", function () {
            const directory = "./image-1";

            getExtensions.returns([ ".jpg" ]);
            statAsync.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).then(result => {
                result.should.have.property("id", path.basename(directory));
            });
        });

        it("should overwrite existing id property from image.yaml if there is one", function () {
            const directory = "./image-1";

            getExtensions.returns([ ".jpg" ]);
            statAsync.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({ id: "Original Value"}));

            return sut.loadImage(directory).then(result => {
                result.should.have.property("id", path.basename(directory));
            });
        });

        it("should extend parsed image.yaml with path property", function () {
            const directory = "./image-1";
            const extensions = [ ".jpg" ];
            const imagePath = path.join(directory, "image" + extensions[0]);

            getExtensions.returns(extensions);
            statAsync.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).then(result => {
                result.should.have.property("path", imagePath);
            });
        });

        it("should overwrite existing path property from image.yaml if there is one", function () {
            const directory = "./image-1";
            const extensions = [ ".jpg" ];
            const imagePath = path.join(directory, "image" + extensions[0]);

            getExtensions.returns(extensions);
            statAsync.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({ path: "Original Value"}));

            return sut.loadImage(directory).then(result => {
                result.should.have.property("path", imagePath);
            });
        });

        it("should parse exif from image file", function () {
            const directory = "./image-1";
            const extensions = [ ".jpg" ];
            const imagePath = path.join(directory, "image" + extensions[0]);

            getExtensions.returns(extensions);
            statAsync.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({}));
            readExif.returns("");

            return sut.loadImage(directory).then(() => {
                readExif.should.have.been.calledWith(imagePath);
            });
        });

        it("should extend parsed image.yaml with exif", function () {
            const directory = "./image-1";
            const exif = "exif";

            getExtensions.returns([ ".jpg" ]);
            statAsync.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({}));
            readExif.returns(exif);

            return sut.loadImage(directory).then(result => {
                result.should.have.property("exif", exif);
            });
        });

        it("should overwrite existing exif property from image.yaml if there is one", function () {
            const exif = "exif";

            getExtensions.returns([ ".jpg" ]);
            statAsync.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({ exif: "Original Value"}));
            readExif.returns(exif);

            return sut.loadImage("").then(result => {
                result.should.have.property("exif", exif);
            });
        });
    });
});
