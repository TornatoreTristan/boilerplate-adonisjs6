# 🔗 Guide des Imports & Alias

> Configuration des alias d'imports pour Backend et Frontend

## 📚 Deux Systèmes Séparés

### Backend (AdonisJS/Node.js) - Alias `#`

**Configuration** : `tsconfig.json` (root) + `package.json`

```json
// tsconfig.json
"paths": {
  "#users/*": ["./app/users/*"],
  "#shared/*": ["./app/shared/*"],
  "#auth/*": ["./app/auth/*"]
}

// package.json
"imports": {
  "#users/*": "./app/users/*.js",
  "#shared/*": "./app/shared/*.js"
}
```

**Utilisation** :
```typescript
import UserService from '#users/services/user_service'
import { E } from '#shared/exceptions/index'
import { TYPES } from '#shared/container/types'
```

### Frontend (Inertia/React) - Alias `@`

**Configuration** :
- `vite.config.ts` (runtime)
- `inertia/tsconfig.json` (TypeScript)
- `components.json` (Shadcn)

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@/': `${getDirname(import.meta.url)}/inertia/`
  }
}

// inertia/tsconfig.json
"paths": {
  "@/*": ["./*"]
}

// components.json
"aliases": {
  "components": "@/components",
  "utils": "@/lib/utils",
  "ui": "@/components/ui",
  "lib": "@/lib",
  "hooks": "@/hooks"
}
```

**Utilisation** :
```typescript
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import AppLayout from '@/components/layouts/app-layout'
```

## 🎨 Shadcn Automatisation

### Fonctionnement

1. **Installation composant** :
```bash
npx shadcn@latest add button
```

2. **Shadcn lit** `components.json` :
```json
{
  "aliases": {
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

3. **Génère automatiquement** avec les bons chemins :
```tsx
// inertia/components/ui/button.tsx
import { cn } from '@/lib/utils'  // ✅ Alias appliqué automatiquement
```

### Ajout d'un nouveau composant

```bash
# Shadcn utilise automatiquement les alias de components.json
npx shadcn@latest add card

# Génère : inertia/components/ui/card.tsx
# Avec import : from '@/lib/utils'
```

## 📂 Structure Recommandée

```
inertia/
├── components/
│   ├── ui/              # Composants shadcn (@/components/ui/*)
│   └── layouts/         # Layouts app (@/components/layouts/*)
├── lib/
│   └── utils.ts         # Utilities (@/lib/utils)
├── hooks/               # React hooks (@/hooks/*)
├── pages/               # Pages Inertia (@/pages/*)
└── css/
    └── app.css          # Tailwind CSS

app/
├── users/               # Domain users (#users/*)
├── auth/                # Domain auth (#auth/*)
└── shared/              # Shared code (#shared/*)
```

## 🔄 Migration d'Alias

### Changer `@/` vers autre chose (ex: `~/`)

1. **Vite** :
```typescript
// vite.config.ts
alias: {
  '~/': `${getDirname(import.meta.url)}/inertia/`
}
```

2. **TypeScript** :
```json
// inertia/tsconfig.json
"paths": {
  "~/*": ["./*"]
}
```

3. **Shadcn** :
```json
// components.json
"aliases": {
  "utils": "~/lib/utils",
  "ui": "~/components/ui"
}
```

4. **Mise à jour des imports existants** :
```bash
# Find & replace dans tous les fichiers
find inertia -name "*.tsx" -exec sed -i '' 's/@\//~\//g' {} +
```

## ⚠️ Erreurs Courantes

### 1. Alias non reconnu en dev

**Cause** : Vite cache non invalidé

**Solution** :
```bash
rm -rf node_modules/.vite
npm run dev
```

### 2. TypeScript ne trouve pas le module

**Cause** : tsconfig.json mal configuré

**Solution** : Vérifier `baseUrl: "."` dans `inertia/tsconfig.json`

### 3. Shadcn génère de mauvais imports

**Cause** : `components.json` non synchronisé

**Solution** : Mettre à jour les alias dans `components.json`

## 🧪 Tester la Configuration

Créer un fichier de test :

```typescript
// inertia/test-imports.tsx
import { cn } from '@/lib/utils'              // ✅ Should work
import { Button } from '@/components/ui/button' // ✅ Should work

// Ne devrait PAS fonctionner (cross-boundary) :
// import UserService from '#users/services/user_service' // ❌ Backend only
```

Si TypeScript ne signale pas d'erreur = configuration OK ✅

## 📖 Références

- [Vite Alias Resolution](https://vitejs.dev/config/shared-options.html#resolve-alias)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [Shadcn Components.json](https://ui.shadcn.com/docs/components-json)
- [Node.js Subpath Imports](https://nodejs.org/api/packages.html#subpath-imports)

---

**Dernière mise à jour** : 6 octobre 2025
