const fs = require('fs');
const { v4: uuid } = require('uuid');

const buildMargeInput = (_results) => {
  let input = {};
  const elapsed = buildElapsedTime(_results.testResults);
  const results = createResults(_results.testResults);

  input.stats = {
    suites: _results.numTotalTestSuites,
    tests: _results.numTotalTests,
    passes: _results.numPassedTests,
    pending: _results.numPendingTests,
    failures: _results.numFailedTests,
    testsRegistered: _results.numTotalTests,
    passPercent: (_results.numPassedTests * 100) / _results.numTotalTests,
    pendingPercent: (_results.numPendingTests * 100) / _results.numTotalTests,
    other: 0,
    hasOther: false,
    skipped: 0,
    hasSkipped: false,
    start: new Date(_results.startTime),
    end: new Date(_results.startTime + elapsed),
    duration: elapsed,
  };
  input.results = [results];

  _results.testResults.forEach((testResult) => {
    //console.log('1 ', testResult);
    testResult.testResults.forEach((result) => {
      //console.log('2 ', result);
      const id = uuid();
      const testFilePath = testResult.testFilePath;
      const fileName = testFilePath.split('/').pop();
      //console.log(fileName);
      const testFileContent = fs.readFileSync(testFilePath, 'utf8') || '';

      const test = {
        fullTitle: `${testResult.testResults[0].ancestorTitles.join(' > ')} > ${result.title}`,
        title: `${testResult.testResults[0].ancestorTitles.join(' > ')} > ${result.title}`,
        //title: result.title,
        timedOut: false,
        duration: result.duration,
        state: result.status,
        speed: null,
        pass: passed(result),
        fail: failed(result),
        pending: pending(result),
        context: null,
        code: testFileContent,
        err: getErrorTest(result),
        uuid: id,
        parentUUID: input.results[0].suites[0].uuid,
        isHook: false,
        skipped: false,
      };

      input.results[0].suites[0].tests.push(test);
    });
  });

  input.results[0].suites[0].duration = getTestDuration(input);
  input.results[0].suites[0].passes = getUUIDByStatus(input, 'passed');
  input.results[0].suites[0].failures = getUUIDByStatus(input, 'failed');
  input.results[0].suites[0].pending = getUUIDByStatus(input, 'pending');

  return input;
};

const createResults = (_results) => {
  const id = uuid();
  const suite = createSuite(_results);
  return {
    uuid: id,
    title: `${_results[0].displayName?.name || ''}`,
    fullFile: '',
    file: '',
    beforeHooks: [],
    afterHooks: [],
    tests: [],
    suites: suite,
    passes: [],
    failures: [],
    pending: [],
    skipped: [],
    duration: 0,
    root: true,
    rootEmpty: true,
    _timeout: 5000,
  };
};

const createSuite = (_results) => {
  const id = uuid();

  return [
    {
      uuid: id,
      title: `${_results[0].displayName?.name || ''}`,
      fullFile: '',
      file: '',
      beforeHooks: [],
      afterHooks: [],
      tests: [],
      suites: [],
      passes: [],
      failures: [],
      pending: [],
      skipped: [],
      duration: 0,
      root: false,
      rootEmpty: false,
      _timeout: 5000,
    },
  ];
};

const passed = (_test) => _test.status === 'passed';

const failed = (_test) => _test.status === 'failed';

const pending = (_test) => _test.status === 'pending';

const getErrorTest = (_result) => {
  return _result.status === 'failed'
    ? {
        message: _result.failureDetails[0].matcherResult.message.replace(/\x1b\[\d+m/g, '') || null,
        estack:
          _result.failureDetails.map((msg) => msg.stack.replace(/\x1b\[\d+m/g, '')).join('\n') ||
          null,
        diff: _result.failureDetails[0].matcherResult.message.replace(/\x1b\[\d+m/g, '') || null,
      }
    : {};
};

const buildElapsedTime = (_results) => {
  return _results.reduce((_sum, _results) => {
    return _sum + _results.testResults.reduce((_sum, test) => _sum + test.duration, 0);
  }, 0);
};

const getTestDuration = (_input) =>
  _input.results[0].suites[0].tests.reduce((sum, test) => sum + test.duration, 0);

const getUUIDByStatus = (_input, _state) => {
  return _input.results[0].suites[0].tests
    .filter((obj) => obj.state === `${_state}`)
    .map((obj) => obj.uuid);
};

const checkOrCreateReportDir = (_reportDir) => {
  if (!fs.existsSync(_reportDir)) {
    fs.mkdirSync(_reportDir, (_error) => {
      if (_error) throw _error;
      console.log('Report dir has been created.');
    });
  }
};

const writeOutput = (_payload, _filepath) => {
  fs.writeFileSync(`${_filepath}`, JSON.stringify(_payload, null, 2), (_error) => {
    if (_error) {
      console.error(_error);
      throw _error;
    }
    console.log('file saved');
  });
};

class JestMochawesomeReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(_contexts, _results) {
    if (_results.testResults.length) {
      const { reportDir = null, reportFilename = 'jest-mochawesome.json' } = this._options;

      if (reportDir !== null) {
        checkOrCreateReportDir(`${this._globalConfig.rootDir}/${reportDir}`);
      }
      const reportDirectory = reportDir !== null ? `/${reportDir}` : '';
      const filePathReport = `${this._globalConfig.rootDir}${reportDirectory}/${reportFilename}`;

      writeOutput(buildMargeInput(_results), filePathReport);
    }
  }
}

module.exports = JestMochawesomeReporter;
