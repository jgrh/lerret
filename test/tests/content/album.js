"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const path = require("path");
const _ = require("lodash");

describe("content/album.js", function() {
    //system under test
    const sut = require("../../../lib/content/album");

    const helpers = require("../../../lib/content/helpers");
    const images = require("../../../lib/content/images");

    const sandbox = sinon.createSandbox();

    //stubs
    let loadImages;
    let readYaml;

    beforeEach(function () {
        loadImages = sandbox.stub(images, "loadImages");
        readYaml = sandbox.stub(helpers, "readYaml");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("loadAlbum(album)", function () {
        it("should read album.yaml from supplied directory", function () {
            const directory = "./album-1";

            readYaml.returns(Promise.resolve({}));

            return sut.loadAlbum(directory).then(() => {
                readYaml.should.have.been.calledWith(path.join(directory, "album.yaml"));
            });
        });

        it("should return parsed album.yaml", function () {
            const album = { name: "Album 1" };

            readYaml.returns(Promise.resolve(_.clone(album)));

            return sut.loadAlbum("").then(result => {
                _.each(album, (value, key) => result.should.have.property(key, value));
            });
        });

        it("should extend parsed album.yaml with id", function () {
            const directory = "./album-1";

            readYaml.returns(Promise.resolve({}));

            return sut.loadAlbum(directory).then(result => {
                result.should.have.property("id", path.basename(directory));
            });
        });

        it("should overwrite existing id property from album.yaml if there is one", function () {
            const directory = "./album-1";

            readYaml.returns(Promise.resolve({ id: "Original Value"}));

            return sut.loadAlbum(directory).then(result => {
                result.should.have.property("id", path.basename(directory));
            });
        });

        it("should extend parsed album.yaml with images", function () {
            const directory = "./album-1";
            const images = [{ id: "image1" }, { id: "image2" }];

            readYaml.returns(Promise.resolve({}));
            loadImages.withArgs(directory).returns(Promise.resolve(images));

            return sut.loadAlbum(directory).then(result => {
                result.should.have.property("images", images);
            });
        });

        it("should overwrite existing images property from album.yaml if there is one", function () {
            const images = [{ id: "image1" }, { id: "image2" }];

            readYaml.returns(Promise.resolve({ images: "Original Value" }));
            loadImages.returns(Promise.resolve(images));

            return sut.loadAlbum("").then(result => {
                result.should.have.property("images", images);
            });
        });
    });
});
