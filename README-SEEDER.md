# Database Seeder - Données Ivoiriennes

Ce système de seeder permet de peupler automatiquement la base de données avec des données de test adaptées au marché ivoirien.

## Utilisation

### 1. Pré-requis
- Base de données MySQL créée (`facturation_db`)
- Application configurée avec les bonnes variables d'environnement

### 2. Lancer le seeder
```bash
npm run seed
```

## Données générées

### 👥 Users (5 utilisateurs)
- **admin@facturation.ci** / admin123
- **kouame.yao@entreprise.ci** / password123
- **adjoua.koffi@business.ci** / password123
- **mamadou.traore@company.ci** / password123
- **akissi.brou@consulting.ci** / password123

### 🏢 Customers (10 grandes entreprises ivoiriennes)
- **ORANGE CÔTE D'IVOIRE** - Télécommunications
- **BANK OF AFRICA** - Services bancaires
- **TRACTAFRIC MOTORS** - Automobile et équipements
- **NESTLE CÔTE D'IVOIRE** - Agroalimentaire
- **SINFRA** - Infrastructure
- **ECOBANK CÔTE D'IVOIRE** - Services bancaires
- **SOLIBRA** - Brasserie
- **CIE** - Compagnie Ivoirienne d'Electricité
- **IVOIRE COTON** - Textile et coton
- **BOLLORE TRANSPORT & LOGISTICS** - Transport et logistique

### 📦 Products (18 services IT - Prix en FCFA)
- **Développement Site Web** (1 500 000 FCFA)
- **Application Mobile** (5 000 000 FCFA)
- **Consultation IT** (300 000 FCFA/jour)
- **Formation Informatique** (500 000 FCFA/jour)
- **Maintenance Site Web** (100 000 FCFA/mois)
- **Hébergement Web** (15 000 FCFA/mois)
- **Design Graphique** (750 000 FCFA)
- **Rédaction de Contenu** (60 000 FCFA/page)
- **Audit Numérique** (400 000 FCFA)
- **Intégration API** (900 000 FCFA)
- **Base de Données** (500 000 FCFA/jour)
- **Tests & Qualité** (600 000 FCFA)
- **Déploiement & DevOps** (750 000 FCFA)
- **Support Technique** (50 000 FCFA/heure)
- **Migration de Données** (1 200 000 FCFA)
- **Sécurité Informatique** (800 000 FCFA)
- **E-commerce** (2 500 000 FCFA)
- **Marketing Digital** (400 000 FCFA/campagne)

## Structure des seeders

```
src/database/
├── seeds/
│   ├── user.seeder.ts        # Seeder pour les utilisateurs
│   ├── customer.seeder.ts    # Seeder pour les clients
│   ├── product.seeder.ts     # Seeder pour les produits
│   └── database.seeder.ts    # Orchestrateur principal
├── database.module.ts        # Module des seeders
└── seed.command.ts           # Commande d'exécution
```

## Sécurité

- Les mots de passe sont hashés avec bcrypt
- Vérification d'existence avant insertion (pas de doublons)
- Gestion des erreurs avec rollback automatique

## Contexte Ivoirien

### Spécificités locales intégrées :
- **TVA à 18%** (taux ivoirien)
- **Prix en FCFA** (monnaie locale)
- **Numéros de téléphone** au format ivoirien (+225)
- **Adresses réelles** d'Abidjan et communes
- **Entreprises connues** du marché ivoirien
- **Noms ivoiriens** (Kouamé, Adjoua, Mamadou, Akissi)
- **Extensions .ci** pour les emails
- **Numéros SIRET/TVA** au format ivoirien

### Services adaptés au marché :
- E-commerce avec paiement mobile
- Formation en outils numériques
- Marketing digital local
- Support technique francophone

## Personnalisation

Pour ajouter ou modifier des données, éditez les fichiers dans `src/database/seeds/`.

Chaque seeder vérifie si les données existent déjà pour éviter les doublons.