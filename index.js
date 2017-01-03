var q = require('q');
//var webdriver = require('selenium-webdriver');

function SeleniumWebdriverBrowser(id, baseBrowserDecorator, args, logger) {
  baseBrowserDecorator(this);

  var self = this;
  var captured = false;
  var log = logger.create('launcher.selenium-webdriver');
  var browserName = args.browserName;
  var killingPromise;

  self.id = id;
  self.setName(browserName);

  log.info('SeleniumWebdriverBrowser (kid:'+id+') created');

  self._start = function(url){
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

  self.kill = function(){

    // Already killed, or being killed.
    if (killingPromise) {
      return killingPromise;
    }

    var deferred = q.defer();

    killingPromise = deferred.promise;

    self.getSession_(function(session){
      log.info('requested to kill, session id is '+(session && session.id_));

      if (!session) {
        return deferred.reject();
      }

      if(session.id_){
        self.driver_ && self.driver_.quit();
        deferred.resolve();
      }
    });

    return killingPromise;

  };

  self.forceKill = function() {
    self.kill();
    return killingPromise;
  };

}

SeleniumWebdriverBrowser.$inject = [ 'id', 'baseBrowserDecorator', 'args', 'logger' ];

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

SeleniumWebdriverBrowser.prototype.isCaptured = function(){
  return !!this.driver_;
};

SeleniumWebdriverBrowser.prototype.toString = function() {
  return this.name || 'Unnamed SeleniumWebdriverBrowser';
};

// PUBLISH DI MODULE
module.exports = {
  'launcher:SeleniumWebdriver': ['type', SeleniumWebdriverBrowser]
};
