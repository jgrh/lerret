"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const path = require("path");

describe("plugins/writer.js", function() {
    //system under test
    const sut = require("../../../lib/plugins/writer");

    const config = require("../../../lib/config");
    const fs = require("fs-extra");

    const sandbox = sinon.sandbox.create();

    //stubs
    let createOutputStream;
    let getConfig;
    let outputFileAsync;

    beforeEach(function () {
        createOutputStream = sandbox.stub(fs, "createOutputStream");
        getConfig = sandbox.stub(config, "get");
        outputFileAsync = sandbox.stub(fs, "outputFileAsync");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("writeRootFile(name, data)", function () {
        it("should write data to path constructed from configured target directory and filename", function () {
            const targetDirectory = "./target";
            const filename = "index.html";
            const data = "data";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            outputFileAsync.returns(Promise.resolve());

            return sut.writeRootFile(filename, data).then(() => {
                outputFileAsync.should.be.calledWith(path.join(targetDirectory, filename), data);
            });
        });
    });

    describe("createRootFileStream(name)", function () {
        it("should create output stream to path constructed from configured target directory and filename", function () {
            const targetDirectory = "./target";
            const filename = "index.html";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);

            sut.createRootFileStream(filename);

            createOutputStream.should.be.calledWith(path.join(targetDirectory, filename));
        });

        it("should return output stream", function () {
            const stream = "stream";

            getConfig.returns("");
            createOutputStream.returns(stream);

            sut.createRootFileStream("").should.equal(stream);
        });
    });

    describe("writeAlbumFile(album, name, data)", function () {
        it("should write data to path constructed from configured target directory, album ID and filename", function () {
            const targetDirectory = "./target";
            const album = { id: "album" };
            const filename = "index.html";
            const data = "data";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            outputFileAsync.returns(Promise.resolve());

            return sut.writeAlbumFile(album, filename, data).then(() => {
                outputFileAsync.should.be.calledWith(path.join(targetDirectory, album.id, filename), data);
            });
        });
    });

    describe("createAlbumFileStream(album, name)", function () {
        it("should create output stream to path constructed from configured target directory, album ID and filename", function () {
            const targetDirectory = "./target";
            const album = { id: "album" };
            const filename = "index.html";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);

            sut.createAlbumFileStream(album, filename);

            createOutputStream.should.be.calledWith(path.join(targetDirectory, album.id, filename));
        });

        it("should return output stream", function () {
            const stream = "stream";

            getConfig.returns("");
            createOutputStream.returns(stream);

            sut.createAlbumFileStream({ id: "" }, "").should.equal(stream);
        });
    });

    describe("writeImageFile(album, image, name, data)", function () {
        it("should write data to path constructed from configured target directory, album ID, image ID and filename", function () {
            const targetDirectory = "./target";
            const album = { id: "album" };
            const image = { id: "image" };
            const filename = "index.html";
            const data = "data";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            outputFileAsync.returns(Promise.resolve());

            return sut.writeImageFile(album, image, filename, data).then(() => {
                outputFileAsync.should.be.calledWith(path.join(targetDirectory, album.id, image.id, filename), data);
            });
        });
    });

    describe("createImageFileStream(album, image, name)", function () {
        it("should create output stream to path constructed from configured target directory, album ID, image ID and filename", function () {
            const targetDirectory = "./target";
            const album = { id: "album" };
            const image = { id: "image" };
            const filename = "index.html";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);

            sut.createImageFileStream(album, image, filename);

            createOutputStream.should.be.calledWith(path.join(targetDirectory, album.id, image.id, filename));
        });

        it("should return output stream", function () {
            const stream = "stream";

            getConfig.returns("");
            createOutputStream.returns(stream);

            sut.createImageFileStream({ id: "" }, { id: "" }, "").should.equal(stream);
        });
    });
});
