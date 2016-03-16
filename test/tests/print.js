"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const _ = require("lodash");

describe("print.js", function() {
    //system under test
    const sut = require("../../lib/print");

    const content = require("../../lib/content");
    const log = require("../../lib/log");
    const stdout = require("../../lib/stdout");
    const prettyjson = require("prettyjson");

    const sandbox = sinon.sandbox.create();

    //stubs
    let loadContent;
    let renderJson;
    let setLogLevel;
    let stdoutWrite;

    beforeEach(function () {
        loadContent = sandbox.stub(content, "loadContent");
        renderJson = sandbox.stub(prettyjson, "render");
        setLogLevel = sandbox.stub(log, "setLevel");
        stdoutWrite = sandbox.stub(stdout, "write");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("print(options)", function () {
        it("should set log level to warn", function () {
            loadContent.returns(Promise.resolve());

            return sut.print({ color: true, exif: true }).then(() => {
                setLogLevel.should.have.been.calledWith("warn");
            });
        });

        it("should pass full site to render function if exif output is enabled", function () {
            const site = { name: "site", albums: [
                { id: "album1", images: [{ id: "image1", exif: "exif" }, { id: "image2", exif: "exif" }] },
                { id: "album2", images: [{ id: "image3", exif: "exif" }, { id: "image4", exif: "exif" }] }
            ]};

            loadContent.returns(Promise.resolve(_.cloneDeep(site)));

            return sut.print({ color: true, exif: true }).then(() => {
                renderJson.should.have.been.calledWith(site);
            });
        });

        it("should remove exif from each image if exif output is disabled", function () {
            const site = { name: "site", albums: [
                { id: "album1", images: [{ id: "image1", exif: "exif" }, { id: "image2", exif: "exif" }] },
                { id: "album2", images: [{ id: "image3", exif: "exif" }, { id: "image4", exif: "exif" }] }
            ]};

            const withoutExif = _.cloneDeep(site);
            _.each(withoutExif.albums, album => _.each(album.images, image => _.unset(image, "exif")));

            loadContent.returns(Promise.resolve(_.cloneDeep(site)));

            return sut.print({ color: true, exif: false }).then(() => {
                renderJson.should.have.been.calledWith(withoutExif);
            });
        });

        it("should pass color configuration to render function if color output is enabled", function () {
            loadContent.returns(Promise.resolve());

            return sut.print({ color: true, exif: true }).then(() => {
                renderJson.should.have.been.calledWith(sinon.match.any, {
                    dashColor: "white",
                    keysColor: "blue",
                    numberColor: "yellow",
                    stringColor: "white"
                });
            });
        });

        it("should pass noColor option to render function if color output is disabled", function () {
            loadContent.returns(Promise.resolve());

            return sut.print({ color: false, exif: true }).then(() => {
                renderJson.should.have.been.calledWith(sinon.match.any, {
                    noColor: true
                });
            });
        });

        it("should write rendered site to stdout", function () {
            const rendered = "site";

            loadContent.returns(Promise.resolve());
            renderJson.returns(rendered);

            return sut.print({ color: true, exif: true }).then(() => {
                stdoutWrite.should.have.been.calledWith(rendered);
            });
        });
    });
});
