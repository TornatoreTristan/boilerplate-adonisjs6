# 🚀 Inngest Setup Guide

## Obtenir vos clés Inngest Cloud (Gratuit)

### Étape 1 : Créer un compte
1. Aller sur [https://www.inngest.com/](https://www.inngest.com/)
2. Cliquer sur **"Sign Up"** (gratuit jusqu'à 50k events/mois)
3. S'inscrire avec GitHub ou Email

### Étape 2 : Créer un projet
1. Une fois connecté, cliquer sur **"Create Project"**
2. Nommer votre projet : `boilerplate-adonisjs6` (ou autre)
3. Sélectionner votre région (EU pour RGPD compliance)

### Étape 3 : Récupérer les clés
1. Dans votre projet, aller dans **"Settings"** → **"Keys"**
2. Copier les deux clés :
   - **Event Key** : Commence par `evt_...`
   - **Signing Key** : Commence par `signkey_...`

### Étape 4 : Configurer votre .env
```bash
# Ajouter à votre fichier .env
INNGEST_EVENT_KEY=evt_your_actual_key_here
INNGEST_SIGNING_KEY=signkey_your_actual_key_here
```

### Étape 5 : Démarrer le Dev Server (Optionnel en local)
```bash
# Terminal 1 : Dev server Inngest (dashboard local sur :8288)
npx inngest-cli dev

# Terminal 2 : Application AdonisJS
npm run dev
```

## Dashboard Inngest

Une fois configuré, vous aurez accès à :
- 📊 **Dashboard Cloud** : [https://app.inngest.com](https://app.inngest.com)
- 🖥️ **Dashboard Local** : [http://localhost:8288](http://localhost:8288) (avec `inngest-cli dev`)

Le dashboard permet de :
- ✅ Voir tous les événements en temps réel
- ✅ Tracer l'exécution des functions step-by-step
- ✅ Rejouer les événements en cas d'erreur
- ✅ Monitorer les performances et erreurs

## Migration Self-hosted (Plus tard)

Si vous dépassez 50k events/mois ou avez besoin de self-hosting :

```bash
# docker-compose.yml
inngest:
  image: inngest/inngest:latest
  command: inngest start
  ports:
    - "8288:8288"
  environment:
    - INNGEST_EVENT_KEY=${INNGEST_EVENT_KEY}
    - INNGEST_SIGNING_KEY=${INNGEST_SIGNING_KEY}
    - INNGEST_POSTGRES_URI=postgresql://...
    - INNGEST_REDIS_URI=redis://...
```

Puis dans `.env` :
```bash
INNGEST_BASE_URL=http://localhost:8288
```

**Aucun changement de code requis** - juste changer l'URL ! 🎉
