"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const _ = require("lodash");

const LerretError = require("../../lib/errors").LerretError;

describe("print.js", function() {
    //system under test
    const sut = require("../../lib/print");

    const content = require("../../lib/content");
    const log = require("../../lib/log");
    const stdout = require("../../lib/stdout");
    const prettyjson = require("prettyjson");

    const sandbox = sinon.createSandbox();

    //stubs
    let loadContent;
    let logError;
    let renderJson;
    let setLogLevel;
    let stdoutWrite;

    beforeEach(function () {
        loadContent = sandbox.stub(content, "loadContent");
        logError = sandbox.stub(log, "error");
        renderJson = sandbox.stub(prettyjson, "render");
        setLogLevel = sandbox.stub(log, "setLevel");
        stdoutWrite = sandbox.stub(stdout, "write");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("print(options)", function () {
        it("should set log level to warn", async function () {
            loadContent.returns(Promise.resolve());

            await sut.print({ color: true, exif: true });

            setLogLevel.should.have.been.calledWith("warn");
        });

        it("should log an error if loadContent throws a LerretError", async function () {
            const error = new LerretError("error");

            loadContent.returns(Promise.resolve().throw(error));

            await sut.print({ color: true, exif: true });

            logError.should.have.been.calledWith(error.message);
        });

        it("should pass full site to render function if exif output is enabled", async function () {
            const site = { name: "site", albums: [
                { id: "album1", images: [{ id: "image1", exif: "exif" }, { id: "image2", exif: "exif" }] },
                { id: "album2", images: [{ id: "image3", exif: "exif" }, { id: "image4", exif: "exif" }] }
            ]};

            loadContent.returns(Promise.resolve(_.cloneDeep(site)));

            await sut.print({ color: true, exif: true });

            renderJson.should.have.been.calledWith(site);
        });

        it("should remove exif from each image if exif output is disabled", async function () {
            const site = { name: "site", albums: [
                { id: "album1", images: [{ id: "image1", exif: "exif" }, { id: "image2", exif: "exif" }] },
                { id: "album2", images: [{ id: "image3", exif: "exif" }, { id: "image4", exif: "exif" }] }
            ]};

            const withoutExif = _.cloneDeep(site);
            _.each(withoutExif.albums, album => _.each(album.images, image => _.unset(image, "exif")));

            loadContent.returns(Promise.resolve(_.cloneDeep(site)));

            await sut.print({ color: true, exif: false });

            renderJson.should.have.been.calledWith(withoutExif);
        });

        it("should pass color configuration to render function if color output is enabled", async function () {
            loadContent.returns(Promise.resolve());

            await sut.print({ color: true, exif: true });

            renderJson.should.have.been.calledWith(sinon.match.any, {
                dashColor: "white",
                keysColor: "blue",
                numberColor: "yellow",
                stringColor: "white"
            });
        });

        it("should pass noColor option to render function if color output is disabled", async function () {
            loadContent.returns(Promise.resolve());

            await sut.print({ color: false, exif: true });

            renderJson.should.have.been.calledWith(sinon.match.any, {
                noColor: true
            });
        });

        it("should write rendered site to stdout", async function () {
            const rendered = "site";

            loadContent.returns(Promise.resolve());
            renderJson.returns(rendered);

            await sut.print({ color: true, exif: true });

            stdoutWrite.should.have.been.calledWith(rendered);
        });
    });
});
