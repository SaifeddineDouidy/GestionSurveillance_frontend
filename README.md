# Système de Gestion de Surveillance

Un système de gestion de surveillance complet construit avec Next.js, Spring Boot et MySQL.

## Aperçu

Système web moderne pour la gestion de surveillance incluant :

- Authentification (Réinitialisation du mot de passe)
- Gestion des Sessions
- Tableau de bord dynamique
- Gestion des Locaux (Salle ou Amphi), des Département (Professeurs), des Options (Modules)
- Gestion des Exams
- Gestion de la Surveillance

## Technologies

- Frontend : Next.js 15 avec TypeScript
- Backend : Spring Boot 3.x
- Base de données : MySQL 8.x
- Authentification : JWT

## Prérequis

À installer avant de commencer :
- Node.js (version 22.x ou supérieure)
- Java JDK 17 ou supérieur
- MySQL 8.x
- Maven
- Git

## Installation

### 1. Configuration Base de Données

Option 1 : Télécharger et importer le fichier SQL
```bash
# Créer la base de données
mysql -u root -p -e "CREATE DATABASE gestion_surveillence"

# Importer le fichier SQL
mysql -u root -p surveillance_db < gestion_surveillence.sql
```


### 2. Configuration Backend
```bash
# Cloner le dépôt
git clone [<url-de-votre-depot>](https://github.com/SaifeddineDouidy/GestionSurveillance_frontend.git)

# Aller dans le répertoire backend
cd GestionSurveillance_frontend

# Configurer la connexion à la base de données
# Modifier src/main/resources/application.properties

# Construire et lancer l'application Spring Boot
mvn clean install
mvn spring-boot:run
```

### 3. Configuration Frontend
```bash
# Aller dans le répertoire frontend
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Lancer le serveur de développement
npm run dev
```

## Utilisation

1. Accéder à l'application : `http://localhost:3000`
2. Se connecter avec vos identifiants
3. Navigation dans le tableau de bord :
   - Surveillance en direct
   - Gestion des alertes
   - Génération de rapports
   - Configuration système

## Développement

### Structure Backend
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/surveillance/
│   │   │       ├── controllers/
│   │   │       ├── models/
│   │   │       ├── repositories/
│   │   │       └── services/
│   │   └── resources/
│   │       └── application.properties
└── pom.xml
```

### Structure Frontend
```
frontend/
├── app/
├── components/
├── lib/
├── public/
└── package.json
```

## Documentation API

Documentation API disponible sur `http://localhost:8080/swagger-ui.html` en mode développement.

## Variables d'Environnement

### Backend
Dans `application.properties` :
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/surveillance_db
spring.datasource.username=surveillance_user
spring.datasource.password=votre_mot_de_passe
```

### Frontend
Dans `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Déploiement Production

1. Build frontend :
```bash
npm run build
```

2. Build backend :
```bash
mvn clean package
```

3. Déployer le fichier JAR généré et le build frontend sur votre serveur de production

## Contribution

1. Forker le dépôt
2. Créer une branche : `git checkout -b feature/ma-nouvelle-fonctionnalite`
3. Commiter les changements : `git commit -am 'Ajout d'une fonctionnalité'`
4. Pousser la branche : `git push origin feature/ma-nouvelle-fonctionnalite`
5. Créer une Pull Request

## Licence

[Votre licence choisie]

## Support

Pour le support, envoyez un email à [votre-email] ou ouvrez une issue dans le dépôt.
