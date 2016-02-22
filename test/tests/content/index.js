"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const path = require("path");
const _ = require("lodash");

describe("content/index.js", function() {
    //system under test
    const sut = require("../../../lib/content");

    const albums = require("../../../lib/content/albums");
    const config = require("../../../lib/config");
    const helpers = require("../../../lib/content/helpers");

    const sandbox = sinon.sandbox.create();

    //stubs
    let getConfig;
    let loadAlbums;
    let readYaml;

    beforeEach(function () {
        getConfig = sandbox.stub(config, "get");
        loadAlbums = sandbox.stub(albums, "loadAlbums");
        readYaml = sandbox.stub(helpers, "readYaml");

        //default stubs
        getConfig.returns("");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("loadContent()", function () {
        it("should read site.yaml from configured content directory", function () {
            const contentDirectory = "./content";

            getConfig.withArgs("contentDirectory").returns(contentDirectory);
            readYaml.returns(Promise.resolve({}));

            return sut.loadContent().then(() => {
                readYaml.should.have.been.calledWith(path.join(contentDirectory, "site.yaml"));
            });
        });

        it("should return parsed site.yaml", function () {
            const site = { name: "Site" };

            readYaml.returns(Promise.resolve(_.clone(site)));

            return sut.loadContent().then(result => {
                _.each(site, (value, key) => result.should.have.property(key, value));
            });
        });

        it("should extend parsed site.yaml with albums", function () {
            const albums = [{ id: "album1" }, { id: "album2" }];

            readYaml.returns(Promise.resolve({}));
            loadAlbums.returns(Promise.resolve(albums));

            return sut.loadContent().then(result => {
                result.should.have.property("albums", albums);
            });
        });

        it("should overwrite existing albums property from site.yaml if there is one", function () {
            const albums = [{ id: "album1" }, { id: "album2" }];

            readYaml.returns(Promise.resolve({ albums: "Original Value" }));
            loadAlbums.returns(Promise.resolve(albums));

            return sut.loadContent().then(result => {
                result.should.have.property("albums", albums);
            });
        });
    });
});
