var os = require('os')
    , path = require('path')
    , fs = require('fs')
    , filename = 'mocha.json'; // because the bamboo plugin looks here....


var bambooReporter = function (baseReporterDecorator) {
    baseReporterDecorator(this);

    var results = {
        time: 0, tests: [], failures: [], passes: [], skips: []
    };

    this.onRunStart = function () {
        if (fs.existsSync(filename)) {
            fs.unlinkSync(filename);    
        }
    };

    this.onSpecComplete = function (browser, result) {
        results.time += browser.lastResult.totalTime;
        result.bowser = browser.name;
        results.tests.push(result);
        if (result.skipped) results.skips.push(result);
        else if (result.success) results.passes.push(result);
        else results.failures.push(result);
    };

    this.onRunComplete = function (browser, result) {
        var obj = {
            stats: {suites: result, tests: (result.success + result.failed), passes: result.success, failures: result.failed, duration: results.time }, failures: results.failures.map(clean), passes: results.passes.map(clean), skipped: results.skips.map(clean)
        };

        fs.writeFileSync(filename, JSON.stringify(obj, null, 2), 'utf-8');
        results = {
            time: 0, tests: [], failures: [], passes: [], skips: []
        };
    };
};

function clean(test) {
    var o = {
        title: test.id + ' on ' + test.browser, fullTitle: test.description, duration: test.time
    };
    if (!test.success) {
        o.error = test.log.join('\n');
    }
    return o;
}

bambooReporter.$inject = ['baseReporterDecorator'];

// PUBLISH DI MODULE
module.exports = {
    'reporter:bamboo': ['type', bambooReporter]
};