# Contributing to Pipeline Observatory

First off, thank you for considering contributing to the Pipeline Observatory! It's people like you that make open-source a great community.

## Development Setup

The repository is built with **zero external dependencies** (no npm, no webpack, no React). It is purely vanilla HTML, CSS, and JS to ensure maximum reliability and portability.

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/Manzela/pipeline-observatory.git
   cd pipeline-observatory
   ```
2. Start a local HTTP server:
   ```bash
   python3 -m http.server 8765
   ```
3. Open your browser to `http://localhost:8765/index.html`.

## Development Guidelines

- **Vanilla Only:** Do not introduce external libraries (e.g., Tailwind, jQuery, React) unless absolutely necessary and approved via an RFC issue.
- **Aesthetic Standard:** Code changes must maintain the "Apple-tier" / "DeepMind-tier" minimal, publication-grade aesthetic.
- **Performance:** Animations must use CSS `transform` and `opacity` only. Do not animate `top`, `left`, `width`, or `height` as they trigger layout repaints.
- **Semantic HTML:** Ensure tags are semantic and accessible.

## Submitting Changes

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Run the headless structural audit script (see previous commits for the `python3` audit script).
5. Commit your changes using Conventional Commits (`feat: ...`, `fix: ...`).
6. Push to the branch (`git push origin feature/your-feature-name`).
7. Open a Pull Request using the provided PR template.

## Reporting Bugs
Use the GitHub Issue Tracker. Please use the "Bug Report" template to ensure we have all the required information to reproduce the issue.
