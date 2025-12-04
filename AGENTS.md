# Zen Editor - AI Agents (OpenAI Codex / ChatGPT)

**Full guide: [docs/ai/README.md](docs/ai/README.md)**

## Quick Start

Read before coding:
- [Project Structure](docs/developments/project-structure-guide.md)
- [Architecture](docs/architecture/README.md)
- [i18n Guide](docs/i18n/README.md)

## Required Rules

1. Use i18n for all UI text (no hardcoding)
2. Add translations to both `ja.ts` and `en.ts`
3. Use Zustand selectors
4. Use absolute imports (`@/`)
5. Use arrow functions
6. No unnecessary comments

## Before Commit

```bash
npm run build && npm run lint
```
