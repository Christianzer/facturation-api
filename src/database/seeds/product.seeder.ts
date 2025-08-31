import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';

@Injectable()
export class ProductSeeder {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async seed(): Promise<void> {
    const products = [
      {
        name: 'Développement Site Web',
        description: 'Création de site web responsive avec HTML, CSS, JavaScript',
        price: 1500000, // 1.5M FCFA
        vatRate: 18.00,
        unit: 'projet',
        isActive: true,
      },
      {
        name: 'Application Mobile',
        description: 'Développement d\'application mobile native iOS/Android',
        price: 5000000, // 5M FCFA
        vatRate: 18.00,
        unit: 'projet',
        isActive: true,
      },
      {
        name: 'Consultation IT',
        description: 'Conseil en architecture système et technologies',
        price: 300000, // 300k FCFA
        vatRate: 18.00,
        unit: 'jour',
        isActive: true,
      },
      {
        name: 'Formation Informatique',
        description: 'Formation en développement et outils numériques',
        price: 500000, // 500k FCFA
        vatRate: 18.00,
        unit: 'jour',
        isActive: true,
      },
      {
        name: 'Maintenance Site Web',
        description: 'Maintenance mensuelle et mises à jour de sécurité',
        price: 100000, // 100k FCFA
        vatRate: 18.00,
        unit: 'mois',
        isActive: true,
      },
      {
        name: 'Hébergement Web',
        description: 'Hébergement web avec certificat SSL et sauvegarde',
        price: 15000, // 15k FCFA
        vatRate: 18.00,
        unit: 'mois',
        isActive: true,
      },
      {
        name: 'Design Graphique',
        description: 'Création de logo, charte graphique et supports visuels',
        price: 750000, // 750k FCFA
        vatRate: 18.00,
        unit: 'projet',
        isActive: true,
      },
      {
        name: 'Rédaction de Contenu',
        description: 'Rédaction de contenu optimisé SEO en français',
        price: 60000, // 60k FCFA
        vatRate: 18.00,
        unit: 'page',
        isActive: true,
      },
      {
        name: 'Audit Numérique',
        description: 'Analyse complète de la présence digitale et recommandations',
        price: 400000, // 400k FCFA
        vatRate: 18.00,
        unit: 'audit',
        isActive: true,
      },
      {
        name: 'Intégration API',
        description: 'Intégration d\'API tierces et développement d\'endpoints',
        price: 900000, // 900k FCFA
        vatRate: 18.00,
        unit: 'intégration',
        isActive: true,
      },
      {
        name: 'Base de Données',
        description: 'Conception et optimisation de base de données',
        price: 500000, // 500k FCFA
        vatRate: 18.00,
        unit: 'jour',
        isActive: true,
      },
      {
        name: 'Tests & Qualité',
        description: 'Mise en place de tests automatisés et contrôle qualité',
        price: 600000, // 600k FCFA
        vatRate: 18.00,
        unit: 'projet',
        isActive: true,
      },
      {
        name: 'Déploiement & DevOps',
        description: 'Configuration serveur, CI/CD et automatisation',
        price: 750000, // 750k FCFA
        vatRate: 18.00,
        unit: 'setup',
        isActive: true,
      },
      {
        name: 'Support Technique',
        description: 'Support technique et résolution d\'incidents',
        price: 50000, // 50k FCFA
        vatRate: 18.00,
        unit: 'heure',
        isActive: true,
      },
      {
        name: 'Migration de Données',
        description: 'Migration et transformation de données entre systèmes',
        price: 1200000, // 1.2M FCFA
        vatRate: 18.00,
        unit: 'migration',
        isActive: true,
      },
      {
        name: 'Sécurité Informatique',
        description: 'Audit de sécurité et mise en place de protection',
        price: 800000, // 800k FCFA
        vatRate: 18.00,
        unit: 'audit',
        isActive: true,
      },
      {
        name: 'E-commerce',
        description: 'Création de boutique en ligne avec paiement mobile',
        price: 2500000, // 2.5M FCFA
        vatRate: 18.00,
        unit: 'projet',
        isActive: true,
      },
      {
        name: 'Marketing Digital',
        description: 'Stratégie et campagnes marketing digital',
        price: 400000, // 400k FCFA
        vatRate: 18.00,
        unit: 'campagne',
        isActive: true,
      },
    ];

    for (const productData of products) {
      const existingProduct = await this.productRepository.findOne({
        where: { name: productData.name },
      });

      if (!existingProduct) {
        const product = this.productRepository.create(productData);
        await this.productRepository.save(product);
        console.log(`✅ Product created: ${productData.name}`);
      } else {
        console.log(`ℹ️  Product already exists: ${productData.name}`);
      }
    }
  }
}