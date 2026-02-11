# Contributing to Movie Recommendation System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ML-Project.git
   cd ML-Project
   ```
3. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📁 Project Structure

- `frontend/` - React frontend application
- `backend/` - Node.js/Express API server
- `ML/` - Python machine learning pipeline
- `docs/` - Additional documentation

## 🔧 Development Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### ML Pipeline
```bash
cd ML
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## 📝 Code Style

### JavaScript/React
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable names

### Python
- Follow PEP 8 style guide
- Use type hints where appropriate
- Write docstrings for functions
- Keep functions focused and testable

### CSS
- Use BEM naming convention
- Keep selectors specific to components
- Use CSS variables for theming
- Maintain responsive design

## 🧪 Testing

Before submitting a PR:
1. Test all features manually
2. Ensure no console errors
3. Check responsive design
4. Verify API endpoints work correctly

## 📤 Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub

### Commit Message Format

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add user authentication
fix: resolve search pagination issue
docs: update API documentation
```

## 🐛 Reporting Bugs

When reporting bugs, include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

## 💡 Feature Requests

For feature requests:
- Describe the feature clearly
- Explain the use case
- Provide examples if possible
- Discuss potential implementation

## 📋 Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Changes are tested and working
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No unnecessary files are included
- [ ] Branch is up to date with main

## 🤝 Code Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be acknowledged

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

Feel free to open an issue for any questions or clarifications!

Thank you for contributing! 🎉
