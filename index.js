var q = require('q');
//var webdriver = require('selenium-webdriver');



function SeleniumWebdriverBrowser(id, emitter, args, logger, config) {
  var self = this;
  var captured = false;
  var log = logger.create('launcher.selenium-webdriver');
  var browserName = args.browserName;

  this.id = id;
  self.setName(browserName);

  log.info('SeleniumWebdriverBrowser (kid:'+id+') created');

  this.start = function(url){
    log.info('starting '+self.name);
    var driver = args.getDriver();
    self.driver_ = driver;
    
    self.getSession_(function(session){
      // TODO: caps_ might be a defer as well
      self.setName(session.caps_.caps_);
    });

    log.info('sending driver to url '+url);
    driver.get(url);
  };

  this.kill = function(){
    self.getSession_(function(session){
      log.info('requested to kill, session id is '+(session && session.id_));
      if(session.id_){
        this.driver_ && this.driver_.quit();
      }
    });
  }

}


SeleniumWebdriverBrowser.prototype.setName = function(arg) {
  // arg is either string and assumed to be `browserName` parameter
  // or is object, being the session capabilities
  var browserName;
  if('string' === typeof arg){
    browserName = arg;
  }else if(arg && arg.version){
    browserName = (arg.browserName || arg.device) + (arg.version ? ' ' + arg.version : '') + ' (' + arg.platform +  ')';
  }

  if(browserName){
    this.name = browserName + ' via Selenium Webdriver';
    console.log('changed name to '+this.name);
  }
};

SeleniumWebdriverBrowser.prototype.getSession_ = function(cb) {
  var driver = this.driver_;

  if(!driver){
    return cb(null);
  }

  if(driver.session_ && driver.session_.then){
    driver.session_.then(cb);
  }else{
    cb(driver.session_);
  }
};

SeleniumWebdriverBrowser.prototype.toString = function() {
  return this.name || 'Unnamed SeleniumWebdriverBrowser';
};

// PUBLISH DI MODULE
module.exports = {
  'launcher:SeleniumWebdriver': ['type', SeleniumWebdriverBrowser]
};
