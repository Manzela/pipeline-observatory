# Security Policy

## Supported Versions

Currently, the Pipeline Observatory and the underlying Multi-Agent DAG components support the following versions:

| Version | Supported          | Notes |
| ------- | ------------------ | ----- |
| v2.0.x  | :white_check_mark: | Current stable release with Gemini 3.1 Flash-Lite support |
| v1.5.x  | :x:                | Deprecated (Gemma 4 MoE experimental branch) |
| < 1.5   | :x:                | Unsupported |

## Reporting a Vulnerability

We take the security of the Pipeline Observatory and the Antigravity ecosystem extremely seriously. Our architecture relies on a **Fail-Closed Policy** (DEMAS JIT Audit) to prevent silent failures and data poisoning, but external vulnerabilities must be handled with care.

If you discover a security vulnerability within this project, please **do NOT report it in the public issue tracker**.

Instead, please send an email to:
**security@manzela.github.io** (or your actual security contact).

### What to include in your report:
- A detailed description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact (e.g., prompt injection, state manipulation, telemetry spoofing).
- Any proposed mitigation if you have one.

### Expected Response Time:
- **Acknowledgment:** Within 24 hours.
- **Triage & Patching:** High-severity issues are typically patched within 48 hours.
- **Disclosure:** We follow responsible disclosure guidelines and will coordinate with you before publishing the fix.

## Security Best Practices in Production
When deploying the Pipeline Observatory, ensure:
1. **Network Isolation:** Modals and auto-scaling LLM instances should be strictly network-isolated.
2. **Secret Management:** Never commit `.env` files. Ensure you use an OS-native keyring or GCP Secret Manager.
3. **Telemetry Auditing:** Review Langfuse and BigQuery access controls (IAM) to ensure execution logs are not publicly exposed.
