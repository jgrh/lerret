"use strict";

const bluebird = require("bluebird");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

global.Promise = bluebird;
global.assert = chai.assert;
global.sinon = sinon;
