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

    beforeEach(function() {
        loadImages = sandbox.stub(images, "loadImages");
        readYaml = sandbox.stub(helpers, "readYaml");
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe("loadAlbum(album)", async function() {
        it("should read album.yaml from supplied directory", async function() {
            const directory = "./album-1";

            readYaml.returns(Promise.resolve({}));

            await sut.loadAlbum(directory);

            readYaml.should.have.been.calledWith(path.join(directory, "album.yaml"));
        });

        it("should await parsed album.yaml", async function() {
            const album = {
                name: "Album 1"
            };

            readYaml.returns(Promise.resolve(_.clone(album)));

            const result = await sut.loadAlbum("");

            _.each(album, (value, key) => result.should.have.property(key, value));
        });

        it("should extend parsed album.yaml with id", async function() {
            const directory = "./album-1";

            readYaml.returns(Promise.resolve({}));

            const result = await sut.loadAlbum(directory);

            result.should.have.property("id", path.basename(directory));
        });

        it("should overwrite existing id property from album.yaml if there is one", async function() {
            const directory = "./album-1";

            readYaml.returns(Promise.resolve({
                id: "Original Value"
            }));

            const result = await sut.loadAlbum(directory);

            result.should.have.property("id", path.basename(directory));
        });

        it("should extend parsed album.yaml with images", async function() {
            const directory = "./album-1";
            const images = [{
                id: "image1"
            }, {
                id: "image2"
            }];

            readYaml.returns(Promise.resolve({}));
            loadImages.withArgs(directory).returns(Promise.resolve(images));

            const result = await sut.loadAlbum(directory);

            result.should.have.property("images", images);
        });

        it("should overwrite existing images property from album.yaml if there is one", async function() {
            const images = [{
                id: "image1"
            }, {
                id: "image2"
            }];

            readYaml.returns(Promise.resolve({
                images: "Original Value"
            }));
            loadImages.returns(Promise.resolve(images));

            const result = await sut.loadAlbum("");

            result.should.have.property("images", images);
        });
    });
});
