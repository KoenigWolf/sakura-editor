# Mochi Editor - AI Agent Instructions

This file provides instructions for AI coding assistants (OpenAI Codex, ChatGPT, etc.)

## Pre-requisite: Read Documentation First

**STOP** - Before writing any code, you MUST read:

1. **Project Structure**: `docs/developments/project-structure-guide.md`
2. **Architecture**: `docs/architecture/README.md`
3. **i18n Guide**: `docs/i18n/README.md` (if touching UI text)

## Project Summary

Mochi Editor is a web-based code editor for modern development.

### Technology
| Category | Technology |
|----------|------------|
| Framework | Next.js 13.5 (App Router) |
| Language | TypeScript 5.2 |
| State | Zustand |
| UI | shadcn/ui + Radix UI |
| Editor | Monaco Editor |
| Styling | Tailwind CSS |
| i18n | i18next |

### Directory Map
```
mochi-editor/
├── app/                      # Next.js pages
├── components/
│   ├── editor/               # MonacoEditor, Toolbar, FileTabs, SearchDialog
│   ├── settings/             # SettingsDialog, tabs/*
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── store/                # Zustand stores
│   │   ├── file-store.ts
│   │   ├── search-store.ts
│   │   ├── split-view-store.ts
│   │   └── editor-instance-store.ts
│   ├── i18n/translations/    # ja.ts, en.ts
│   ├── types/editor.ts       # EditorSettings type
│   └── store.ts              # Main editor settings store
└── docs/                     # Documentation (READ THESE)
```

## Mandatory Rules

### 1. No Hardcoded Text
```typescript
// WRONG
<Button>Save</Button>

// CORRECT
const { t } = useTranslation()
<Button>{t('toolbar.save')}</Button>
```

### 2. Update Both Translation Files
When adding text, update BOTH:
- `lib/i18n/translations/ja.ts`
- `lib/i18n/translations/en.ts`

### 3. Use Zustand Selectors
```typescript
// WRONG
const store = useEditorStore()
const fontSize = store.settings.fontSize

// CORRECT
const fontSize = useEditorStore((state) => state.settings.fontSize)
```

### 4. Use Absolute Imports
```typescript
// WRONG
import { Button } from '../../../components/ui/button'

// CORRECT
import { Button } from '@/components/ui/button'
```

### 5. Arrow Functions Only
```typescript
// WRONG
function handleClick() {}

// CORRECT
const handleClick = () => {}
```

### 6. No Unnecessary Comments
Code should be self-documenting. Remove obvious comments.

## Validation Checklist

Before finishing:
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] All UI text uses i18n
- [ ] Both ja.ts and en.ts updated
- [ ] Using Zustand selectors
- [ ] No hardcoded strings

## Common Tasks Reference

### Add New Editor Setting
1. `lib/types/editor.ts` - Add to EditorSettings interface
2. `lib/types/editor.ts` - Add default to DEFAULT_EDITOR_SETTINGS
3. `components/settings/tabs/*.tsx` - Add UI
4. `lib/i18n/translations/ja.ts` - Add Japanese text
5. `lib/i18n/translations/en.ts` - Add English text

### Add New Toolbar Button
1. `components/editor/EditorToolbar.tsx` - Add button
2. `lib/i18n/translations/ja.ts` - Add `toolbar.newAction`
3. `lib/i18n/translations/en.ts` - Add `toolbar.newAction`

### Add New Store
1. Create `lib/store/[name]-store.ts`
2. Follow pattern from existing stores
3. Export from the file
4. Import where needed
