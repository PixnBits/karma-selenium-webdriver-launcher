# karma-selenium-webdriver-launcher

> Use a custom [Selenium Webdriver](http://www.seleniumhq.org/) instance. Useful for iron fist control, ex: extension testing.


## Installation

The easiest way is to keep `karma-selenium-webdriver-launcher` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-selenium-webdriver-launcher": "~0.1"
  }
}
```

You can also add it by this command:
```bash
npm install karma-selenium-webdriver-launcher --save-dev
```


## Configuration

```js
// karma.conf.js
var By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until,
    firefox = require('selenium-webdriver/firefox');

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    // define browsers
    customLaunchers: {
      swd_firefox: {
        base: 'SeleniumWebdriver',
        browserName: 'Firefox',
        getDriver: function(){
          // example from https://www.npmjs.com/package/selenium-webdriver#usage
          var driver = new firefox.Driver();
          return driver;
        }
      },
    },

    browsers: ['swd_firefox']
  });
};
```

### Browser options
- `browserName` name of the browser (ideally we'll use `Capabilities` in the future)
- `getDriver` function that will return a webdriver instance to the karma test runner (not the test being run)

## Additional Test API
TODO (see [#3](https://github.com/PixnBits/karma-selenium-webdriver-launcher/issues/3))

----

For more information on Karma see the [homepage](http://karma-runner.github.io).
