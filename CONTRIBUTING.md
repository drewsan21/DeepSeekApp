# DeepSeek Desktop - Contributing Guide

Thank you for your interest in contributing to DeepSeek Desktop! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- Git

### Installation

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/deepseek-desktop.git
   cd deepseek-desktop
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development**
   ```bash
   # Start renderer dev server
   pnpm --filter @deepseek/desktop dev:renderer
   
   # In another terminal, start Electron
   pnpm --filter @deepseek/desktop dev
   ```

## 📁 Project Structure

```
deepseek-desktop/
├── apps/
│   └── desktop/              # Electron application
│       ├── electron/         # Main process
│       ├── renderer/         # React UI
│       └── tests/            # E2E tests
├── packages/                 # Shared packages
│   ├── shared/              # Shared types
│   ├── auth/                # Authentication
│   ├── browser/             # Browser management
│   ├── mcp/                 # MCP server management
│   ├── tools/               # Tool implementations
│   └── ...
└── scripts/                 # Build and utility scripts
```

## 🔧 Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Run Tests
```bash
# Run all tests
./scripts/run-tests.sh  # Linux/macOS
.\scripts\run-tests.bat  # Windows

# Run specific package tests
pnpm --filter @deepseek/shared test
```

### 4. Build
```bash
pnpm build
```

### 5. Commit
```bash
git add .
git commit -m "feat: add your feature"
```

We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 6. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📝 Code Style

### TypeScript
- Use strict mode
- Prefer interfaces over types
- Use explicit return types for public functions
- Avoid `any` type

### React
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for props
- Follow React best practices

### CSS
- Use Tailwind CSS classes
- Follow existing naming conventions
- Keep styles modular

## 🧪 Testing

### Unit Tests
```bash
pnpm --filter @deepseek/shared test
```

### Integration Tests
```bash
pnpm --filter @deepseek/desktop test:integration
```

### E2E Tests
```bash
pnpm --filter @deepseek/desktop test:e2e
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for public APIs
- Include examples where helpful
- Keep comments up-to-date

### User Documentation
- Update README.md for user-facing changes
- Update docs/ for detailed guides
- Add screenshots for UI changes

## 🐛 Reporting Issues

### Bug Reports
Use the bug report template and include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests
Use the feature request template and include:
- Clear description
- Use case
- Proposed solution (optional)
- Alternatives considered

## 🔒 Security

### Reporting Security Issues
**DO NOT** create a public issue for security vulnerabilities.

Instead, email: security@deepseek.com

### Security Best Practices
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow the security model in SECURITY.md
- Report vulnerabilities responsibly

## 📋 Pull Request Checklist

Before submitting your PR:

- [ ] Code follows the style guide
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] Commit messages follow conventional commits
- [ ] No sensitive data committed
- [ ] PR description is clear and complete
- [ ] Linked related issues

## 🎯 Areas for Contribution

### Good First Issues
Look for issues labeled `good first issue` - these are perfect for newcomers.

### High Impact Areas
- Performance optimization
- Accessibility improvements
- Test coverage
- Documentation
- Bug fixes

### Feature Requests
Check the roadmap for planned features. If you want to work on something not listed, open an issue first to discuss.

## 🤝 Community

### Communication
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and ideas
- Pull Requests: Code contributions

### Code of Conduct
We follow the [Contributor Covenant](https://www.contributor-covenant.org/). Be respectful, inclusive, and constructive.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to DeepSeek Desktop! 🚀
