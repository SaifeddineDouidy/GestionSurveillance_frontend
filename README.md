# Système de Gestion de Surveillance

Un système complet de gestion de surveillance des examens universitaires développé avec Next.js, Spring Boot et MySQL.

## 🔍 Fonctionnalités Principales

- 🔐 Authentification & Gestion de mot de passe
- 📊 Gestion des Sessions Académiques
- 📈 Tableau de bord interactif 
- 🏛️ Gestion des Locaux (Salles/Amphis)
- 👨‍🏫 Administration des Départements & Professeurs
- 📚 Gestion des Filières & Modules
- 📝 Organisation des Examens
- 👥 Planification des Surveillances

## ⚙️ Stack Technique

- 🖥️ Frontend : Next.js 15 (TypeScript)
- 🔧 Backend : Spring Boot 3.x
- 🗄️ Base de données : MySQL 8.x
- 🔑 Sécurité : JWT

## 📋 Prérequis 

- 📦 Node.js (v22.x+)
- ☕ Java JDK 17+
- 🗃️ MySQL 8.x
- 🛠️ Maven
- 📂 Git

## 🚀 Installation

### 1️⃣ Base de Données

```bash
# Créer la base de données
mysql -u root -p -e "CREATE DATABASE gestion_surveillence"

# Importer les données
mysql -u root -p surveillance_db < gestion_surveillence.sql
```

### 2️⃣ Backend

```bash
# Cloner le projet
git clone https://github.com/SaifeddineDouidy/GestionSurveillance_backend.git

cd GestionSurveillance_backend

# Configuration BDD dans src/main/resources/application.properties

# Lancer le serveur
mvn clean install && mvn spring-boot:run
```

### 3️⃣ Frontend

```bash
cd GestionSurveillance_frontend
npm install
npm run dev
```

## 💻 Utilisation

1. 🌐 Accès : `http://localhost:3000`
2. 🔐 Connexion avec vos identifiants
3. 📱 Navigation :
   - 📊 Tableau de bord
   - 📝 Gestion des examens
   - 👥 Attribution des surveillances
   - ⚙️ Paramètres

## 🏗️ Architecture

### Backend

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com.example.demo/
│   │   │       ├── authentication/   # 🔐 Gestion Auth
│   │   │       ├── controller/       # 🎮 Controllers
│   │   │       ├── dto/             # 📦 Data Transfer
│   │   │       ├── exception/        # ⚠️ Exceptions
│   │   │       ├── model/           # 💾 Entités
│   │   │       ├── repository/       # 🗄️ Accès Data
│   │   │       ├── security/         # 🛡️ Sécurité
│   │   │       ├── service/         # 🔧 Services
│   │   │       ├── utils/           # 🛠️ Utilitaires
│   │   │       └── DemoApplication.java
│   │   └── resources/
│   │       └── application.properties
...
```

### Frontend

```
frontend/
├── src/
│   ├── app/            # 📱 Pages
│   ├── components/     # 🧩 Composants
│   └── lib/           # 🛠️ Utilitaires
...
```

## 📚 API Documentation

Swagger UI: `http://localhost:8088/swagger-ui.html`

## ⚙️ Configuration

### Backend (`application.properties`)

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/surveillance_db
spring.datasource.username=surveillance_user
spring.datasource.password=votre_mot_de_passe
```

## 🤝 Support

📧 Email : [votre-email]
🐛 Issues : Via GitHub

```
