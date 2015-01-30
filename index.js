var q = require('q');
var webdriver = require('selenium-webdriver');



var SeleniumWebdriverBrowser = function(id, emitter, args, logger,
                                   /* config */ config) {

};


// PUBLISH DI MODULE
module.exports = {
  'launcher:SeleniumWebdriver': ['type', SeleniumWebdriverBrowser]
};
