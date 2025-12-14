export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@ajgifford/keepwatching-types$': '<rootDir>/node_modules/@ajgifford/keepwatching-types/dist/index.js',
    '^@ajgifford/keepwatching-ui$': '<rootDir>/node_modules/@ajgifford/keepwatching-ui/dist/index.js',
    '.*constants/constants$': '<rootDir>/src/app/__mocks__/constants.ts',
    '^../firebaseConfig$': '<rootDir>/src/app/__mocks__/firebaseConfig.ts',
    '^../../firebaseConfig$': '<rootDir>/src/app/__mocks__/firebaseConfig.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
    '^.+\\.(js|jsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          allowJs: true,
        },
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(@ajgifford|@mui|@babel|@emotion)/)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/vite-env.d.ts', '!src/main.tsx', '!src/index.tsx'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
};
