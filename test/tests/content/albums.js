"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const path = require("path");
const _ = require("lodash");

describe("content/albums.js", function() {
    //system under test
    const sut = require("../../../lib/content/albums");

    const album = require("../../../lib/content/album");
    const config = require("../../../lib/config");
    const helpers = require("../../../lib/content/helpers");
    const log = require("../../../lib/log");

    const sandbox = sinon.sandbox.create();

    //stubs
    let getConfig;
    let hasConfig;
    let listSubdirectories;
    let loadAlbum;
    let logInfo;

    beforeEach(function () {
        getConfig = sandbox.stub(config, "get");
        hasConfig = sandbox.stub(config, "has");
        listSubdirectories = sandbox.stub(helpers, "listSubdirectories");
        loadAlbum = sandbox.stub(album, "loadAlbum");
        logInfo = sandbox.stub(log, "info");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("loadAlbums()", function () {
        it("should list subdirectories within content directory", function () {
            const contentDirectory = "./content";

            getConfig.withArgs("contentDirectory").returns(contentDirectory);
            listSubdirectories.returns(Promise.resolve([]));

            return sut.loadAlbums().then(() => {
                listSubdirectories.should.have.been.calledWith(contentDirectory);
            });
        });

        it("should log an info message with found albums", function () {
            const directory1 = "./path/to/a";
            const directory2 = "./path/to/b";

            listSubdirectories.returns(Promise.resolve([directory1, directory2]));

            return sut.loadAlbums().then(() => {
                logInfo.should.have.been.calledWith("Found albums %s.", [path.basename(directory1), path.basename(directory2)].join(", "));
            });
        });

        it("should load album from each subdirectory and returns them as an array", function () {
            const directory1 = "./a";
            const directory2 = "./b";
            const album1 = { id: "album1" };
            const album2 = { id: "album2" };

            listSubdirectories.returns(Promise.resolve([directory1, directory2]));
            loadAlbum.withArgs(directory1).returns(album1);
            loadAlbum.withArgs(directory2).returns(album2);

            return sut.loadAlbums().then(result => {
                result.length.should.equal(2);
                _.each(album1, (value, key) => result[0].should.have.property(key, value));
                _.each(album2, (value, key) => result[1].should.have.property(key, value));
            });
        });

        it("should sort albums by configured property and order", function () {
            const album1 = { id: "album1", order: 2 };
            const album2 = { id: "album2", order: 1 };
            const album3 = { id: "album3", order: 3 };
            const sortBy = "order";
            const sortOrder = "desc";
            const sorted = _.sortByOrder([album1, album2, album3], sortBy, sortOrder);

            listSubdirectories.returns(Promise.resolve(["", "", ""]));
            loadAlbum
                .onFirstCall().returns(Promise.resolve(_.clone(album1)))
                .onSecondCall().returns(Promise.resolve(_.clone(album2)))
                .onThirdCall().returns(Promise.resolve(_.clone(album3)));
            hasConfig.withArgs("sort.albums.property").returns(true);
            getConfig.withArgs("sort.albums.property").returns(sortBy);
            getConfig.withArgs("sort.albums.order", "asc").returns(sortOrder);

            return sut.loadAlbums().then(result => {
                result[0].should.have.property("id", sorted[0].id);
                result[1].should.have.property("id", sorted[1].id);
                result[2].should.have.property("id", sorted[2].id);
            });
        });
    });
});
