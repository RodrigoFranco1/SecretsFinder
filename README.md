# SecretFinder for Caido

An advanced Caido plugin that automatically detects secrets, tokens, API keys, and sensitive data in web application responses.

## 🚀 Features

### Advanced Secret Detection
- **50+ secret types** detected automatically
- **Modern APIs**: OpenAI, Anthropic, GitHub, Discord, Telegram
- **Cloud services**: AWS, Google Cloud, Firebase, Cloudflare
- **Payment systems**: Stripe, PayPal, Razorpay
- **Analytics**: Google Analytics, Mixpanel, Amplitude
- **Databases**: MongoDB, PostgreSQL, Redis, MySQL URIs
- **Cryptographic keys**: RSA, SSH, PGP, AES
- **JWT tokens** and session tokens
- **API endpoints** and internal URLs

### Smart Features
- **Real-time passive analysis** of all responses
- **Severity prioritization** (Critical, High, Medium, Low)
- **Enhanced context detection** for JavaScript files
- **Advanced filtering** by type, severity, and search
- **JSON export** of all findings
- **Security recommendations** specific to each secret type

### Modern Interface
- **Intuitive dashboard** with real-time statistics
- **Dynamic filters** for easy review
- **Detailed view** with full context
- **Quick copy** of found secrets
- **Responsive design** for any screen size

## 📦 Installation

### Method 1: From Release
1. Download the `plugin_package.zip` file from the releases page
2. In Caido, go to **Plugins**
3. Click **Install** and select the downloaded file
4. Restart Caido to activate the plugin

### Method 2: Local Development
```bash
# Clone the repository
git clone https://github.com/secscan/secretfinder-caido.git
cd secretfinder-caido

# Install dependencies
npm install

# Build the plugin
npm run build

# Package for installation
npm run package

# The plugin_package.zip file will be in dist/
```

## 🔧 Usage

### Initial Setup
1. Once installed, go to the **SecretFinder** page in the navigation menu
2. The plugin will start automatically scanning all HTTP responses
3. Found secrets will appear in real-time in the interface

### Analyzing Results
- **Color-coded cards** indicate severity:
  - 🔴 **Critical**: Critical API keys, private keys
  - 🟠 **High**: Authentication tokens, database URLs
  - 🟡 **Medium**: API endpoints, staging URLs
  - 🟢 **Low**: Emails, commented credentials

### Filters and Search
- **By severity**: Filter only critical or high
- **By type**: Show only AWS keys, JWT tokens, etc.
- **Search**: Search in URLs, context, or specific types

### Available Actions
- **View details**: Complete information and recommendations
- **Copy secret**: Copy value to clipboard
- **Export JSON**: Download all findings
- **Clear all**: Reset the secrets list

## 🎯 Detected Secret Types

### APIs and Cloud Services
```
✅ OpenAI API Keys (sk-...)
✅ Anthropic API Keys (sk-ant-api03-...)
✅ Google API Keys (AIza...)
✅ GitHub Tokens (gh[pousr]_...)
✅ AWS Access/Secret Keys
✅ Discord Bot Tokens
✅ Telegram Bot Tokens
✅ SendGrid API Keys
✅ Mailchimp API Keys
✅ Mapbox API Keys
```

### Payment Services
```
✅ Stripe Keys (pk_/sk_...)
✅ PayPal Client IDs
✅ Razorpay Keys (rzp_...)
✅ Square OAuth Secrets
✅ Braintree Access Tokens
```

### Databases
```
✅ MongoDB URIs (mongodb://...)
✅ PostgreSQL URIs (postgresql://...)
✅ MySQL URIs (mysql://...)
✅ Redis URIs (redis://...)
```

### Endpoints and URLs
```
✅ API Endpoints (/api/v1/...)
✅ REST Endpoints (/users, /admin...)
✅ GraphQL Endpoints (/graphql)
✅ Webhook URLs (/webhooks/...)
✅ Internal IPs (192.168.x.x, 10.x.x.x)
✅ Staging URLs (dev.*, staging.*)
```

### Tokens and Authentication
```
✅ JWT Tokens (ey...)
✅ Bearer Tokens
✅ Session Tokens
✅ OAuth Tokens
✅ API Keys in environment variables
```

### Cryptographic Keys
```
✅ RSA Private Keys
✅ SSH Private Keys
✅ PGP Private Keys
✅ AES Encryption Keys
✅ Device Tokens (mobile)
```

## ⚙️ Advanced Configuration

### Custom Pattern Customization
The plugin allows adding custom regex patterns:

```javascript
// In the backend, you can call:
await Caido.backend.call("updateRegexPatterns", {
  "custom_api_key": "mycompany_[a-zA-Z0-9]{32}",
  "internal_token": "INT_[0-9A-F]{16}"
});
```

### Scan Control
```javascript
// Pause/resume scanning
await Caido.backend.call("toggleScanning", false); // Pause
await Caido.backend.call("toggleScanning", true);  // Resume
```

## 🛡️ Security Considerations

### False Positives
- The plugin includes filters to reduce false positives
- Manually review critical findings
- Displayed values are partially obfuscated

### Sensitive Data
- Secrets are stored only in memory during the session
- No data is sent to external services
- Use export function to save important findings

### Recommendations
- **Immediate rotation**: For critical secrets found
- **Monitoring**: Review logs of compromised API usage
- **Prevention**: Implement scanners in CI/CD pipeline

## 🔍 Use Cases

### Penetration Testing
- Automatic detection of exposed secrets
- Identification of internal endpoints
- Analysis of session tokens

### Bug Bounty
- Passive scanning during exploration
- Identification of misconfigured APIs
- Detection of sensitive data in JavaScript

### Code Review
- Verification of hardcoded secrets
- Analysis of exposed configurations
- Validation of secure implementations

## 📊 Metrics and Statistics

The plugin provides real-time statistics:
- **Requests processed**: Total number of responses analyzed
- **Secrets found**: Counter of unique findings
- **Severity distribution**: Breakdown by criticality
- **Most common types**: Frequently detected patterns

## 🐛 Troubleshooting

### Plugin doesn't detect secrets
1. Verify that scanning is enabled (green button)
2. Confirm that responses contain valid secrets
3. Check Caido console for errors

### Frequent false positives
1. Use filters to focus on high severities
2. Customize regex patterns if needed
3. Report problematic patterns in issues

### Slow performance
1. Plugin processes large responses - this is normal
2. Pause scanning temporarily if needed
3. Clear secrets list regularly

## 📈 Roadmap

### v1.1 (Next)
- [ ] Domain whitelist/blacklist
- [ ] Pattern configuration from UI
- [ ] Integration with Caido Findings
- [ ] CSV/PDF export

### v1.2 (Future)
- [ ] Machine Learning for advanced detection
- [ ] API for external integrations
- [ ] Advanced metrics dashboard
- [ ] Real-time alerts

### v2.0 (Vision)
- [ ] Uploaded file analysis
- [ ] Advanced PII detection
- [ ] Finding correlation
- [ ] Automated reports

## 🤝 Contributing

Contributions are welcome! Please:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/new-feature`)
3. **Commit** your changes (`git commit -am 'Add new feature'`)
4. **Push** to the branch (`git push origin feature/new-feature`)
5. **Open** a Pull Request

### Local Development
```bash
# Install development dependencies
npm install

# Development mode with hot reload
npm run dev

# Run in development mode
# Plugin will reload automatically with changes
```

## 📝 Changelog

### v1.0.0 (2025-09-19)
- ✨ Initial release
- 🔍 50+ secret types detected
- 🎨 Modern and responsive interface
- 📊 Real-time statistics dashboard
- 🔧 Advanced filtering system
- 📤 JSON export
- 🛡️ Security recommendations
- 📱 Full mobile support

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Caido Team** for the excellent platform and SDK
- **Burp Suite SecretFinder** for the original inspiration
- **Security community** for feedback and testing

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/secscan/secretfinder-caido/issues)
- **Discord**: [Caido Community](https://discord.gg/caido)
- **Email**: dev@secscan.io

---

**⚡ SecretFinder - Find what shouldn't be there**
