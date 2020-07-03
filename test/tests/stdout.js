"use strict";

/*global describe, it, sinon*/

const os = require("os");

describe("stdout.js", function() {
    //system under test
    const sut = require("../../lib/stdout");

    describe("write(data)", function() {
        it("should append os.EOL to data and delegate to process.stdout.write()", function() {
            const processStdoutWrite = sinon.stub(process.stdout, "write");
            try {
                const data = "data";

                sut.write(data);

                processStdoutWrite.should.have.been.calledWith(data + os.EOL);
            } finally {
                processStdoutWrite.restore();
            }
        });
    });
});
