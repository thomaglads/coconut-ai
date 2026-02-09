# Contributing to Coconut AI
*Building Privacy-First AI Analytics Together*

Thank you for your interest in contributing to Coconut AI! We welcome contributions from developers, data scientists, and privacy advocates who share our vision of bringing powerful, private AI analytics to every organization.

---

## 🎯 Our Mission

**Bring privacy-first, reliable AI analytics to every organization.**

We believe that:
- 🥥 **Privacy is non-negotiable** - User data should never leave their device
- ⚡ **Performance matters** - AI should be instant, not frustrating
- 🔍 **Transparency builds trust** - Users should see how AI makes decisions
- 🛠️ **Open source advances** - Community collaboration improves everyone's security

---

## 🤝 How to Contribute

### 🐛 Report Bugs

**Help us improve Coconut AI by reporting issues:**

1. **Use the Bug Report Template** (below)
2. **Provide reproduction steps** with sample data
3. **Include system information** (OS, RAM, app version)
4. **Attach screenshots** when UI issues occur
5. **Describe expected vs actual behavior**

**Where to report:**
- GitHub Issues: [github.com/thomaglads/coconut-ai/issues](https://github.com/thomaglads/coconut-ai/issues)
- Security Issues: [this.thoma@gmail.com](mailto:this.thoma@gmail.com) (private disclosure)

### 💡 Feature Requests

**We love ideas for making Coconut AI better:**

1. **Check existing issues** to avoid duplicates
2. **Use the Feature Request Template** (below)
3. **Explain the problem** your feature solves
4. **Consider privacy impact** in your proposal
5. **Suggest implementation** if you have ideas

### 🔧 Code Contributions

**Direct development contributions are welcome:**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow our coding standards** (see below)
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Submit a pull request** with clear description

---

## 📋 Templates

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A concise description of what you expected to happen.

## Actual Behavior
A concise description of what actually happened.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment Information
- Coconut AI Version: 
- Operating System: 
- RAM: 
- Dataset Size/Type: 
- Browser (if applicable): 

## Additional Context
Add any other context about the problem here.
```

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of what you want to happen.

## Problem Statement
What problem does this feature solve? What pain point does it address?

## Proposed Solution
How do you envision this feature working? 

## Privacy Impact
How does this feature affect our privacy-first approach?

## Alternatives Considered
What other approaches did you consider? Why did you choose this one?

## Additional Context
Add any other context, mockups, or examples about the feature request here.
```

---

## 🛠️ Development Guidelines

### Coding Standards

#### JavaScript/React
```javascript
// Use modern ES6+ syntax
const { useState, useEffect } = React;

// Prefer functional components with hooks
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  return (
    <div className="flex items-center gap-2">
      {/* JSX content */}
    </div>
  );
};

// Export as default
export default MyComponent;
```

#### CSS/Styling
```jsx
// Use Tailwind utility classes
<div className="flex flex-col bg-slate-900 text-white rounded-lg p-4">
  <h2 className="text-xl font-bold mb-2">Title</h2>
  <p className="text-sm text-slate-300">Content</p>
</div>

// Custom CSS should be minimal and well-documented
.custom-component {
  /* Reason for custom CSS */
  property: value;
}
```

#### File Naming
- **Components**: PascalCase (`ChatInterface.jsx`)
- **Services**: camelCase (`insightEngine.js`)
- **Utilities**: camelCase (`fileValidator.js`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.js`)

### Code Quality

#### Linting
```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint:fix
```

#### Formatting
```bash
# Format all code
npm run format
```

#### Testing
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 🏗️ Architecture Guidelines

### Core Principles

#### 1. Privacy First
- **Never send data to external services**
- **All AI processing must be local**
- **User data stays on user device**
- **No telemetry or analytics collection**

#### 2. Performance Critical
- **Startup time must remain <1s**
- **Query responses should be <3s**
- **Forecasting must be instant**
- **Memory usage under 2GB total**

#### 3. Transparency Required
- **Logic Trace UI must expose routing decisions**
- **SQL queries must be visible to users**
- **Error messages should be helpful and specific**
- **Processing steps should be explainable**

### Component Guidelines

#### Intent Router (`src/main/mainInsightEngine.js`)
```javascript
// Route requests based on keywords
const isForecast = predictionKeywords.some(keyword => 
  question.toLowerCase().includes(keyword)
);

if (isForecast) {
  return { routingType: 'Direct Math Engine', ... };
} else {
  return { routingType: 'SQL LLM', ... };
}
```

#### Direct Math Engine (`src/services/simpleForecaster.js`)
```javascript
// Pure JavaScript calculations
// No AI/LLM dependencies
// Guaranteed accuracy
function linearRegression(data, periods) {
  // Mathematical implementation
  return predictions;
}
```

#### Logic Trace UI (`src/components/ChatInterface.jsx`)
```jsx
// Always show routing decisions
// Use visual indicators
// Provide SQL transparency
{routingType && (
  <div className="routing-indicator">
    {routingType === 'Direct Math Engine' ? '🥥' : '🤖'} {routingType}
  </div>
)}
```

---

## 📦 Build & Release

### Development
```bash
# Clone your fork
git clone https://github.com/thomaglads/coconut-ai.git

# Install dependencies
npm install

# Start development server
npm run electron:dev

# Run tests
npm test
```

### Building
```bash
# Build for current platform
npm run electron:build

# Build for all platforms
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS  
npm run electron:build:linux  # Linux

# Portable version
npm run electron:build:portable
```

### Release Process
1. **Version bump**: Update `package.json` version
2. **Update CHANGELOG**: Document all changes
3. **Tag release**: `git tag v1.0.0`
4. **Push to main**: `git push origin main`
5. **Create Release**: GitHub Actions will build and publish

---

## 🧪 Testing Guidelines

### Unit Testing
- **Test core logic** (Intent Router, Math Engine)
- **Mock external dependencies** (database, file system)
- **Cover edge cases** (empty data, invalid input)
- **Maintain >80% coverage**

### Integration Testing
- **Test component interactions**
- **Verify data flow** through services
- **Test error handling** boundaries
- **Validate routing decisions**

### Performance Testing
- **Startup time**: Must remain <1s
- **Query response**: Should be <3s average
- **Memory usage**: Monitor for leaks
- **Large datasets**: Test scaling behavior

### Privacy Testing
- **Network traffic**: Verify no external requests
- **Data storage**: Ensure local-only processing
- **Logs**: Confirm no sensitive data logging
- **Offline mode**: Test without internet

---

## 📚 Documentation

### When to Update Documentation

- **New features**: Update README and user guide
- **API changes**: Update service documentation  
- **Architecture changes**: Update technical docs
- **Installation changes**: Update build instructions

### Documentation Standards

#### README.md
- **Clear value proposition**
- **Quick start instructions**
- **System requirements**
- **Usage examples**

#### Code Comments
```javascript
/**
 * Hybrid-RAG Intent Router
 * Routes user queries to optimal processing engine
 * 
 * @param {string} question - User's natural language query
 * @returns {Object} Routing decision and strategy
 */
function routeQuery(question) {
  // Implementation
}
```

---

## 🏷️ License & IP

### Contributions
By contributing to Coconut AI, you agree that:
- **Your contributions** will be MIT licensed
- **You retain IP** to your original code
- **We can use** your contributions in the product
- **Community benefits** from your improvements

### Commercial Use
- ✅ **Allowed** in commercial applications
- ✅ **Modifications** permitted with attribution
- ✅ **Private distribution** welcome
- ✅ **SaaS integration** encouraged

---

## 🎉 Recognition

### Contributors
All significant contributors will be:
- **Listed in README.md**
- **Featured in releases**
- **Invited to beta testing program**
- **Offered Coconut AI swag** (stickers, t-shirts)

### Types of Contributions We Value
- 🐛 **Bug fixes** and stability improvements
- 💡 **New features** that align with our mission
- 📚 **Documentation** and user experience improvements
- ⚡ **Performance optimizations** and memory improvements
- 🔒 **Privacy enhancements** and security hardening
- 🌍 **Internationalization** and accessibility support

---

## 💬 Get in Touch

### Questions?
- **GitHub Discussions**: Open questions for community input
- **Development Discord**: [discord.gg/coconut-ai](https://discord.gg/coconut-ai)
- **Email**: [this.thoma@gmail.com](mailto:this.thoma@gmail.com)

### Security Concerns?
- **Private Disclosure**: [this.thoma@gmail.com](mailto:this.thoma@gmail.com)
- **PGP Key**: Available on request
- **Response Time**: Within 24 hours for security issues

---

## 🥥 Join Our Community

Together, we're building the future of private AI analytics. Every contribution, whether it's a bug fix, feature improvement, or documentation update, helps make Coconut AI more reliable, performant, and respectful of user privacy.

**Thank you for considering contributing to Coconut AI!**

*Where Privacy Meets Performance* 🥥