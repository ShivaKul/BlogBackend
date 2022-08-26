const chai = require("chai");
const sinon = require("sinon");
const auth = require("../middleware/auth");
require('dotenv').config({ path: ".env" });

const jwt = require("jsonwebtoken");

const expect = chai.expect;

describe('my middleware', function() {

  describe('request handler calling', function() {

  	res = {
      send: function(){ },
      json: function(err){
          console.log("\n : " + err);
      },
      status: function(responseStatus) {
          // This next line makes it chainable
          return this; 
      }
    }

  	const token_header_key = process.env.TOKEN_HEADER_KEY;

    it('should call next() once', function() {
      var nextSpy = sinon.spy();
      const token = jwt.sign(
      	{ email: "testuser16@gmail.com" },
      	process.env.TOKEN_KEY,
      	{
          expiresIn: "6h",
        }
      );
      req = {"headers": {[token_header_key]: token}}

      auth(req, res, nextSpy);
      expect(nextSpy.calledOnce).to.be.true;
    });

    it('should not call next() once', function() {
      var nextSpy = sinon.spy();
      const token = "some-random-string";
      req = {"headers": {[token_header_key]: token}}

      auth(req, res, nextSpy);
      expect(nextSpy.notCalled).to.be.true;
    });
  });

});