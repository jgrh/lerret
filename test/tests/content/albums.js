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

    const sandbox = sinon.createSandbox();

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
        it("should list subdirectories within content directory", async function () {
            const contentDirectory = "./content";

            getConfig.withArgs("contentDirectory").returns(contentDirectory);
            listSubdirectories.returns(Promise.resolve([]));

            await sut.loadAlbums();

            listSubdirectories.should.have.been.calledWith(contentDirectory);
        });

        it("should log an info message with found albums", async function () {
            const directory1 = "./path/to/a";
            const directory2 = "./path/to/b";

            listSubdirectories.returns(Promise.resolve([directory1, directory2]));

            await sut.loadAlbums();

            logInfo.should.have.been.calledWith("Found albums %s", [path.basename(directory1), path.basename(directory2)].join(", "));
        });

        it("should load album from each subdirectory and returns them as an array", async function () {
            const directory1 = "./a";
            const directory2 = "./b";
            const album1 = { id: "album1" };
            const album2 = { id: "album2" };

            listSubdirectories.returns(Promise.resolve([directory1, directory2]));
            loadAlbum.withArgs(directory1).returns(album1);
            loadAlbum.withArgs(directory2).returns(album2);

            const result = await sut.loadAlbums();

            result.length.should.equal(2);
            _.each(album1, (value, key) => result[0].should.have.property(key, value));
            _.each(album2, (value, key) => result[1].should.have.property(key, value));
        });

        it("should sort albums by single property and order", async function () {
            const album1 = { id: "album1", order: 2 };
            const album2 = { id: "album2", order: 1 };
            const album3 = { id: "album3", order: 3 };
            const sortBy = "order";
            const sortOrder = "desc";

            listSubdirectories.returns(Promise.resolve(["", "", ""]));
            loadAlbum
                .onCall(0).returns(Promise.resolve(_.clone(album1)))
                .onCall(1).returns(Promise.resolve(_.clone(album2)))
                .onCall(2).returns(Promise.resolve(_.clone(album3)));
            hasConfig.withArgs("sort.albums.property").returns(true);
            getConfig.withArgs("sort.albums.property").returns(sortBy);
            getConfig.withArgs("sort.albums.order", "asc").returns(sortOrder);

            const result = await sut.loadAlbums();

            result[0].should.have.property("id", album3.id);
            result[1].should.have.property("id", album1.id);
            result[2].should.have.property("id", album2.id);
        });

        it("should sort albums by multiple properties and orders", async function () {
            const album1 = { id: "album1", firstOrder: 1, secondOrder: 1 };
            const album2 = { id: "album2", firstOrder: 2, secondOrder: 1 };
            const album3 = { id: "album3", firstOrder: 1, secondOrder: 2 };
            const album4 = { id: "album4", firstOrder: 2, secondOrder: 2 };
            const sortBy = [ "firstOrder", "secondOrder" ];
            const sortOrder = [ "asc", "desc" ];

            listSubdirectories.returns(Promise.resolve(["", "", "", ""]));
            loadAlbum
                .onCall(0).returns(Promise.resolve(_.clone(album1)))
                .onCall(1).returns(Promise.resolve(_.clone(album2)))
                .onCall(2).returns(Promise.resolve(_.clone(album3)))
                .onCall(3).returns(Promise.resolve(_.clone(album4)));
            hasConfig.withArgs("sort.albums.property").returns(true);
            getConfig.withArgs("sort.albums.property").returns(sortBy);
            getConfig.withArgs("sort.albums.order", "asc").returns(sortOrder);

            const result = await sut.loadAlbums();

            result[0].should.have.property("id", album3.id);
            result[1].should.have.property("id", album1.id);
            result[2].should.have.property("id", album4.id);
            result[3].should.have.property("id", album2.id);
        });
    });
});
