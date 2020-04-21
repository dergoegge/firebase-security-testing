const fs = require('fs');
var clc = require("cli-color");
const api = require('firebase-tools/lib/api');
const requireAuth = require('firebase-tools/lib/requireAuth');

function log(logger, msg, shouldLog) {
	if (shouldLog) logger(msg);
}

function buildRequest(suite) {
	return {
		auth: true,
		origin: api.rulesOrigin,
		data: {
			source: {
				files: {
					name: suite.ruleName,
					content: suite.ruleContent,
				}
			},
			testSuite: {
				testCases: suite.testCases.map(testCase => {
					return {
						request: testCase.request,
						expectation: testCase.expectation
					}
				})
			}
		}
	}
}

function logDebugMessages(result, logging) {
	if (result.debugMessages) {

		result.debugMessages.forEach(msg => {
			log(
				console.error,
				clc.redBright(`\t\t${msg}`),
				logging
			)
		});

	}
}

function assertResults(suite, results, options) {
	let exitError = false;
	const description = (index) => suite.testCases[index].description || '';

	log(
		console.log,
		suite.description,
		options.logging && suite.description
	);

	results.map((result, index) => {
		if (result.state === "SUCCESS") {
			log(
				console.log,
				`\t${index}. ${clc.green("[SUCCESS]")} ${description(index)}`,
				options.logging
			);
		} else {
			log(
				console.error,
				clc.red(`\t${index}. [FAILURE] ${description(index)}`),
				options.logging
			)
			exitError = true;
		}
		logDebugMessages(result, options.logging);
	});

	if (exitError) {
		throw new Error('Some tests failed');
	}
}

function assertIssues(res) {
	if (res.body && res.body.issues) {
		res.body.issues.forEach(issue => {
			log(
				console.error,
				clc.redBright(`${issue.sourcePosition.fileName}:${issue.sourcePosition.line}:${issue.sourcePosition.column}:\n\t${issue.severity} ${issue.description}`),
				true
			)
		});

		return Promise.reject(new Error('Compile error'));
	}

	return res;
}

function validateRuleSuite(suite, options = {}) {
	if (typeof options.exitOnFailure === 'undefined') {
		options.exitOnFailure = true;
	}

	return requireAuth({}).then(() =>
		api.request(
			"POST",
			`/v1/projects/${suite.project}:test`,
			buildRequest(suite)
		)).then(assertIssues)
		.then(res => {
			return res.body.testResults;
		}).then(results => {
			try {
				assertResults(suite, results, options);
			} catch (err) {
				return Promise.reject(err);
			}
		}).catch(err => {
			log(console.error, clc.red(err.message), options.logging);

			if (options.exitOnFailure) {
				process.exit(1);
			}

			return Promise.reject(err);
		});
}


function TestCase(description, options) {
	this.request = {
		...options,
		auth: options.auth || null,
		time: options.time || new Date().toISOString(),
	}

	this.description = description;

	this.shouldFail = () => {
		this.expectation = "DENY";
	}

	this.shouldSucceed = () => {
		this.expectation = "ALLOW";
	}

	return this;
}

function RuleTestSuite({ project, rulePath, description }) {
	this.testCases = [];
	this.ruleName = rulePath;
	this.ruleContent = fs.readFileSync(rulePath).toString();
	this.project = project;
	this.description = description;

	this.test = function (description, options) {
		var testCase = new TestCase(description, options);
		this.testCases.push(testCase);
		return testCase;
	}

	return this;
}

module.exports = {
	validateRuleSuite,
	RuleTestSuite
};