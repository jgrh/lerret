"use strict";

/*global afterEach, assert, beforeEach, describe, it, sinon*/

const path = require("path");
const rewire = require("rewire");

describe("plugins/convert/index.js", function() {
    //system under test
    const sut = rewire("../../../../lib/plugins/convert");

    const config = require("../../../../lib/config");
    const formats = require("../../../../lib/formats");
    const log = require("../../../../lib/log");
    const quality = require("../../../../lib/plugins/convert/quality");
    const resize = require("../../../../lib/plugins/convert/resize");
    const unsharp = require("../../../../lib/plugins/convert/unsharp");
    const writer = require("../../../../lib/plugins/writer");

    const sandbox = sinon.createSandbox();

    //stubs
    let applyQuality;
    let applyResize;
    let applyUnsharp;
    let createImageFileStream;
    let getConfig;
    let getFormat;
    let gm;
    let isQualityConfigured;
    let isResizeConfigured;
    let isUnsharpConfigured;
    let logVerbose;
    let pipe;
    let streamAsync;

    beforeEach(function () {
        applyQuality = sandbox.stub(quality, "apply");
        applyResize = sandbox.stub(resize, "apply");
        applyUnsharp = sandbox.stub(unsharp, "apply");
        createImageFileStream = sandbox.stub(writer, "createImageFileStream");
        getConfig = sandbox.stub(config, "get");
        getFormat = sandbox.stub(formats, "getFormat");
        gm = sandbox.stub();
        isQualityConfigured = sandbox.stub(quality, "isConfigured");
        isResizeConfigured = sandbox.stub(resize, "isConfigured");
        isUnsharpConfigured = sandbox.stub(unsharp, "isConfigured");
        logVerbose = sandbox.stub(log, "verbose");
        pipe = sandbox.stub();
        streamAsync = sandbox.stub();

        sut.__set__("gm", gm);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("exports name", function () {
        sut.name.should.equal("convert");
    });

    it("exports processImage", function () {
        sut.processImage.should.not.be.undefined;
    });

    describe("processImage(image, index, length, album)", function () {
        it("should log a verbose message", async function () {
            const album = { id: "album" };
            const filename = "output.jpg";
            const image = { id: "image" };

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns(filename);
            gm.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            await sut.processImage(image, 0, 0, album);

            logVerbose.should.have.been.calledWith("Converting image %s/%s to %s", album.id, image.id, filename);
        });

        it("should pass image path to gm", async function () {
            const image = { path: "./image.jpg" };

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns("output.jpg");
            gm.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            await sut.processImage(image, 0, 0, {});

            gm.should.have.been.calledWith(image.path);
        });

        it("should apply resize if configured", async function () {
            const album = { id: "album" };
            const image = { id: "image" };
            const input = "input";

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns("output.jpg");
            isResizeConfigured.withArgs("convert[0].").returns(true);
            gm.returns(input);
            applyResize.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            await sut.processImage(image, 0, 0, album);

            applyResize.should.have.been.calledWith("convert[0].", input);
        });

        it("should apply unsharp if configured", async function () {
            const album = { id: "album" };
            const image = { id: "image" };
            const input = "input";

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns("output.jpg");
            isUnsharpConfigured.withArgs("convert[0].").returns(true);
            gm.returns(input);
            applyUnsharp.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            await sut.processImage(image, 0, 0, album);

            applyUnsharp.should.have.been.calledWith("convert[0].", input);
        });

        it("should apply quality if configured", async function () {
            const album = { id: "album" };
            const image = { id: "image" };
            const input = "input";

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns("output.jpg");
            isQualityConfigured.withArgs("convert[0].").returns(true);
            gm.returns(input);
            applyQuality.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            await sut.processImage(image, 0, 0, album);

            applyQuality.should.have.been.calledWith("convert[0].", input);
        });

        it("should apply resize, unsharp and quality in sequence", async function () {
            const album = { id: "album" };
            const image = { id: "image" };
            const input = "input";
            const resizeOutput = "resizeOutput";
            const unsharpOutput = "unsharpOutput";

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns("output.jpg");
            isResizeConfigured.returns(true);
            isUnsharpConfigured.returns(true);
            isQualityConfigured.returns(true);
            gm.returns(input);
            applyResize.returns(resizeOutput);
            applyUnsharp.returns(unsharpOutput);
            applyQuality.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            await sut.processImage(image, 0, 0, album);

            applyResize.should.have.been.calledWith(sinon.match.any, input);
            applyUnsharp.should.have.been.calledWith(sinon.match.any, resizeOutput);
            applyQuality.should.have.been.calledWith(sinon.match.any, unsharpOutput);
        });

        it("should create file output stream to configured filename", async function () {
            const album = { id: "album" };
            const filename = "output.jpg";
            const image = { id: "image" };

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns(filename);
            gm.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            await sut.processImage(image, 0, 0, album);

            createImageFileStream.should.have.been.calledWith(album, image, filename);
        });

        it("should get target file format based upon the extension of the configured filename", async function () {
            const album = { id: "album" };
            const filename = "output.jpg";
            const image = { id: "image" };

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns(filename);
            gm.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            await sut.processImage(image, 0, 0, album);

            getFormat.should.have.been.calledWith(path.extname(filename));
        });

        it("should stream resized image in the target file format", async function () {
            const album = { id: "album" };
            const filename = "output.jpg";
            const format = "jpeg";
            const image = { id: "image" };

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns(filename);
            gm.returns({ streamAsync: streamAsync });
            getFormat.returns(format);
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            await sut.processImage(image, 0, 0, album);

            streamAsync.should.have.been.calledWith(format);
        });

        it("should pipe gm output to file output stream", async function () {
            const album = { id: "album" };
            const image = { id: "image" };
            const stream = "stream";

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns("output.jpg");
            gm.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));
            createImageFileStream.returns(stream);

            await sut.processImage(image, 0, 0, album);

            pipe.should.have.been.calledWith(stream);
        });

        it("should not return anything", async function () {
            const image = { id: "image" };

            getConfig.withArgs("convert").returns([{}]);
            getConfig.withArgs("convert[0].filename").returns("output.jpg");
            gm.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            const result = await sut.processImage(image, 0, 0, {});

            assert(result === undefined);
        });

        it("should convert image for each config entry", async function () {
            const config = [{}, {}];
            const image = { id: "image" };

            getConfig.withArgs("convert").returns(config);
            getConfig.withArgs("convert[0].filename").returns("output.jpg");
            getConfig.withArgs("convert[1].filename").returns("output.jpg");
            gm.returns({ streamAsync: streamAsync });
            streamAsync.returns(Promise.resolve({ pipe: pipe }));

            await sut.processImage(image, 0, 0, {});

            streamAsync.should.have.callCount(config.length);
            createImageFileStream.should.have.callCount(config.length);
        });
    });
});
