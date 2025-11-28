# Sakura Editor - GitHub Copilot Instructions

## Required Reading

Before making changes, review:
- `docs/developments/project-structure-guide.md`
- `docs/architecture/README.md`
- `docs/i18n/README.md`

## Tech Stack

- Next.js 13.5 (App Router)
- TypeScript 5.2
- Zustand (state management)
- shadcn/ui + Radix UI
- Monaco Editor
- Tailwind CSS
- i18next

## Code Style

### Imports
```typescript
// Always use absolute imports
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/store'
```

### Functions
```typescript
// Use arrow functions
const handleClick = () => {
  // implementation
}
```

### Zustand Usage
```typescript
// Good: Use selectors
const fontSize = useEditorStore((state) => state.settings.fontSize)

// Bad: Don't get entire store
const store = useEditorStore()
```

### i18n
```typescript
// All UI text must use translations
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
<Button>{t('toolbar.save')}</Button>
```

## Key Directories

- `components/editor/` - Editor components
- `components/settings/` - Settings UI
- `components/ui/` - shadcn/ui components
- `lib/store/` - Zustand stores
- `lib/i18n/translations/` - Translation files (ja.ts, en.ts)
- `lib/types/` - TypeScript types

## Adding Features

1. **New UI text**: Add to both `ja.ts` and `en.ts`
2. **New setting**: Update `lib/types/editor.ts` and `DEFAULT_EDITOR_SETTINGS`
3. **New store**: Create in `lib/store/` following existing patterns

## Validation

Always ensure:
- `npm run build` passes
- `npm run lint` passes
- No hardcoded Japanese/English text in components
