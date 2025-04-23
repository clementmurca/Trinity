# **Documentation DevOps - Projet TRINITY**

## Table des matières

1. [Technologies et architecture du projet](#technologies-et-architecture-du-projet)
2. [Différences entre les configurations de développement et de production](#differences-entre-les-configurations-de-developpement-et-de-production)
3. [Pipeline CI/CD](#pipeline-cicd)
4. [Instructions pour installer et configurer les GitLab Runners](#instructions-pour-installer-et-configurer-les-gitlab-runners)

---

## **1. Technologies et architecture du projet**

### **Technologies utilisées**

1. **Docker**  
   Conteneurisation des applications pour garantir la cohérence entre les environnements (dev, prod).  
   Utilisation de `docker-compose.yml` pour orchestrer les services backend et frontend.  
   Ce fichier comprend les configurations suivantes :

   - Builds des environnements **dev** et **prod**
   - Configuration des noms de conteneur, ports et variables d'environnement
   - Commandes pour lancer et tester les versions **dev** et **prod** du backend et du frontend.

2. **GitLab CI/CD**  
   Automatisation des processus de développement, de tests et de déploiement via des pipelines CI/CD.  
   Utilisation de **GitLab Runners** pour exécuter des tâches telles que les tests, le build et le déploiement.

   > **Note importante**  
   > Le pipeline CI/CD permet une intégration continue avec des tests automatisés à chaque étape pour assurer la qualité du code.

3. **Backend (Node.js avec Express)**  
   Utilisation de **Node.js** et **Express** pour gérer les requêtes et les API.  
   Sécurisation des routes avec **passport.js** pour l'authentification et la gestion des utilisateurs.  
   Gestion des migrations avec **MongoDB** via `migrate-mongo`.

4. **Frontend (React avec Vite et Tailwind CSS)**  
   Utilisation de **React** pour l'interface utilisateur, configuré avec **Vite** pour des builds rapides.  
   **Tailwind CSS** pour une gestion flexible du design.  
   **Vitest** pour les tests unitaires côté frontend.

5. **GitLab Runners**  
   Les **GitLab Runners** sont utilisés pour exécuter le pipeline CI/CD. Ils interagissent avec Docker pour lancer des conteneurs en fonction de la configuration.

### **Architecture du projet**

Voici l'architecture détaillée du projet, incluant le backend et le frontend :

```
ARCH
├── backend
│   ├── Dockerfile               # Configuration pour le backend
│   ├── server.js                # Serveur Express
│   ├── src/
│   │   ├── config               # Configuration du backend (DB, auth)
│   │   ├── controllers          # Logique des API
│   │   ├── middleware           # Middlewares (auth, sécurité, etc.)
│   │   ├── routes               # Définition des routes API
│   │   └── models               # Modèles Mongoose
│   ├── package.json             # Dépendances du backend
├── frontend
│   ├── Dockerfile               # Configuration pour le frontend
│   ├── src/
│   │   ├── components           # Composants React (formulaires, UI, etc.)
│   │   ├── features             # Logique d'état et de service pour l'auth
│   │   ├── pages                # Pages principales (accueil, login, etc.)
│   ├── vite.config.js           # Configuration de Vite
│   ├── tailwind.config.js       # Configuration de Tailwind CSS
│   ├── package.json             # Dépendances du frontend
├── docker-compose.yml           # Orchestration des services (frontend + backend)
└── README.md                    # Documentation du projet
```

---

## 2. Différences entre les configurations de développement et de production

### Environnement de développement (Backend et Frontend)

#### Backend Dockerfile (dev)

Pour l'environnement de développement, le Dockerfile backend configure l'application pour un développement fluide avec un maximum de ressources allouées et un démarrage rapide.

```dockerfile
# Development
FROM node:21.1-alpine AS development

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5001
CMD ["npm", "run", "dev"]
```

**Explication** :

- `WORKDIR /app` : Définit le répertoire de travail dans le conteneur.
- `npm ci` : Installe les dépendances en utilisant un fichier `package-lock.json` pour garantir des versions fixes.
- `CMD ["npm", "run", "dev"]` : Lance l'application en mode développement, généralement avec un outil comme `nodemon` ou un équivalent pour recharger les modifications automatiquement.
- Le port **5001** est exposé pour l'application backend en mode développement.

#### Frontend Dockerfile (dev)

De même, pour le frontend, ce Dockerfile configure un environnement de développement pour un rechargement rapide et une installation des dépendances optimisée.

```dockerfile
# Development
FROM node:21.1-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
```

**Explication** :

- Le port **5173** est exposé, utilisé par Vite en mode développement pour servir le frontend.

---

### Environnement de production (Backend et Frontend)

#### Backend Dockerfile (prod)

Pour l'environnement de production, le Dockerfile backend utilise une image optimisée pour un déploiement de performance, avec une gestion des ressources plus stricte et une optimisation des dépendances.

```dockerfile
# Production
FROM node:21.1-alpine AS production

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5002
CMD ["node", "./server.js"]
```

**Explication** :

- Les dépendances sont installées avec `npm ci --only=production` pour s'assurer que seules les dépendances nécessaires pour la production sont installées.
- Le port **5002** est exposé pour l'application backend en production.

#### Frontend Dockerfile (prod)

Le Dockerfile de production pour le frontend construit l'application pour la production (optimisation des fichiers, gestion des assets) et utilise un serveur de prévisualisation.

```dockerfile
# Production
FROM node:21.1-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 4173
CMD ["npm", "run", "preview"]
```

**Explication** :

- `npm run build` : Compile le code frontend pour la production.
- Le port **4173** est exposé pour l'application frontend en mode production.

---

### Environnement de tests (Backend et Frontend)

#### Backend Dockerfile (test)

Pour les tests, ce Dockerfile configure l'environnement pour exécuter des tests unitaires et d'intégration, en augmentant la mémoire disponible pour les tests.

```dockerfile
# Tests
FROM node:21.1-bullseye AS test

WORKDIR /app

# Configuration de l'environnement
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV="test"

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    procps \
    libcurl4 \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Node.js
COPY package*.json ./
RUN npm ci

COPY . .

# Commande par défaut pour les tests
CMD ["npm", "run", "test"]
```

**Explication** :

- `ENV NODE_ENV="test"` : Définit l'environnement de test.
- Installation de dépendances supplémentaires pour gérer des outils comme `g++` ou `python3`, nécessaires à certaines dépendances de test.
- La commande `npm run test` permet de lancer les tests dans cet environnement.

#### Frontend Dockerfile (test)

Le Dockerfile pour les tests frontend est similaire, mais il utilise une image basée sur `bullseye` pour assurer la compatibilité avec les outils nécessaires aux tests.

```dockerfile
# Tests
FROM node:21.1-bullseye AS test

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "test"]
```

**Explication** :

- Ce Dockerfile est optimisé pour exécuter les tests frontend dans un environnement contrôlé et dédié.

---

## **3. Pipeline CI/CD**

### **Description des étapes du pipeline**

Voici un exemple de pipeline CI/CD basé sur GitLab, qui inclut plusieurs étapes pour construire, tester et déployer l'application dans des environnements de développement et de production.

1. **Trigger** : Le pipeline est déclenché automatiquement sur une branche spécifique, ici `dockerization`, pour intégrer et déployer les applications backend et frontend.

2. **Build** :

   - **Backend** : La première étape construit les images Docker pour le backend (dev et prod) via `docker-compose build`.
   - **Frontend** : De même, cette étape construit les images Docker pour le frontend (dev et prod).

3. **Test** :

   - **Backend** : Après avoir démarré l'environnement de test du backend avec `docker-compose up -d backend-test`, les tests sont exécutés dans le conteneur de test du backend avec la commande `docker exec container_back_test npm run test`.
   - **Frontend** : Pour le frontend, les tests sont lancés dans le conteneur de test du frontend avec `docker exec container_front_test npm run test`.

4. **Deploy** :
   - **Déploiement en développement** : Déploie le backend et le frontend dans l'environnement de développement via `docker-compose up -d backend-dev frontend-dev`.
   - **Déploiement en production** : Déploie le backend et le frontend dans l'environnement de production via `docker-compose up -d backend-prod frontend-prod`.

### **Exemple de fichier `.gitlab-ci.yml`**

```yaml
variables:
  DOCKER_TLS_CERTDIR: ""

image: docker:latest

before_script:
  - docker info
  - until docker info; do sleep 1; done
  - apk add --no-cache docker-compose

stages:
  - build
  - test
  - deploy

build_backend:
  stage: build
  variables:
    MONGODB_URI: "mongodb+srv://dbUser:dbUserPassword@cluster0.sm8lc.mongodb.net/TDEV700"
  script:
    - docker-compose build backend-dev backend-prod
  only:
    - dockerization

build_frontend:
  stage: build
  variables:
    MONGODB_URI: "mongodb+srv://dbUser:dbUserPassword@cluster0.sm8lc.mongodb.net/TDEV700"
  script:
    - docker-compose build frontend-dev frontend-prod
  only:
    - dockerization

test_backend:
  stage: test
  variables:
    MONGODB_URI: "mongodb+srv://dbUser:dbUserPassword@cluster0.sm8lc.mongodb.net/TDEV700"
  script:
    - docker-compose up -d backend-test
    - docker exec container_back_test npm run test --maxWorkers=4 --forceExit --detectOpenHandles --testTimeout=1200000
    - sleep 10
    - docker-compose down
  only:
    - dockerization

test_frontend:
  stage: test
  variables:
    MONGODB_URI: "mongodb+srv://dbUser:dbUserPassword@cluster0.sm8lc.mongodb.net/TDEV700"
  script:
    - docker-compose up -d frontend-test
    - docker exec container_front_test npm run test --maxWorkers=4 --forceExit --detectOpenHandles
    - docker-compose down
  only:
    - dockerization

deploy_dev:
  stage: deploy
  script:
    - docker-compose up -d backend-dev frontend-dev
  environment:
    name: development
  only:
    - dockerization

deploy_prod:
  stage: deploy
  script:
    - docker-compose up -d backend-prod frontend-prod
  environment:
    name: production
  only:
    - dockerization
```

### **Explication des étapes**

- **before_script** :

  - Cette section initialise Docker et Docker Compose, et vérifie que le daemon Docker est prêt à accepter des commandes.
  - `apk add --no-cache docker-compose` installe Docker Compose, si nécessaire.

- **Variables** :

  - `MONGODB_URI` : Cette variable est utilisée pour connecter l'application à une base de données MongoDB dans les différentes étapes du pipeline (build, test, etc.).

- **Étape Build** :

  - **build_backend** : Cette étape construit les images Docker pour le backend avec `docker-compose build backend-dev backend-prod`. Elle prépare le backend pour les environnements de développement et de production.
  - **build_frontend** : De même, cette étape construit les images Docker pour le frontend avec `docker-compose build frontend-dev frontend-prod`.

- **Étape Test** :
  - **test_backend** : Cette étape exécute les tests unitaires du backend. Le conteneur de test est démarré avec `docker-compose up -d backend-test`, et les tests sont ensuite lancés dans ce conteneur avec `docker exec container_back_test npm run test`.
  - **test_frontend** : Pour le frontend,

les tests sont exécutés de la même manière, mais dans le conteneur frontend avec `docker exec container_front_test npm run test`.

- **Étape Deploy** :
  - **deploy_dev** : Déploie le backend et le frontend dans l'environnement de développement avec `docker-compose up -d backend-dev frontend-dev`.
  - **deploy_prod** : Déploie le backend et le frontend dans l'environnement de production avec `docker-compose up -d backend-prod frontend-prod`.

### **Notes supplémentaires**

- **Environnements** :
  - Les étapes de déploiement utilisent les variables d'environnement pour spécifier les environnements cibles (`development`, `production`).
- **only** :
  - Les étapes ne seront exécutées que sur la branche `dockerization`, ce qui permet de limiter l'exécution du pipeline à des modifications pertinentes.

---

## **4. Instructions pour installer et configurer les GitLab Runners**

### **Étape 1 : Préparer l'environnement**

Assurez-vous d'avoir une machine ou une VM prête, avec Docker installé.

### **Étape 2 : Installer GitLab Runner**

Installez le runner sur votre machine :

```bash
# Téléchargez le binaire GitLab Runner
curl -L --output /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64
chmod +x /usr/local/bin/gitlab-runner

# Créez un utilisateur pour GitLab Runner
useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash
```

### **Étape 3 : Enregistrer le Runner**

1. Récupérez votre **token** d'enregistrement depuis GitLab dans **Settings > CI/CD > Runners**.
2. Enregistrez le Runner en exécutant :
   ```bash
   gitlab-runner register
   ```
   Suivez les invites pour connecter votre runner à votre projet GitLab.

### **Étape 4 : Tester le Runner**

1. Créez une pipeline simple et assurez-vous que le runner est opérationnel.
2. Vérifiez que les tâches de build, test et déploiement sont exécutées comme prévu.

---

## **Conclusion**

Cette documentation couvre l'architecture du projet TRINITY et décrit les pratiques DevOps mises en place, de l'automatisation des builds aux déploiements. Assurez-vous d'adapter les configurations et d'ajouter les informations spécifiques de votre projet pour garantir une documentation complète et opérationnelle.

---
