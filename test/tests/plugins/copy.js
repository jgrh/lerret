"use strict";

/*global afterEach, assert, beforeEach, describe, it, sinon*/

const path = require("path");

describe("plugins/copy.js", function() {
    //system under test
    const sut = require("../../../lib/plugins/copy");

    const config = require("../../../lib/config");
    const fs = require("fs");
    const log = require("../../../lib/log");
    const writer = require("../../../lib/plugins/writer");

    const sandbox = sinon.sandbox.create();

    //stubs
    let createImageFileStream;
    let createReadStream;
    let getConfig;
    let logDebug;
    let pipe;

    beforeEach(function () {
        createImageFileStream = sandbox.stub(writer, "createImageFileStream");
        createReadStream = sandbox.stub(fs, "createReadStream");
        getConfig = sandbox.stub(config, "get");
        logDebug = sandbox.stub(log, "debug");
        pipe = sandbox.stub();

        //default stubs
        createReadStream.returns({ pipe: pipe });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("exports name", function () {
        sut.name.should.equal("copy");
    });

    it("exports processImage", function () {
        sut.processImage.should.be.defined;
    });

    describe("processImage(image, index, length, album)", function () {
        it("should log a debug message", function () {
            const album = { id: "album" };
            const image = { id: "image" };

            return sut.processImage(image, 0, 0, album).then(() => {
                logDebug.should.have.been.calledWith("Copying image %s/%s", album.id, image.id);
            });
        });

        it("should create an output stream to the configured filename, defaulting to the current filename", function () {
            const album = { id: "album" };
            const image = { id: "image", path: "./path/to/image.jpg" };
            const filename = "image.jpg";

            getConfig.withArgs("copy.filename", path.basename(image.path)).returns(filename);

            return sut.processImage(image, 0, 0, album).then(() => {
                createImageFileStream.should.have.been.calledWith(album, image, filename);
            });
        });

        it("should create an input stream from the image's filename", function () {
            const image = { path: "./path/to/image.jpg" };

            return sut.processImage(image, 0, 0, {}).then(() => {
                createReadStream.should.have.been.calledWith(image.filename);
            });
        });

        it("should pipe the input stream to the output stream", function () {
            const stream = "stream";

            createImageFileStream.returns(stream);

            return sut.processImage({}, 0, 0, {}).then(() => {
                pipe.should.have.been.calledWith(stream);
            });
        });

        it("should not return anything", function () {
            return sut.processImage({}, 0, 0, {}).then(result => {
                assert(result === undefined);
            });
        });
    });
});
