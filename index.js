var webdriver = require('selenium-webdriver');

function browserNameFromCapabilities(caps) {
	var browserName = caps.has(webdriver.Capability.BROWSER_NAME) ? caps.get(webdriver.Capability.BROWSER_NAME) : undefined;
	if(caps.has(webdriver.Capability.VERSION)) {
		browserName += (!!browserName ? ' ' : '') + caps.get(webdriver.Capability.VERSION);
	}
	if(caps.has(webdriver.Capability.PLATFORM)) {
		browserName += (!!browserName ? ' ' : '') + '(' + caps.get(webdriver.Capability.PLATFORM) + ')';
	}
	return browserName;
}

function SeleniumWebdriverBrowser(id, baseBrowserDecorator, args, logger) {
	baseBrowserDecorator(this);

	var self = this;
	var browserName = args.browserName;
	var getDriver = args.getDriver;
	var log = logger.create('launcher.selenium-webdriver');

	self.id = id;
	self.setName(browserName);
	self.driver_ = null;
	self._start = function() {}; // Preven ProcessLauncher from taking over.

	self.on('start', function(url) {
		log.info('starting ' + self.name);

		var driver = self._driver || getDriver();
		driver.getSession()
			.then(function(session){
				self._driver = driver;
				self.setName(browserNameFromCapabilities(session.getCapabilities()));

				log.info('sending driver to url ' + url);
				self._driver.navigate().to(url)
					.catch( function(error) {
						log.error('driver returned error: ' + error);
						if(self._driver !== null) {
							self._handleStartError(error);
						}
					});
			})
			.catch(function(error){
				log.error('failed to get session from webdriver: ' + error);
				self._handleStartError(error);
			});
	});

	self.on('kill', function(done) {
		if(self._driver) {
			var driver = self._driver;
			self._driver = null;

			driver.quit()
				.then(self._allDone.bind(self, done))
				.catch(function(error){
					log.info('error while quittin session: ' + error);
					self._allDone(done);
				});
		} else {
			done();
		}
	});

	log.info('SeleniumWebdriverBrowser (kid:'+id+') created');
}

SeleniumWebdriverBrowser.prototype._allDone = function(doneCallback) {
	this._done();
	doneCallback();
}

SeleniumWebdriverBrowser.prototype._handleStartError = function(error) {
	this._retryLimit = -1 // dont't retry
	this._done(error);
}

SeleniumWebdriverBrowser.prototype.setName = function(newBrowserName) {
  if(!!newBrowserName) {
    this.name = newBrowserName + ' via Selenium Webdriver';
    console.log('changed name to ' + this.name);
  }
};

SeleniumWebdriverBrowser.prototype.isCaptured = function(){
  return !!this._driver;
};

SeleniumWebdriverBrowser.prototype.toString = function() {
  return this.name || 'Unnamed SeleniumWebdriverBrowser';
};

SeleniumWebdriverBrowser.$inject = ['id', 'baseBrowserDecorator', 'args', 'logger'];

// PUBLISH DI MODULE
module.exports = {
  'launcher:SeleniumWebdriver': ['type', SeleniumWebdriverBrowser]
};
