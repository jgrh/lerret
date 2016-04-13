"use strict";

/*global afterEach, assert, beforeEach, describe, it, sinon*/

const rewire = require("rewire");

describe("plugins/resize.js", function() {
    //system under test
    const sut = rewire("../../../lib/plugins/resize");

    const config = require("../../../lib/config");
    const log = require("../../../lib/log");
    const writer = require("../../../lib/plugins/writer");

    const sandbox = sinon.sandbox.create();

    //stubs
    let createImageFileStream;
    let crop;
    let getConfig;
    let gm;
    let gravity;
    let hasConfig;
    let logDebug;
    let pipe;
    let quality;
    let resize;
    let unsharp;

    beforeEach(function () {
        createImageFileStream = sandbox.stub(writer, "createImageFileStream");
        crop = sandbox.stub();
        getConfig = sandbox.stub(config, "get");
        gm = sandbox.stub();
        gravity = sandbox.stub();
        hasConfig = sandbox.stub(config, "has");
        logDebug = sandbox.stub(log, "debug");
        pipe = sandbox.stub();
        quality = sandbox.stub();
        resize = sandbox.stub();
        unsharp = sandbox.stub();

        sut.__set__("gm", gm);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("exports name", function () {
        sut.name.should.equal("resize");
    });

    it("exports processImage", function () {
        sut.processImage.should.be.defined;
    });

    describe("processImage(image, index, length, album)", function () {
        it("should log an debug message", function () {
            const album = { id: "album" };
            const image = { id: "image" };
            const mode = "max";
            const width = 400;
            const height = 300;

            getConfig.withArgs("resize").returns([{}]);
            getConfig.withArgs("resize[0].mode", "max").returns(mode);
            getConfig.withArgs("resize[0].width").returns(width);
            getConfig.withArgs("resize[0].height").returns(height);
            hasConfig.returns(false);
            gm.returns({ resize: resize });
            resize.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });

            return sut.processImage(image, 0, 0, album).then(() => {
                logDebug.should.have.been.calledWith("Resizing image %s/%s to %spx x %spx (%s W x H)", album.id, image.id, width, height, mode);
            });
        });

        it("should pass image filename to gm", function () {
            const image = { filename: "./image.jpg" };

            getConfig.withArgs("resize").returns([{}]);
            gm.returns({ resize: resize });
            resize.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });

            return sut.processImage(image, 0, 0, {}).then(() => {
                gm.should.have.been.calledWith(image.filename);
            });
        });

        it("should resize image with maximum dimensions if mode is max", function () {
            const image = { id: "image" };
            const width = 400;
            const height = 300;

            getConfig.withArgs("resize").returns([{}]);
            getConfig.withArgs("resize[0].mode", "max").returns("max");
            getConfig.withArgs("resize[0].width").returns(width);
            getConfig.withArgs("resize[0].height").returns(height);
            hasConfig.returns(false);
            gm.returns({ resize: resize });
            resize.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });

            return sut.processImage(image, 0, 0, {}).then(() => {
                resize.should.have.been.calledWith(width, height);
            });
        });

        it("should resize image with minimum dimensions if mode is min", function () {
            const image = { id: "image" };
            const width = 400;
            const height = 300;

            getConfig.withArgs("resize").returns([{}]);
            getConfig.withArgs("resize[0].mode", "max").returns("min");
            getConfig.withArgs("resize[0].width").returns(width);
            getConfig.withArgs("resize[0].height").returns(height);
            hasConfig.returns(false);
            gm.returns({ resize: resize });
            resize.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });

            return sut.processImage(image, 0, 0, {}).then(() => {
                resize.should.have.been.calledWith(width, height, "^");
            });
        });

        it("should crop image if mode is crop", function () {
            const image = { id: "image" };
            const width = 400;
            const height = 300;

            getConfig.withArgs("resize").returns([{}]);
            getConfig.withArgs("resize[0].mode", "max").returns("crop");
            getConfig.withArgs("resize[0].width").returns(width);
            getConfig.withArgs("resize[0].height").returns(height);
            hasConfig.returns(false);
            gm.returns({ resize: resize });
            resize.returns({ gravity: gravity });
            gravity.returns({ crop: crop });
            crop.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });

            return sut.processImage(image, 0, 0, {}).then(() => {
                resize.should.have.been.calledWith(width, height, "^");
                gravity.should.have.been.calledWith("Center");
                crop.should.have.been.calledWith(width, height);
            });
        });

        it("should sharpen image if configured", function () {
            const image = { id: "image" };
            const radius = 1;
            const sigma = 2;
            const amount = 3;
            const threshold = 4;

            getConfig.withArgs("resize").returns([{}]);
            hasConfig.withArgs("resize[0].unsharp").returns(true);
            getConfig.withArgs("resize[0].unsharp.radius").returns(radius);
            getConfig.withArgs("resize[0].unsharp.sigma").returns(sigma);
            getConfig.withArgs("resize[0].unsharp.amount").returns(amount);
            getConfig.withArgs("resize[0].unsharp.threshold").returns(threshold);
            hasConfig.returns(false);
            gm.returns({ resize: resize });
            resize.returns({ unsharp: unsharp });
            unsharp.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });

            return sut.processImage(image, 0, 0, {}).then(() => {
                unsharp.should.have.been.calledWith(radius, sigma, amount, threshold);
            });
        });

        it("should set image quality if configured", function () {
            const image = { id: "image" };
            const qual = 80;

            getConfig.withArgs("resize").returns([{}]);
            hasConfig.withArgs("resize[0].quality").returns(true);
            getConfig.withArgs("resize[0].quality").returns(qual);
            hasConfig.returns(false);
            gm.returns({ resize: resize });
            resize.returns({ quality: quality });
            quality.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });

            return sut.processImage(image, 0, 0, {}).then(() => {
                quality.should.have.been.calledWith(qual);
            });
        });

        it("should create file output stream to configured filename", function () {
            const image = { id: "image" };
            const album = { id: "album" };
            const filename = "./output.jpg";

            getConfig.withArgs("resize").returns([{}]);
            getConfig.withArgs("resize[0].filename").returns(filename);
            hasConfig.returns(false);
            gm.returns({ resize: resize });
            resize.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });

            return sut.processImage(image, 0, 0, album).then(() => {
                createImageFileStream.should.have.been.calledWith(album, image, filename);
            });
        });

        it("should pipe gm output to file output stream", function () {
            const image = { id: "image" };
            const album = { id: "album" };
            const stream = "stream";

            getConfig.withArgs("resize").returns([{}]);
            gm.returns({ resize: resize });
            resize.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });
            createImageFileStream.returns(stream);

            return sut.processImage(image, 0, 0, album).then(() => {
                pipe.should.have.been.calledWith(stream);
            });
        });

        it("should not return anything", function () {
            const image = { id: "image" };

            getConfig.withArgs("resize").returns([{}]);
            gm.returns({ resize: resize });
            resize.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });

            return sut.processImage(image, 0, 0, {}).then(result => {
                assert(result === undefined);
            });
        });

        it("should resize image for each config entry", function () {
            const image = { id: "image" };
            const config = [{}, {}];

            getConfig.withArgs("resize").returns(config);
            gm.returns({ resize: resize });
            resize.returns({ streamAsync: () => Promise.resolve({ pipe: pipe }) });

            return sut.processImage(image, 0, 0, {}).then(() => {
                resize.should.have.callCount(config.length);
                createImageFileStream.should.have.callCount(config.length);
            });
        });
    });
});
