# Contributing to DeepSeek Desktop

Thank you for your interest in contributing to DeepSeek Desktop! This document provides guidelines and information for contributors.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

## How to Contribute

### Reporting Bugs

- Use the GitHub Issues tab to report bugs
- Include steps to reproduce, expected behavior, and actual behavior
- Mention your OS and Node.js version

### Suggesting Features

- Open an issue with the "enhancement" label
- Describe the feature and its use case
- Be open to discussion and feedback

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

**Linux/macOS:**
```bash
chmod +x install.sh
./install.sh
```

**Windows:**
```cmd
install.bat
```

### Running the App

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components focused and small

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add command palette keyboard navigation
fix: resolve memory leak in event listeners
docs: update README with installation instructions
style: format code with Prettier
refactor: simplify state management logic
test: add unit tests for approval modal
chore: update dependencies
```

## Testing

Before submitting a PR:

- Ensure the app builds without errors
- Test on multiple browsers if applicable
- Verify all features work as expected
- Check for console errors

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing!
