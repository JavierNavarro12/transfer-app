# TransferApp Testing

This directory contains comprehensive tests for the TransferApp, including unit tests, component tests, and end-to-end (E2E) tests.

## Test Structure

```
tests/
├── e2e/                    # End-to-End tests (Playwright)
│   ├── app.spec.ts        # Basic app navigation and UI tests
│   └── upload-download.spec.ts # File upload/download flow tests
├── utils/                 # Unit tests for utility functions
│   ├── config.test.ts     # Tests for config utilities
│   └── encryption.test.ts # Tests for encryption utilities
└── README.md              # This file
```

## Running Tests

### Unit Tests
```bash
npm test                    # Run all unit tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
```

### End-to-End Tests
```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e:ui        # Run E2E tests with UI mode
```

The E2E tests will automatically start the development server on port 3000.

## Test Coverage

### Unit Tests
- **Configuration utilities**: Session ID generation, encryption keys, file size formatting
- **Encryption utilities**: File encryption/decryption, integrity verification

### E2E Tests
- **Navigation**: Home page, upload/download page navigation
- **UI Components**: Button states, input validation, QR scanner
- **File Operations**: File selection, upload interface
- **Session Management**: Code input validation, button enabling/disabling

## Test Environment

### Unit Tests
- **Framework**: Jest
- **Testing Library**: React Testing Library
- **Environment**: jsdom

### E2E Tests
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Environment**: Real browser testing

## Continuous Integration

Tests are designed to run in CI environments:
- Unit tests run without external dependencies
- E2E tests start their own dev server
- All tests include proper timeouts and retries

## Adding New Tests

### Unit Tests
1. Create test files in `tests/utils/` or `tests/components/`
2. Follow naming convention: `*.test.ts`
3. Use Jest and React Testing Library APIs

### E2E Tests
1. Create test files in `tests/e2e/`
2. Follow naming convention: `*.spec.ts`
3. Use Playwright APIs for browser automation

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Module name mapping for `@/` imports
- jsdom environment for React components
- Setup file for mocks

### Playwright Configuration (`playwright.config.ts`)
- Multi-browser testing (Chromium, Firefox, WebKit)
- Automatic dev server startup
- HTML reports for test results

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Realistic Data**: Use realistic test data and scenarios
3. **Accessibility**: Use semantic selectors when possible
4. **Performance**: Keep tests focused and avoid unnecessary waits
5. **Maintenance**: Update tests when UI/UX changes occur
