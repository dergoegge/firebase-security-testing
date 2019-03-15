# Firebase security rules testing

There is currently no official testing framework for firebase storage security rules.

There is how ever the [Firebase Rules API](https://developers.google.com/apis-explorer/?hl=en_US#search/firebaserules/firebaserules/v1/) which does provide unit testing functionality.
The simulator in the firebase console makes use of this api.

This repository is an attempt at a client for this api and since the api works for both **Firestore** and **Firebase Storage** you will be able to test both types of security rules with this client.

I also opened a feature request with firebase, so maybe they will realease something like this pretty soon with official support.

## Install
```sh
npm i firebase-security-testing
```

## Setup
In order for this package to work you will have to set the `FIREBASE_TOKEN` environment variable.
You can obtain the token with:
```sh
firebase login:ci
```

## Examples

## 
```javascript
const { RuleTestSuite, validateRuleSuite } = require('firebase-security-testing');

// Initialise the rule test suite
var storageRules = new RuleTestSuite({
	rulePath: 'storage.rules', // path to your rules file
	project: '<project-name>', // your project name
	description: 'storage rules' // optional for logging of results
});

// add a test case
storageRules.test('<description>'/* description for logging */, {
	path: '/b/<bucket-name>/o/path/to/resource',
	method: 'get',
	auth: {
		uid: '...',
		token: {
			'...': '...'
		}
	}
}).shouldSucceed(); // this test case should succeed

// ad another test case
storageRules.test('<description>'/* description for logging */, {
	path: '/b/<bucket-name>/o/path/to/resource',
	method: 'create'
}).shouldFail(); // this test case should fail

// validate the tests
validateRuleSuite(storageRules, { logging: true });

```

## Test case options

The options for the test cases ("as far as i can tell") are the ones listed in the documentation for [firestore request](https://firebase.google.com/docs/reference/rules/rules.firestore.Request), [firestore resource](https://firebase.google.com/docs/reference/rules/rules.firestore.Resource), [storage request](https://firebase.google.com/docs/reference/security/storage/#request), [storage resource](https://firebase.google.com/docs/reference/security/storage/#resource)

## Contributing
Every contribution welcome just open a issue or pr...