const { RuleTestSuite, validateRuleSuite } = require('..');

var storageRules = new RuleTestSuite({
	rulePath: 'storage.rules',
	project: 'project-name',
	description: 'Storage rules test'
});

storageRules.test('create with auth, correct size and contentType', {
	path: '/b/default/o/uid/files/picture.jpg',
	method: 'create',
	auth: {
		uid: "uid",
	},
	resource: {
		size: 1 * 1024 * 1024,
		contentType: 'image/jpeg'
	}
}).shouldSucceed();

storageRules.test('update with auth, correct size and contentType', {
	path: '/b/default/o/uid/files/picture.jpg',
	method: 'update',
	auth: {
		uid: 'uid'
	},
	resource: {
		size: 1 * 1024 * 1024,
		contentType: 'image/jpeg'
	}
}).shouldSucceed();

storageRules.test('get should fail without auth', {
	path: '/b/default/o/uid/files/picture.jpg',
	method: 'get'
}).shouldFail();

validateRuleSuite(storageRules, { logging: true });