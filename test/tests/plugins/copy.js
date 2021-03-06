"use strict";

/*global afterEach, assert, beforeEach, describe, it, sinon*/

const path = require("path");

describe("plugins/copy.js", function() {
    //system under test
    const sut = require("../../../lib/plugins/copy");

    const config = require("../../../lib/config");
    const fs = require("fs");
    const log = require("../../../lib/log");
    const match = require("../../../lib/plugins/match");
    const writer = require("../../../lib/plugins/writer");

    const sandbox = sinon.createSandbox();

    //stubs
    let createImageFileStream;
    let createReadStream;
    let getConfig;
    let matchImage;
    let logVerbose;
    let pipe;

    beforeEach(function() {
        createImageFileStream = sandbox.stub(writer, "createImageFileStream");
        createReadStream = sandbox.stub(fs, "createReadStream");
        getConfig = sandbox.stub(config, "get");
        matchImage = sandbox.stub(match, "image");
        logVerbose = sandbox.stub(log, "verbose");
        pipe = sandbox.stub();

        //default stubs
        createReadStream.returns({
            pipe: pipe
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it("exports name", function() {
        sut.name.should.equal("copy");
    });

    it("exports processImage", function() {
        sut.processImage.should.not.be.undefined;
    });

    describe("processImage(image, index, length, album)", function() {
        it("should check whether image matches config", async function() {
            const image = {
                id: "image",
                path: "./path/to/image.jpg"
            };

            matchImage.returns(false);

            await sut.processImage(image, 0, 0, {});

            matchImage.should.have.been.calledWith("copy", image);
        });

        it("should not process image if image does not match config", async function() {
            matchImage.returns(false);

            const result = await sut.processImage({}, 0, 0, {});

            pipe.should.not.have.been.called;
            assert(result === undefined);
        });

        it("should log a verbose message", async function() {
            const album = {
                id: "album"
            };
            const image = {
                id: "image",
                path: "./path/to/image.jpg"
            };

            matchImage.returns(true);

            await sut.processImage(image, 0, 0, album);

            logVerbose.should.have.been.calledWith("Copying image %s/%s", album.id, image.id);
        });

        it("should create an output stream to the configured filename, defaulting to the current filename", async function() {
            const album = {
                id: "album"
            };
            const image = {
                id: "image",
                path: "./path/to/image.jpg"
            };
            const filename = "image.jpg";

            matchImage.returns(true);
            getConfig.withArgs("copy.filename", path.basename(image.path)).returns(filename);

            await sut.processImage(image, 0, 0, album);

            createImageFileStream.should.have.been.calledWith(album, image, filename);
        });

        it("should create an input stream from the image's filename", async function() {
            const image = {
                path: "./path/to/image.jpg"
            };

            matchImage.returns(true);

            await sut.processImage(image, 0, 0, {});

            createReadStream.should.have.been.calledWith(image.filename);
        });

        it("should pipe the input stream to the output stream", async function() {
            const stream = "stream";

            matchImage.returns(true);
            createImageFileStream.returns(Promise.resolve(stream));

            await sut.processImage({
                path: "./path/to/image.jpg"
            }, 0, 0, {});

            pipe.should.have.been.calledWith(stream);
        });

        it("should not return anything", async function() {
            matchImage.returns(true);

            const result = await sut.processImage({
                path: "./path/to/image"
            }, 0, 0, {});

            assert(result === undefined);
        });
    });
});
