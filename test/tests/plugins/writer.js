"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const path = require("path");

describe("plugins/writer.js", function() {
    //system under test
    const sut = require("../../../lib/plugins/writer");

    const config = require("../../../lib/config");
    const fs = require("fs-extra");

    const sandbox = sinon.createSandbox();

    //stubs
    let createWriteStream;
    let ensureDir;
    let getConfig;
    let outputFile;

    beforeEach(function () {
        createWriteStream = sandbox.stub(fs, "createWriteStream");
        ensureDir = sandbox.stub(fs, "ensureDir");
        getConfig = sandbox.stub(config, "get");
        outputFile = sandbox.stub(fs, "outputFile");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("writeRootFile(name, data)", function () {
        it("should write data to path constructed from configured target directory and filename", async function () {
            const data = "data";
            const filename = "index.html";
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            outputFile.returns(Promise.resolve());

            await sut.writeRootFile(filename, data);

            outputFile.should.be.calledWith(path.join(targetDirectory, filename), data);
        });
    });

    describe("createRootFileStream(name)", function () {
        it("should ensure that the directory of the output file exists", async function () {
            const filename = "index.html";
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            ensureDir.returns(Promise.resolve());

            await sut.createRootFileStream(filename);

            ensureDir.should.be.calledWith(path.dirname(path.join(targetDirectory, filename)));
        });

        it("should ensure that the directory of the output file exists before creating the write stream", async function () {
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            ensureDir.returns(Promise.resolve());

            await sut.createRootFileStream("");

            sinon.assert.callOrder(ensureDir, createWriteStream);
        });

        it("should create write stream to path constructed from configured target directory and filename", async function () {
            const filename = "index.html";
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            ensureDir.returns(Promise.resolve());

            await sut.createRootFileStream(filename);

            createWriteStream.should.be.calledWith(path.join(targetDirectory, filename));
        });

        it("should return write stream", async function () {
            const stream = "stream";

            getConfig.returns("");
            ensureDir.returns(Promise.resolve());
            createWriteStream.returns(Promise.resolve(stream));

            const result = await sut.createRootFileStream("");

            result.should.equal(stream);
        });
    });

    describe("writeAlbumFile(album, name, data)", function () {
        it("should write data to path constructed from configured target directory, album ID and filename", async function () {
            const album = { id: "album" };
            const data = "data";
            const filename = "index.html";
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            outputFile.returns(Promise.resolve());

            await sut.writeAlbumFile(album, filename, data);

            outputFile.should.be.calledWith(path.join(targetDirectory, album.id, filename), data);
        });
    });

    describe("createAlbumFileStream(album, name)", function () {
        it("should ensure that the directory of the output file exists", async function () {
            const album = { id: "album" };
            const filename = "index.html";
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            ensureDir.returns(Promise.resolve());

            await sut.createAlbumFileStream(album, filename);

            ensureDir.should.be.calledWith(path.dirname(path.join(targetDirectory, album.id, filename)));
        });

        it("should ensure that the directory of the output file exists before creating the write stream", async function () {
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            ensureDir.returns(Promise.resolve());

            await sut.createAlbumFileStream({ id: "" }, "");

            sinon.assert.callOrder(ensureDir, createWriteStream);
        });

        it("should create output stream to path constructed from configured target directory, album ID and filename", async function () {
            const album = { id: "album" };
            const filename = "index.html";
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            ensureDir.returns(Promise.resolve());

            await sut.createAlbumFileStream(album, filename);

            createWriteStream.should.be.calledWith(path.join(targetDirectory, album.id, filename));
        });

        it("should return write stream", async function () {
            const stream = "stream";

            getConfig.returns("");
            ensureDir.returns(Promise.resolve());
            createWriteStream.returns(Promise.resolve(stream));

            const result = await sut.createAlbumFileStream({ id: "" }, "");

            result.should.equal(stream);
        });
    });

    describe("writeImageFile(album, image, name, data)", function () {
        it("should write data to path constructed from configured target directory, album ID, image ID and filename", async function () {
            const album = { id: "album" };
            const data = "data";
            const filename = "index.html";
            const image = { id: "image" };
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            outputFile.returns(Promise.resolve());

            await sut.writeImageFile(album, image, filename, data);

            outputFile.should.be.calledWith(path.join(targetDirectory, album.id, image.id, filename), data);
        });
    });

    describe("createImageFileStream(album, image, name)", function () {
        it("should ensure that the directory of the output file exists", async function () {
            const album = { id: "album" };
            const filename = "index.html";
            const image = { id: "image" };
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            ensureDir.returns(Promise.resolve());

            await sut.createImageFileStream(album, image, filename);

            ensureDir.should.be.calledWith(path.dirname(path.join(targetDirectory, album.id, image.id, filename)));
        });

        it("should ensure that the directory of the output file exists before creating the write stream", async function () {
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            ensureDir.returns(Promise.resolve());

            await sut.createImageFileStream({ id: "" }, { id: "" }, "");

            sinon.assert.callOrder(ensureDir, createWriteStream);
        });


        it("should create output stream to path constructed from configured target directory, album ID, image ID and filename", async function () {
            const album = { id: "album" };
            const filename = "index.html";
            const image = { id: "image" };
            const targetDirectory = "./target";

            getConfig.withArgs("targetDirectory").returns(targetDirectory);
            ensureDir.returns(Promise.resolve());

            await sut.createImageFileStream(album, image, filename);

            createWriteStream.should.be.calledWith(path.join(targetDirectory, album.id, image.id, filename));
        });

        it("should return write stream", async function () {
            const stream = "stream";

            getConfig.returns("");
            ensureDir.returns(Promise.resolve());
            createWriteStream.returns(stream);

            const result = await sut.createImageFileStream({ id: "" }, { id: "" }, "");

            result.should.equal(stream);
        });
    });
});
