"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const path = require("path");
const _ = require("lodash");

describe("content/images.js", function() {
    //system under test
    const sut = require("../../../lib/content/images");

    const image = require("../../../lib/content/image");
    const config = require("../../../lib/config");
    const helpers = require("../../../lib/content/helpers");
    const log = require("../../../lib/log");

    const sandbox = sinon.sandbox.create();

    //stubs
    let getConfig;
    let hasConfig;
    let listSubdirectories;
    let loadImage;
    let logInfo;

    beforeEach(function () {
        getConfig = sandbox.stub(config, "get");
        hasConfig = sandbox.stub(config, "has");
        listSubdirectories = sandbox.stub(helpers, "listSubdirectories");
        loadImage = sandbox.stub(image, "loadImage");
        logInfo = sandbox.stub(log, "info");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("loadImages(album)", function () {
        it("should list subdirectories within supplied directory", function () {
            const directory = "./album";

            listSubdirectories.returns(Promise.resolve([]));

            return sut.loadImages(directory).then(() => {
                listSubdirectories.should.have.been.calledWith(directory);
            });
        });

        it("should log an info message with found images", function () {
            const album = "./path/to/album";
            const directory1 = "./path/to/a";
            const directory2 = "./path/to/b";

            listSubdirectories.returns(Promise.resolve([directory1, directory2]));

            return sut.loadImages(album).then(() => {
                logInfo.should.have.been.calledWith("Found images %s within album %s.", [path.basename(directory1), path.basename(directory2)].join(", "), path.basename(album));
            });
        });

        it("should load image from each subdirectory and returns them as an array", function () {
            const directory1 = "./a";
            const directory2 = "./b";
            const image1 = { id: "image1" };
            const image2 = { id: "image2" };

            listSubdirectories.returns(Promise.resolve([directory1, directory2]));
            loadImage.withArgs(directory1).returns(image1);
            loadImage.withArgs(directory2).returns(image2);

            return sut.loadImages().then(result => {
                result.length.should.equal(2);
                _.each(image1, (value, key) => result[0].should.have.property(key, value));
                _.each(image2, (value, key) => result[1].should.have.property(key, value));
            });
        });

        it("should sort images by configured property and order", function () {
            const image1 = { id: "image1", order: 2 };
            const image2 = { id: "image2", order: 1 };
            const image3 = { id: "image3", order: 3 };
            const sortBy = "order";
            const sortOrder = "desc";
            const sorted = _.sortByOrder([image1, image2, image3], sortBy, sortOrder);

            listSubdirectories.returns(Promise.resolve(["", "", ""]));
            loadImage
                .onFirstCall().returns(Promise.resolve(_.clone(image1)))
                .onSecondCall().returns(Promise.resolve(_.clone(image2)))
                .onThirdCall().returns(Promise.resolve(_.clone(image3)));
            hasConfig.withArgs("sort.images.property").returns(true);
            getConfig.withArgs("sort.images.property").returns(sortBy);
            getConfig.withArgs("sort.images.order", "asc").returns(sortOrder);

            return sut.loadImages().then(result => {
                result[0].should.have.property("id", sorted[0].id);
                result[1].should.have.property("id", sorted[1].id);
                result[2].should.have.property("id", sorted[2].id);
            });
        });
    });
});
