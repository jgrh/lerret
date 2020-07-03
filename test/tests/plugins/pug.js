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

    beforeEach(function() {
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

    afterEach(function() {
        sandbox.restore();
    });

    it("exports name", function() {
        sut.name.should.equal("pug");
    });

    it("exports processSite", function() {
        sut.processSite.should.not.be.undefined;
    });

    it("exports processAlbum", function() {
        sut.processAlbum.should.not.be.undefined;
    });

    it("exports processImage", function() {
        sut.processImage.should.not.be.undefined;
    });

    describe("processSite(content)", function() {
        it("should log a verbose message", async function() {
            const homeTemplate = "./home.pug";

            getConfig.withArgs("pug.templates.home").returns(homeTemplate);
            compileFile.returns(sandbox.stub());

            await sut.processSite();

            logVerbose.should.have.been.calledWith("Rendering home template %s", homeTemplate);
        });

        it("should compile configured home template", async function() {
            const homeTemplate = "./home.pug";

            getConfig.withArgs("pug.templates.home").returns(homeTemplate);
            compileFile.returns(sandbox.stub());

            await sut.processSite();

            compileFile.should.have.been.calledWith(homeTemplate, {
                cache: true,
                filename: homeTemplate
            });
        });

        it("should render home page with content", async function() {
            const content = {
                name: "site"
            };
            const homeRenderer = sandbox.stub();

            compileFile.returns(homeRenderer);

            await sut.processSite(content);

            homeRenderer.should.have.been.calledWith(sinon.match.has("site", content));
        });

        it("should load helpers modules if configured", async function() {
            const helpersFilename = "./helpers.js";

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns(helpersFilename);
            compileFile.returns(sandbox.stub());

            await sut.processSite();

            requireModule.should.have.been.calledWith(path.resolve(helpersFilename));
        });

        it("should pass helpers to home renderer if configured", async function() {
            const homeRenderer = sandbox.stub();
            const helpers = {
                name: "helpers"
            };

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns("");
            requireModule.returns(helpers);
            compileFile.returns(homeRenderer);

            await sut.processSite();

            homeRenderer.should.have.been.calledWith(sinon.match.has("helpers", helpers));
        });

        it("should write rendered home page", async function() {
            const homeRenderer = sandbox.stub();
            const homeHtml = "html";

            compileFile.returns(homeRenderer);
            homeRenderer.returns(homeHtml);

            await sut.processSite();

            writeRootFile.should.have.been.calledWith("index.html", homeHtml);
        });

        it("should not return anything", async function() {
            compileFile.returns(sandbox.stub());

            const result = await sut.processSite();

            assert(result === undefined);
        });
    });

    describe("processAlbum(album, index, length, content)", function() {
        it("should log a verbose message", async function() {
            const albumTemplate = "./album.pug";
            const album = {
                id: "album"
            };

            getConfig.withArgs("pug.templates.album").returns(albumTemplate);
            compileFile.returns(sandbox.stub());

            await sut.processAlbum(album);

            logVerbose.should.have.been.calledWith("Rendering album template %s for album %s", albumTemplate, album.id);
        });

        it("should compile configured album template", async function() {
            const albumTemplate = "./album.pug";

            getConfig.withArgs("pug.templates.album").returns(albumTemplate);
            compileFile.returns(sandbox.stub());

            await sut.processAlbum({});

            compileFile.should.have.been.calledWith(albumTemplate, {
                cache: true,
                filename: albumTemplate
            });
        });

        it("should render album page with content and album", async function() {
            const content = {
                name: "site"
            };
            const album = {
                id: "album"
            };
            const albumRenderer = sandbox.stub();

            compileFile.returns(albumRenderer);

            await sut.processAlbum(album, 0, 1, content);

            albumRenderer.should.have.been.calledWith(sinon.match.has("site", content));
            albumRenderer.should.have.been.calledWith(sinon.match.has("album", album));
        });

        it("should load helpers modules if configured", async function() {
            const helpersFilename = "./helpers.js";

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns(helpersFilename);
            compileFile.returns(sandbox.stub());

            await sut.processAlbum({});

            requireModule.should.have.been.calledWith(path.resolve(helpersFilename));
        });

        it("should pass helpers to album renderer if configured", async function() {
            const albumRenderer = sandbox.stub();
            const helpers = {
                name: "helpers"
            };

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns("");
            requireModule.returns(helpers);
            compileFile.returns(albumRenderer);

            await sut.processAlbum({});

            albumRenderer.should.have.been.calledWith(sinon.match.has("helpers", helpers));
        });

        it("should write rendered album page", async function() {
            const album = {
                id: "album"
            };
            const albumRenderer = sandbox.stub();
            const albumHtml = "html";

            compileFile.returns(albumRenderer);
            albumRenderer.returns(albumHtml);

            await sut.processAlbum(album);

            writeAlbumFile.should.have.been.calledWith(album, "index.html", albumHtml);
        });

        it("should not return anything", async function() {
            compileFile.returns(sandbox.stub());

            const result = await sut.processAlbum({});

            assert(result === undefined);
        });
    });

    describe("processImage(image, index, length, album, content)", function() {
        it("should log a verbose message", async function() {
            const imageTemplate = "./image.pug";
            const album = {
                id: "album"
            };
            const image = {
                id: "image"
            };

            getConfig.withArgs("pug.templates.image").returns(imageTemplate);
            compileFile.returns(sandbox.stub());

            await sut.processImage(image, 0, 0, album);

            logVerbose.should.have.been.calledWith("Rendering image template %s for image %s/%s", imageTemplate, album.id, image.id);
        });

        it("should compile configured image template", async function() {
            const imageTemplate = "./image.pug";

            getConfig.withArgs("pug.templates.image").returns(imageTemplate);
            compileFile.returns(sandbox.stub());

            await sut.processImage({}, 0, 0, {});

            compileFile.should.have.been.calledWith(imageTemplate, {
                cache: true,
                filename: imageTemplate
            });
        });

        it("should render image page with content, album and image", async function() {
            const content = {
                name: "site"
            };
            const album = {
                id: "album"
            };
            const image = {
                id: "image"
            };
            const imageRenderer = sandbox.stub();

            compileFile.returns(imageRenderer);

            await sut.processImage(image, 0, 1, album, content);

            imageRenderer.should.have.been.calledWith(sinon.match.has("site", content));
            imageRenderer.should.have.been.calledWith(sinon.match.has("album", album));
            imageRenderer.should.have.been.calledWith(sinon.match.has("image", image));
        });

        it("should load helpers modules if configured", async function() {
            const helpersFilename = "./helpers.js";

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns(helpersFilename);
            compileFile.returns(sandbox.stub());

            await sut.processImage({}, 0, 0, {});

            requireModule.should.have.been.calledWith(path.resolve(helpersFilename));
        });

        it("should pass helpers to image renderer if configured", async function() {
            const imageRenderer = sandbox.stub();
            const helpers = {
                name: "helpers"
            };

            hasConfig.withArgs("pug.helpers").returns(true);
            getConfig.withArgs("pug.helpers").returns("");
            requireModule.returns(helpers);
            compileFile.returns(imageRenderer);

            await sut.processImage({}, 0, 0, {});

            imageRenderer.should.have.been.calledWith(sinon.match.has("helpers", helpers));
        });

        it("should write rendered image page", async function() {
            const album = {
                id: "album"
            };
            const image = {
                id: "image"
            };
            const imageRenderer = sandbox.stub();
            const imageHtml = "html";

            compileFile.returns(imageRenderer);
            imageRenderer.returns(imageHtml);

            await sut.processImage(image, 0, 0, album);

            writeImageFile.should.have.been.calledWith(album, image, "index.html", imageHtml);
        });

        it("should not return anything", async function() {
            compileFile.returns(sandbox.stub());

            const result = await sut.processImage({}, 0, 0, {});

            assert(result === undefined);
        });
    });
});
