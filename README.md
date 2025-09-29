# AdonisJS 6 Boilerplate

Project start : 27 sept 2025
Last update : 27 sept 2025
version : 0.0.01

Un boilerplate complet avec authentification, organisations et administration.

## 📝 TODO

[X] User creation

[X] Login/Logout

[X] Session tracking management

[ ] oAuth Google API

[ ] Organizations management

[ ] Super-admin dashboard

## 🚀 Quick Start

1. **Clone le projet**

```bash
   git clone https://github.com/ton-username/boilerplate-adonisjs6.git
   cd boilerplate-adonisjs6
```

2. **Installation**

```bash
   npm install
   cp .env.example .env
```

3. **Bases de données (Docker)**

```bash
  docker-compose up -d
```

4. **Migrations**

```bash
  node ace migration:run
```

4. **Démarrage**

```bash
    npm run dev
```

🏗️ Architecture

Backend: AdonisJS 6 + PostgreSQL + Redis
Frontend: Inertia.js + React
Tests: TDD avec Japa
Docker: PostgreSQL + Redis en développement

🧪 Tests

```bash
  npm run test
```
