# Mochi Editor - AI Development Guide

## Required Reading Before Any Changes

**IMPORTANT**: Before making any code changes, you MUST read the following documentation:

1. `docs/developments/project-structure-guide.md` - Project structure and coding conventions
2. `docs/architecture/README.md` - System architecture and state management
3. `docs/i18n/README.md` - Internationalization guide (for any UI text changes)

## Quick Reference

### Tech Stack
- **Framework**: Next.js 13.5 (App Router)
- **Language**: TypeScript 5.2
- **State Management**: Zustand
- **UI Library**: shadcn/ui + Radix UI
- **Editor**: Monaco Editor
- **Styling**: Tailwind CSS
- **i18n**: i18next + react-i18next

### Project Structure
```
mochi-editor/
├── app/                  # Next.js App Router pages
├── components/
│   ├── editor/           # Editor components (MonacoEditor, Toolbar, etc.)
│   ├── settings/         # Settings dialog components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── store/            # Zustand stores
│   ├── i18n/translations/ # ja.ts, en.ts
│   └── types/            # TypeScript types
└── docs/                 # Documentation
```

### Key Stores
| Store | File | Purpose |
|-------|------|---------|
| EditorStore | `lib/store.ts` | Editor settings (persisted) |
| FileStore | `lib/store/file-store.ts` | Open files |
| SearchStore | `lib/store/search-store.ts` | Search state |
| SplitViewStore | `lib/store/split-view-store.ts` | Split view state |

## Coding Rules

### Must Follow
1. **No hardcoded text** - All UI text must use i18n (`t('key')`)
2. **Add translations to both** `ja.ts` and `en.ts`
3. **Use Zustand selectors** - Never `useStore()`, always `useStore((s) => s.value)`
4. **Arrow functions** - `const fn = () => {}` not `function fn() {}`
5. **No unnecessary comments** - Code should be self-documenting
6. **Absolute imports** - Use `@/` prefix for all imports

### Before Commit
```bash
npm run build    # Must pass
npm run lint     # Must pass
```

## Common Tasks

### Adding UI Text
1. Add key to `lib/i18n/translations/ja.ts`
2. Add key to `lib/i18n/translations/en.ts`
3. Use `const { t } = useTranslation()` in component
4. Reference with `t('category.key')`

### Adding New Store
1. Create `lib/store/[name]-store.ts`
2. Follow existing store patterns
3. Use selectors in components

### Modifying Editor Settings
1. Update type in `lib/types/editor.ts`
2. Add default in `DEFAULT_EDITOR_SETTINGS`
3. Add UI in `components/settings/tabs/`
4. Add translations

## File References
When mentioning code locations, use format: `file_path:line_number`
