"use strict";

/*global describe, it*/

const util = require("util");

const LerretError = require("../../lib/errors").LerretError;

describe("formats.js", function() {
    //system under test
    const sut = require("../../lib/formats");

    describe("getExtensions()", function() {
        it("should return an array containing .gif, .jpeg, .jpg, .png, .tif and .tiff", function() {
            const extensions = sut.getExtensions();

            extensions.length.should.equal(6);
            extensions.should.contain(".gif");
            extensions.should.contain(".jpeg");
            extensions.should.contain(".jpg");
            extensions.should.contain(".png");
            extensions.should.contain(".tif");
            extensions.should.contain(".tiff");
        });
    });

    describe("getFormat(extension)", function() {
        it("should return gif for .gif", function() {
            sut.getFormat(".gif").should.equal("gif");
        });

        it("should return jpeg for .jpeg", function() {
            sut.getFormat(".jpeg").should.equal("jpeg");
        });

        it("should return jpeg for .jpg", function() {
            sut.getFormat(".jpg").should.equal("jpeg");
        });

        it("should return png for .png", function() {
            sut.getFormat(".png").should.equal("png");
        });

        it("should return tiff for .tif", function() {
            sut.getFormat(".tif").should.equal("tiff");
        });

        it("should return tiff for .tiff", function() {
            sut.getFormat(".tiff").should.equal("tiff");
        });

        it("should throw a LerretError given an unsupported extension", function() {
            const extension = "bmp";

            (() => sut.getFormat(extension)).should.throw(LerretError, util.format("Unsupported file extension %s", extension));
        });
    });
});
