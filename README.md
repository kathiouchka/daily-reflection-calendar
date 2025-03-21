# Ma Petite Question

Une application web qui présente aux utilisateurs une question quotidienne de réflexion. Les utilisateurs peuvent répondre aux questions du jour et consulter leurs réponses dans un format calendrier.

## Fonctionnalités

- 🔐 Authentification Google
- 📅 Vue calendrier des questions et réponses quotidiennes
- 💭 Questions de réflexion quotidiennes en français
- 🌓 Mode clair/sombre
- 🔒 Routes protégées pour les utilisateurs authentifiés

## Stack Technique

- Next.js
- TypeScript
- Prisma avec Supabase (PostgreSQL)
- NextAuth.js
- TailwindCSS
- React Markdown
- Vercel (Déploiement)

## Prérequis

- Node.js (dernière version LTS recommandée)
- npm ou yarn
- Identifiants Google OAuth (pour l'authentification)
- Compte Supabase (pour la base de données en production)
- Compte Vercel (pour le déploiement)

## Instructions d'Installation

1. Cloner le dépôt :
```bash
git clone [your-repository-url]
cd mapetitequestion
```

2. Installer les dépendances :
```bash
npm install
```

3. Configuration des variables d'environnement :
Créer un fichier `.env.local` avec les variables suivantes :

Pour le développement :
```env
# Database (Development)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Pour la production :
```env
# Database (Production)
DATABASE_URL="your-supabase-connection-string"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Configuration de la base de données :
```bash
# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:migrate

# Peupler la base de données
npm run seed
```

5. Démarrer le serveur de développement :
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## Déploiement

### Supabase (Base de données)

1. Créer un projet sur [Supabase](https://supabase.com)
2. Obtenir la chaîne de connexion PostgreSQL
3. Mettre à jour la variable `DATABASE_URL` dans les paramètres de Vercel

### Vercel (Hébergement)

1. Pusher votre code sur GitHub
2. Connecter votre dépôt à [Vercel](https://vercel.com)
3. Configurer les variables d'environnement dans Vercel
4. Déployer !

## Structure de la Base de Données

L'application utilise les modèles suivants :
- `User`: Informations utilisateur et authentification
- `Phrase`: Questions quotidiennes
- `UserResponse`: Réponses des utilisateurs
- `Account` & `Session`: Gestion de l'authentification NextAuth.js

## Scripts Disponibles

- `npm run dev`: Démarre le serveur de développement
- `npm run build`: Compile l'application
- `npm run prisma:migrate`: Exécute les migrations de la base de données
- `npm run prisma:generate`: Génère le client Prisma
- `npm run seed`: Peuple la base de données avec les questions

## Authentification

L'application utilise Google OAuth. Configuration :

1. Aller sur la [Console Google Cloud](https://console.cloud.google.com/)
2. Créer un nouveau projet
3. Activer l'API Google OAuth
4. Créer des identifiants (ID client OAuth)
5. Ajouter les URIs de redirection autorisés :
   - Développement : `http://localhost:3000/api/auth/callback/google`
   - Production : `https://[votre-domaine]/api/auth/callback/google`

## Notes de Développement

- L'application utilise SQLite en développement et PostgreSQL (Supabase) en production
- Les variables d'environnement doivent être correctement configurées
- Le script seed peuple la base de données avec des questions en français
- Le déploiement est automatisé via Vercel

## Contribution

1. Créer une nouvelle branche pour votre fonctionnalité
2. Effectuer vos modifications
3. Soumettre une pull request

## License

[Votre Licence] 