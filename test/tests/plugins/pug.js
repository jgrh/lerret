"use strict";

/*global afterEach, assert, beforeEach, describe, it, sinon*/

const path = require("path");

describe("plugins/pug.js", function() {
    //system under test
    const sut = require("../../../lib/plugins/pug");

    const config = require("../../../lib/config");
    const pug = require("pug");
    const log = require("../../../lib/log");
    const module = require("module");
    const writer = require("../../../lib/plugins/writer");

    const sandbox = sinon.createSandbox();

    //stubs
    let compileFile;
    let getConfig;
    let hasConfig;
    let logVerbose;
    let requireModule;
    let writeAlbumFile;
    let writeImageFile;
    let writeRootFile;

    beforeEach(function () {
        compileFile = sandbox.stub(pug, "compileFile");
        getConfig = sandbox.stub(config, "get");
        hasConfig = sandbox.stub(config, "has");
        logVerbose = sandbox.stub(log, "verbose");
        requireModule = sandbox.stub(module, "_load");
        writeAlbumFile = sandbox.stub(writer, "writeAlbumFile");
        writeImageFile = sandbox.stub(writer, "writeImageFile");
        writeRootFile = sandbox.stub(writer, "writeRootFile");

        //default stubs
        hasConfig.withArgs("pug.helpers").returns(false);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("exports name", function () {
        sut.name.should.equal("pug");
    });

    it("exports processSite", function () {
        sut.processSite.should.not.be.undefined;
    });

    it("exports processAlbum", function () {
        sut.processAlbum.should.not.be.undefined;
    });

    it("exports processImage", function () {
        sut.processImage.should.not.be.undefined;
    });

    describe("processSite(content)", function () {
        it("should log a verbose message", function () {
            const homeTemplate = "./home.pug";

            getConfig.withArgs("pug.templates.home").returns(homeTemplate);
            compileFile.returns(sandbox.stub());

            return sut.processSite().then(() => {
                logVerbose.should.have.been.calledWith("Rendering home template %s", homeTemplate);
            });
        });

        it("should compile configured home template", function () {
            const homeTemplate = "./home.pug";

            getConfig.withArgs("pug.templates.home").returns(homeTemplate);
            compileFile.returns(sandbox.stub());

            return sut.processSite().then(() => {
                compileFile.should.have.been.calledWith(homeTemplate, { cache: true, filename: homeTemplate });
            });
        });

        it("should render home page with content", function () {
            const content = { name: "site" };
            const homeRenderer = sandbox.stub();

            compileFile.returns(homeRenderer);

            return sut.processSite(content).then(() => {
                homeRenderer.should.have.been.calledWith(sinon.match.has("site", content));
            });
        });

        it("should load helpers modules if configured", function () {
            const helpersFilename = "./helpers.js";

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns(helpersFilename);
            compileFile.returns(sandbox.stub());

            return sut.processSite().then(() => {
                requireModule.should.have.been.calledWith(path.resolve(helpersFilename));
            });
        });

        it("should pass helpers to home renderer if configured", function () {
            const homeRenderer = sandbox.stub();
            const helpers = { name: "helpers" };

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns("");
            requireModule.returns(helpers);
            compileFile.returns(homeRenderer);

            return sut.processSite().then(() => {
                homeRenderer.should.have.been.calledWith(sinon.match.has("helpers", helpers));
            });
        });

        it("should write rendered home page", function () {
            const homeRenderer = sandbox.stub();
            const homeHtml = "html";

            compileFile.returns(homeRenderer);
            homeRenderer.returns(homeHtml);

            return sut.processSite().then(() => {
                writeRootFile.should.have.been.calledWith("index.html", homeHtml);
            });
        });

        it("should not return anything", function () {
            compileFile.returns(sandbox.stub());

            return sut.processSite().then(result => {
                assert(result === undefined);
            });
        });
    });

    describe("processAlbum(album, index, length, content)", function () {
        it("should log a verbose message", function () {
            const albumTemplate = "./album.pug";
            const album = { id: "album" };

            getConfig.withArgs("pug.templates.album").returns(albumTemplate);
            compileFile.returns(sandbox.stub());

            return sut.processAlbum(album).then(() => {
                logVerbose.should.have.been.calledWith("Rendering album template %s for album %s", albumTemplate, album.id);
            });
        });

        it("should compile configured album template", function () {
            const albumTemplate = "./album.pug";

            getConfig.withArgs("pug.templates.album").returns(albumTemplate);
            compileFile.returns(sandbox.stub());

            return sut.processAlbum({}).then(() => {
                compileFile.should.have.been.calledWith(albumTemplate, { cache: true, filename: albumTemplate });
            });
        });

        it("should render album page with content and album", function () {
            const content = { name: "site" };
            const album = { id: "album" };
            const albumRenderer = sandbox.stub();

            compileFile.returns(albumRenderer);

            return sut.processAlbum(album, 0, 1, content).then(() => {
                albumRenderer.should.have.been.calledWith(sinon.match.has("site", content));
                albumRenderer.should.have.been.calledWith(sinon.match.has("album", album));
            });
        });

        it("should load helpers modules if configured", function () {
            const helpersFilename = "./helpers.js";

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns(helpersFilename);
            compileFile.returns(sandbox.stub());

            return sut.processAlbum({}).then(() => {
                requireModule.should.have.been.calledWith(path.resolve(helpersFilename));
            });
        });

        it("should pass helpers to album renderer if configured", function () {
            const albumRenderer = sandbox.stub();
            const helpers = { name: "helpers" };

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns("");
            requireModule.returns(helpers);
            compileFile.returns(albumRenderer);

            return sut.processAlbum({}).then(() => {
                albumRenderer.should.have.been.calledWith(sinon.match.has("helpers", helpers));
            });
        });

        it("should write rendered album page", function () {
            const album = { id: "album" };
            const albumRenderer = sandbox.stub();
            const albumHtml = "html";

            compileFile.returns(albumRenderer);
            albumRenderer.returns(albumHtml);

            return sut.processAlbum(album).then(() => {
                writeAlbumFile.should.have.been.calledWith(album, "index.html", albumHtml);
            });
        });

        it("should not return anything", function () {
            compileFile.returns(sandbox.stub());

            return sut.processAlbum({}).then(result => {
                assert(result === undefined);
            });
        });
    });

    describe("processImage(image, index, length, album, content)", function () {
        it("should log a verbose message", function () {
            const imageTemplate = "./image.pug";
            const album = { id: "album" };
            const image = { id: "image" };

            getConfig.withArgs("pug.templates.image").returns(imageTemplate);
            compileFile.returns(sandbox.stub());

            return sut.processImage(image, 0, 0, album).then(() => {
                logVerbose.should.have.been.calledWith("Rendering image template %s for image %s/%s", imageTemplate, album.id, image.id);
            });
        });

        it("should compile configured image template", function () {
            const imageTemplate = "./image.pug";

            getConfig.withArgs("pug.templates.image").returns(imageTemplate);
            compileFile.returns(sandbox.stub());

            return sut.processImage({}, 0, 0, {}).then(() => {
                compileFile.should.have.been.calledWith(imageTemplate, { cache: true, filename: imageTemplate });
            });
        });

        it("should render image page with content, album and image", function () {
            const content = { name: "site" };
            const album = { id: "album" };
            const image = { id: "image" };
            const imageRenderer = sandbox.stub();

            compileFile.returns(imageRenderer);

            return sut.processImage(image, 0, 1, album, content).then(() => {
                imageRenderer.should.have.been.calledWith(sinon.match.has("site", content));
                imageRenderer.should.have.been.calledWith(sinon.match.has("album", album));
                imageRenderer.should.have.been.calledWith(sinon.match.has("image", image));
            });
        });

        it("should load helpers modules if configured", function () {
            const helpersFilename = "./helpers.js";

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns(helpersFilename);
            compileFile.returns(sandbox.stub());

            return sut.processImage({}, 0, 0, {}).then(() => {
                requireModule.should.have.been.calledWith(path.resolve(helpersFilename));
            });
        });

        it("should pass helpers to image renderer if configured", function () {
            const imageRenderer = sandbox.stub();
            const helpers = { name: "helpers" };

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns("");
            requireModule.returns(helpers);
            compileFile.returns(imageRenderer);

            return sut.processImage({}, 0, 0, {}).then(() => {
                imageRenderer.should.have.been.calledWith(sinon.match.has("helpers", helpers));
            });
        });

        it("should write rendered image page", function () {
            const album = { id: "album" };
            const image = { id: "image" };
            const imageRenderer = sandbox.stub();
            const imageHtml = "html";

            compileFile.returns(imageRenderer);
            imageRenderer.returns(imageHtml);

            return sut.processImage(image, 0, 0, album).then(() => {
                writeImageFile.should.have.been.calledWith(album, image, "index.html", imageHtml);
            });
        });

        it("should not return anything", function () {
            compileFile.returns(sandbox.stub());

            return sut.processImage({}, 0, 0, {}).then(result => {
                assert(result === undefined);
            });
        });
    });
});
