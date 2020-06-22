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
    const fs = require("fs").promises;
    const helpers = require("../../../lib/content/helpers");

    const sandbox = sinon.createSandbox();

    //stubs
    let getExtensions;
    let readExif;
    let readYaml;
    let stat;

    beforeEach(function () {
        getExtensions = sandbox.stub(formats, "getExtensions");
        readExif = sandbox.stub(exif, "readExif");
        readYaml = sandbox.stub(helpers, "readYaml");
        stat = sandbox.stub(fs, "stat");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("loadImage(image)", function () {
        it("should look within supplied directory for a file for each extension", async function () {
            const directory = "./image-1";
            const extensions = [ ".gif", ".jpg", ".png" ];

            getExtensions.returns(extensions);
            stat.onFirstCall().returns(Promise.resolve());
            stat.returns(Promise.resolve().throw(new Error()));
            readYaml.returns(Promise.resolve({}));

            await sut.loadImage(directory);

            stat.should.have.been.calledWith(path.join(directory, "image" + extensions[0]));
            stat.should.have.been.calledWith(path.join(directory, "image" + extensions[1]));
            stat.should.have.been.calledWith(path.join(directory, "image" + extensions[2]));
        });

        it("should throw a LerretError if no image file is found", function () {
            const directory = "./image-1";
            const extensions = [ ".gif", ".jpg", ".png" ];

            getExtensions.returns(extensions);
            stat.returns(Promise.resolve().throw(new Error()));
            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).should.be.rejectedWith(LerretError, util.format("No image file found within %s", directory));
        });

        it("should throw a LerretError if more than one image file is found", function () {
            const directory = "./image-1";
            const extensions = [ ".gif", ".jpg", ".png" ];

            getExtensions.returns(extensions);
            stat.onFirstCall().returns(Promise.resolve());
            stat.onSecondCall().returns(Promise.resolve());
            stat.onThirdCall().returns(Promise.resolve().throw(new Error()));
            readYaml.returns(Promise.resolve({}));

            return sut.loadImage(directory).should.be.rejectedWith(LerretError, util.format("Found more than one image file within %s", directory));
        });

        it("should read image.yaml from supplied directory", async function () {
            const directory = "./image-1";

            getExtensions.returns([ ".jpg" ]);
            stat.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({}));

            await sut.loadImage(directory);

            readYaml.should.have.been.calledWith(path.join(directory, "image.yaml"));
        });

        it("should return parsed image.yaml", async function () {
            const image = { name: "Image 1" };

            getExtensions.returns([ ".jpg" ]);
            stat.returns(Promise.resolve());
            readYaml.returns(Promise.resolve(_.clone(image)));

            const result = await sut.loadImage("");

            _.each(image, (value, key) => result.should.have.property(key, value));
        });

        it("should extend parsed image.yaml with id", async function () {
            const directory = "./image-1";

            getExtensions.returns([ ".jpg" ]);
            stat.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({}));

            const result = await sut.loadImage(directory);

            result.should.have.property("id", path.basename(directory));
        });

        it("should overwrite existing id property from image.yaml if there is one", async function () {
            const directory = "./image-1";

            getExtensions.returns([ ".jpg" ]);
            stat.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({ id: "Original Value"}));

            const result = await sut.loadImage(directory);

            result.should.have.property("id", path.basename(directory));
        });

        it("should extend parsed image.yaml with path property", async function () {
            const directory = "./image-1";
            const extensions = [ ".jpg" ];
            const imagePath = path.join(directory, "image" + extensions[0]);

            getExtensions.returns(extensions);
            stat.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({}));

            const result = await sut.loadImage(directory);

            result.should.have.property("path", imagePath);
        });

        it("should overwrite existing path property from image.yaml if there is one", async function () {
            const directory = "./image-1";
            const extensions = [ ".jpg" ];
            const imagePath = path.join(directory, "image" + extensions[0]);

            getExtensions.returns(extensions);
            stat.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({ path: "Original Value"}));

            const result = await sut.loadImage(directory);

            result.should.have.property("path", imagePath);
        });

        it("should parse exif from image file", async function () {
            const directory = "./image-1";
            const extensions = [ ".jpg" ];
            const imagePath = path.join(directory, "image" + extensions[0]);

            getExtensions.returns(extensions);
            stat.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({}));
            readExif.returns("");

            await sut.loadImage(directory);

            readExif.should.have.been.calledWith(imagePath);
        });

        it("should extend parsed image.yaml with exif", async function () {
            const directory = "./image-1";
            const exif = "exif";

            getExtensions.returns([ ".jpg" ]);
            stat.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({}));
            readExif.returns(exif);

            const result = await sut.loadImage(directory);

            result.should.have.property("exif", exif);
        });

        it("should overwrite existing exif property from image.yaml if there is one", async function () {
            const exif = "exif";

            getExtensions.returns([ ".jpg" ]);
            stat.returns(Promise.resolve());
            readYaml.returns(Promise.resolve({ exif: "Original Value"}));
            readExif.returns(exif);

            const result = await sut.loadImage("");

            result.should.have.property("exif", exif);
        });
    });
});
