/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: {
		'^.+\\.(mt|t|cj|j)s$': [
			'ts-jest',
			{
				useESM: true,
			},
		],
	},
	extensionsToTreatAsEsm: ['.ts'],
};
