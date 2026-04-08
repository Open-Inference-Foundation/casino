# Contributing to Casino

Thank you for your interest in contributing to Casino! This document provides guidelines for submitting issues and pull requests.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/casino.git`
3. Install dependencies: `npm install`
4. Copy the env template: `cp .env.example .env.local`
5. Start the dev server: `npm run dev`

Casino runs in mock mode by default — no backend required.

## Development

- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 (utility-first, CSS custom properties for theming)
- **Routing**: React Router v6
- **State**: React hooks + Valtio for global state
- **SDK**: `@flowstack/sdk` for all backend communication

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run build` to verify the build passes
4. Submit a pull request against `main`

### Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Include a clear description of what changed and why
- Ensure the build passes (`npm run build`)
- Follow existing code patterns and naming conventions

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include steps to reproduce for bugs
- Include browser and OS information if relevant

## Code Style

- TypeScript strict mode
- Functional React components with hooks
- CSS custom properties (`var(--color-*)`) for theming
- No `any` types unless necessary (use `eslint-disable` with a comment explaining why)

## What We Accept

- Bug fixes
- Performance improvements
- Accessibility improvements
- Documentation improvements
- New components that follow existing patterns

## What We Don't Accept

- Changes that require a specific backend deployment
- Dependencies on non-open-source packages
- Features that break mock mode

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
