"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const _ = require("lodash");

describe("plugins/plugins.js", function() {
    //system under plugin
    const sut = require("../../../lib/plugins/plugins");

    const config = require("../../../lib/config");
    const log = require("../../../lib/log");
    const timer = require("../../../lib/timer");

    const sandbox = sinon.sandbox.create();

    //stubs
    let createTimer;
    let logError;
    let logInfo;
    let logVerbose;
    let timeSince;
    let timeStamp;

    beforeEach(function () {
        createTimer = sandbox.stub(timer, "create");
        logError = sandbox.stub(log, "error");
        logInfo = sandbox.stub(log, "info");
        logVerbose = sandbox.stub(log, "verbose");
        timeSince = sandbox.stub();
        timeStamp = sandbox.stub();

        //default stubs
        createTimer.returns({ stamp: timeStamp, since: timeSince });
        timeStamp.returns({ stamp: timeStamp, since: timeSince });
    });

    afterEach(function () {
        sut._uninstallAllPlugins();
        sandbox.restore();
    });

    describe("installPlugin(plugin)", function () {
        it("should log a verbose message when installing a plugin", function () {
            const plugin = {
                name: "plugin",
                processSite: sandbox.stub()
            };

            sut.installPlugin(plugin);

            logVerbose.should.have.been.calledWith("Installing plugin %s.", plugin.name);
        });

        it("should log and throw an error when installing a plugin without a name", function () {
            const plugin = {
                processSite: sandbox.stub()
            };
            let error;

            try {
                sut.installPlugin(plugin);
            } catch (e) {
                error = e;
            }

            logError.should.have.been.calledWith("Plugin does not define a name.");
            error.should.be.defined;
        });

        it("should log and throw an error when installing a plugin without a processSite, processAlbum or processImage function", function () {
            const plugin = {
                name: "plugin"
            };
            let error;

            try {
                sut.installPlugin(plugin);
            } catch (e) {
                error = e;
            }

            logError.should.have.been.calledWith("Plugin " + plugin.name + " does not define a processSite, processAlbum or processImage function.");
            error.should.be.defined;
        });

        it("should log and throw an error when installing a plugin which shares the name of an already installed plugin", function () {
            const plugin = {
                name: "plugin",
                processSite: sandbox.stub()
            };
            let error;

            sut.installPlugin(plugin);

            try {
                sut.installPlugin(plugin);
            } catch (e) {
                error = e;
            }

            logError.should.have.been.calledWith("Plugin " + plugin.name + " already registered.");
            error.should.be.defined;
        });
    });

    describe("getPluginSequence(name)(content)", function () {
        it("should call processSite with content and config", function () {
            const content = { name: "site" };
            const plugin = {
                name: "plugin",
                processSite: sandbox.stub()
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                plugin.processSite.should.have.been.calledWith(content, config);
            });
        });

        it("should call processAlbum with album, index, length, content and config for each album", function () {
            const content = {
                name: "site",
                albums: [{ id: "album1" }, { id: "album2" }, { id: "album3" }]
            };
            const plugin = {
                name: "plugin",
                processAlbum: sandbox.stub()
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                plugin.processAlbum.should.have.been.calledWith(content.albums[0], 0, 3, content, config);
                plugin.processAlbum.should.have.been.calledWith(content.albums[1], 1, 3, content, config);
                plugin.processAlbum.should.have.been.calledWith(content.albums[2], 2, 3, content, config);
            });
        });

        it("should call processImage with image, index, length, album, content and config for each image", function () {
            const content = {
                name: "site",
                albums: [
                    { id: "album1", images: [{ id: "image1" }, { id: "image2" }, { id: "image3" }] },
                    { id: "album2", images: [{ id: "image4" }, { id: "image5" }, { id: "image6" }] }
                ]
            };
            const plugin = {
                name: "plugin",
                processImage: sandbox.stub()
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                plugin.processImage.should.have.been.calledWith(content.albums[0].images[0], 0, 3, content.albums[0], content, config);
                plugin.processImage.should.have.been.calledWith(content.albums[0].images[1], 1, 3, content.albums[0], content, config);
                plugin.processImage.should.have.been.calledWith(content.albums[0].images[2], 2, 3, content.albums[0], content, config);
                plugin.processImage.should.have.been.calledWith(content.albums[1].images[0], 0, 3, content.albums[1], content, config);
                plugin.processImage.should.have.been.calledWith(content.albums[1].images[1], 1, 3, content.albums[1], content, config);
                plugin.processImage.should.have.been.calledWith(content.albums[1].images[2], 2, 3, content.albums[1], content, config);
            });
        });

        it("should call processSite, processAlbum and processImage are all called when used together", function () {
            const content = { name: "site", albums: [{ id: "album1", images: [{ id: "image1" }] }] };
            const plugin = {
                name: "plugin",
                processSite: sandbox.stub(),
                processAlbum: sandbox.stub(),
                processImage: sandbox.stub()
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                plugin.processSite.should.have.been.called;
                plugin.processAlbum.should.have.been.called;
                plugin.processImage.should.have.been.called;
            });
        });

        it("should call plugins in sequence", function () {
            const content = { name: "site" };
            const pluginA = {
                name: "pluginA",
                processSite: sandbox.stub()
            };
            const pluginB = {
                name: "pluginB",
                processSite: sandbox.stub()
            };
            const pluginC = {
                name: "pluginC",
                processSite: sandbox.stub()
            };

            sut.installPlugin(pluginA);
            sut.installPlugin(pluginB);
            sut.installPlugin(pluginC);

            return sut.getPluginSequence([pluginB.name, pluginA.name, pluginC.name])(content).then(() => {
                sinon.assert.callOrder(pluginB.processSite, pluginA.processSite, pluginC.processSite);
            });
        });

        it("should call plugin with the content returned by the previous plugin", function () {
            const content = { name: "site" };
            const contentNew = { name: "new site" };
            const pluginA = {
                name: "pluginA",
                processSite: sandbox.stub()
            };
            const pluginB = {
                name: "pluginB",
                processSite: sandbox.stub()
            };

            pluginA.processSite.returns(contentNew);

            sut.installPlugin(pluginA);
            sut.installPlugin(pluginB);

            return sut.getPluginSequence([pluginA.name, pluginB.name])(content).then(() => {
                pluginB.processSite.should.have.been.calledWith(contentNew);
            });
        });

        it("should update content with the value returned by processSite", function () {
            const content = { name: "site" };
            const contentNew = { name: "new site" };
            const plugin = {
                name: "plugin",
                processSite: function () {
                    return contentNew;
                }
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(result => {
                result.should.eql(contentNew);
            });
        });

        it("should update content with the value returned by processAlbum", function () {
            const content = {
                name: "site",
                albums: [{ id: "album1" }, { id: "album2" }, { id: "album3" }]
            };
            const contentNew = {
                name: "site",
                albums: [{ id: "new album1" }, { id: "new album2" }, { id: "new album3" }]
            };
            const plugin = {
                name: "plugin",
                processAlbum: function (album, index) {
                    return contentNew.albums[index];
                }
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(result => {
                result.should.eql(contentNew);
            });
        });

        it("should update content with the value returned by processImage", function () {
            const content = {
                name: "site",
                albums: [{ id: "album1", images: [{ id: "image1" }, { id: "image2" }, { id: "image3" }] }]
            };
            const contentNew = {
                name: "site",
                albums: [{ id: "album1", images: [{ id: "new image1" }, { id: "new image2" }, { id: "new image3" }] }]
            };
            const plugin = {
                name: "plugin",
                processImage: function (image, index) {
                    return contentNew.albums[0].images[index];
                }
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(result => {
                result.should.eql(contentNew);
            });
        });

        it("processSite's content argument should be effectively immutable", function () {
            const content = { name: "site" };
            const contentClone = _.clone(content);
            const plugin = {
                name: "plugin",
                processSite: function (content) {
                    content.name = "new " + content.name;
                }
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                content.should.eql(contentClone);
            });
        });

        it("processAlbum's album argument should be effectively immutable", function () {
            const content = {
                name: "site",
                albums: [{ id: "album1" }, { id: "album2" }, { id: "album3" }]
            };
            const contentClone = _.clone(content);
            const plugin = {
                name: "plugin",
                processAlbum: function (album) {
                    album.id = "new " + album.id;
                }
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                content.should.eql(contentClone);
            });
        });

        it("processImage's album argument should be effectively immutable", function () {
            const content = {
                name: "site",
                albums: [{ id: "album1", images: [{ id: "image1" }, { id: "image2" }, { id: "image3" }] }]
            };
            const contentClone = _.clone(content);
            const plugin = {
                name: "plugin",
                processImage: function (album) {
                    album.id = "new " + album.id;
                }
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                content.should.eql(contentClone);
            });
        });

        it("processImage's image argument should be effectively immutable", function () {
            const content = {
                name: "site",
                albums: [{ id: "album1", images: [{ id: "image1" }, { id: "image2" }, { id: "image3" }] }]
            };
            const contentClone = _.clone(content);
            const plugin = {
                name: "plugin",
                processImage: function (image) {
                    image.id = "new " + image.id;
                }
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                content.should.eql(contentClone);
            });
        });

        it("should log an info message when calling a plugin", function () {
            const content = { name: "site" };
            const plugin = {
                name: "plugin",
                processSite: sandbox.stub()
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                logInfo.should.have.been.calledWith("Calling plugin %s.", plugin.name);
            });
        });

        it("should log an info message when calling a plugin finishes", function () {
            const content = { name: "site" };
            const plugin = {
                name: "plugin",
                processSite: sandbox.stub()
            };
            const duration = "duration";

            timeSince.returns(duration);

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                timeStamp.should.have.been.calledWith("start");
                timeSince.should.have.been.calledWith("start");
                logInfo.should.have.been.calledWith("Plugin %s finished in %s.", plugin.name, duration);
            });
        });

        it("should begin timing a plugin before calling processSite, processAlbum and processImage", function () {
            const content = { name: "site", albums: [{ id: "album1", images: [{ id: "image1" }] }] };
            const plugin = {
                name: "plugin",
                processSite: sandbox.stub(),
                processAlbum: sandbox.stub(),
                processImage: sandbox.stub()
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                sinon.assert.callOrder(timeStamp, plugin.processSite);
                sinon.assert.callOrder(timeStamp, plugin.processAlbum);
                sinon.assert.callOrder(timeStamp, plugin.processImage);
            });
        });

        it("should stop timing a plugin after calling processSite, processAlbum and processImage", function () {
            const content = { name: "site", albums: [{ id: "album1", images: [{ id: "image1" }] }] };
            const plugin = {
                name: "plugin",
                processSite: sandbox.stub(),
                processAlbum: sandbox.stub(),
                processImage: sandbox.stub()
            };

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).then(() => {
                sinon.assert.callOrder(plugin.processSite, timeSince);
                sinon.assert.callOrder(plugin.processAlbum, timeSince);
                sinon.assert.callOrder(plugin.processImage, timeSince);
            });
        });

        it("should log an error if processSite throws an error", function () {
            const content = { name: "site" };
            const plugin = {
                name: "plugin",
                processSite: sandbox.stub()
            };
            const error = "error";

            plugin.processSite.returns(Promise.resolve().throw(new Error(error)));

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).should.be.rejectedWith(Error).then(() => {
                logError.should.have.been.calledWith("Plugin %s threw an error, %s", plugin.name, error);
            });
        });

        it("should log an error if processAlbum throws an error", function () {
            const content = { name: "site", albums: [{ id: "album1", images: [{ id: "image1" }] }] };
            const plugin = {
                name: "plugin",
                processAlbum: sandbox.stub()
            };
            const error = "error";

            plugin.processAlbum.returns(Promise.resolve().throw(new Error(error)));

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).should.be.rejectedWith(Error).then(() => {
                logError.should.have.been.calledWith("Plugin %s threw an error, %s", plugin.name, error);
            });
        });

        it("should log an error if processImage throws an error", function () {
            const content = { name: "site", albums: [{ id: "album1", images: [{ id: "image1" }] }] };
            const plugin = {
                name: "plugin",
                processImage: sandbox.stub()
            };
            const error = "error";

            plugin.processImage.returns(Promise.resolve().throw(new Error(error)));

            sut.installPlugin(plugin);

            return sut.getPluginSequence([plugin.name])(content).should.be.rejectedWith(Error).then(() => {
                logError.should.have.been.calledWith("Plugin %s threw an error, %s", plugin.name, error);
            });
        });
    });
});
