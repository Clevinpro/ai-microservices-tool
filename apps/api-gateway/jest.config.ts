import type { Config } from 'jest';
import baseConfig from '../../jest.config.ts';

const config: Config = {
  ...baseConfig,
  displayName: 'api-gateway',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-gateway',
};

export default config;
