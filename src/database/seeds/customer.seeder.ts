import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';

@Injectable()
export class CustomerSeeder {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async seed(): Promise<void> {
    const customers = [
      {
        name: 'ORANGE CÔTE D\'IVOIRE',
        email: 'contact@orange.ci',
        phone: '+225 07 08 09 10 11',
        address: 'Immeuble Postel 2001, Boulevard Valery Giscard d\'Estaing',
        city: 'Abidjan',
        postalCode: '01 BP 1641',
        country: 'Côte d\'Ivoire',
        siret: 'CI-ABJ-2023-B-12345',
        vatNumber: 'CI000123456789',
        isActive: true,
      },
      {
        name: 'BANK OF AFRICA',
        email: 'info@boa.ci',
        phone: '+225 27 20 33 50 00',
        address: 'Avenue Abdoulaye Fadiga, Plateau',
        city: 'Abidjan',
        postalCode: '01 BP 4052',
        country: 'Côte d\'Ivoire',
        siret: 'CI-ABJ-2023-B-23456',
        vatNumber: 'CI000234567890',
        isActive: true,
      },
      {
        name: 'TRACTAFRIC MOTORS',
        email: 'contact@tractafric.ci',
        phone: '+225 27 21 75 86 00',
        address: 'Boulevard VGE, Zone 4C',
        city: 'Abidjan',
        postalCode: '17 BP 797',
        country: 'Côte d\'Ivoire',
        siret: 'CI-ABJ-2023-B-34567',
        vatNumber: 'CI000345678901',
        isActive: true,
      },
      {
        name: 'NESTLE CÔTE D\'IVOIRE',
        email: 'service.client@nestle.ci',
        phone: '+225 27 21 58 95 00',
        address: 'Km 4, Boulevard de Vridi',
        city: 'Abidjan',
        postalCode: '01 BP 1554',
        country: 'Côte d\'Ivoire',
        siret: 'CI-ABJ-2023-B-45678',
        vatNumber: 'CI000456789012',
        isActive: true,
      },
      {
        name: 'SINFRA',
        email: 'info@sinfra.ci',
        phone: '+225 27 20 21 85 60',
        address: 'Boulevard Carde, Plateau',
        city: 'Abidjan',
        postalCode: '01 BP 3393',
        country: 'Côte d\'Ivoire',
        siret: 'CI-ABJ-2023-B-56789',
        vatNumber: 'CI000567890123',
        isActive: true,
      },
      {
        name: 'ECOBANK CÔTE D\'IVOIRE',
        email: 'contact@ecobank.ci',
        phone: '+225 27 20 20 14 00',
        address: '1 Avenue Abdoulaye Fadiga',
        city: 'Abidjan',
        postalCode: '01 BP 4107',
        country: 'Côte d\'Ivoire',
        siret: 'CI-ABJ-2023-B-67890',
        vatNumber: 'CI000678901234',
        isActive: true,
      },
      {
        name: 'SOLIBRA',
        email: 'commercial@solibra.ci',
        phone: '+225 27 23 46 14 00',
        address: 'Zone Industrielle de Yopougon',
        city: 'Abidjan',
        postalCode: '01 BP 1200',
        country: 'Côte d\'Ivoire',
        siret: 'CI-ABJ-2023-B-78901',
        vatNumber: 'CI000789012345',
        isActive: true,
      },
      {
        name: 'CIE (Compagnie Ivoirienne d\'Electricité)',
        email: 'clientele@cie.ci',
        phone: '+225 27 21 23 30 00',
        address: 'Avenue Christiani, Treichville',
        city: 'Abidjan',
        postalCode: '01 BP 6923',
        country: 'Côte d\'Ivoire',
        siret: 'CI-ABJ-2023-B-89012',
        vatNumber: 'CI000890123456',
        isActive: true,
      },
      {
        name: 'IVOIRE COTON',
        email: 'direction@ivoirecoton.ci',
        phone: '+225 27 20 31 67 00',
        address: 'Rue des Jardins, Plateau',
        city: 'Abidjan',
        postalCode: '01 BP 622',
        country: 'Côte d\'Ivoire',
        siret: 'CI-ABJ-2023-B-90123',
        vatNumber: 'CI000901234567',
        isActive: true,
      },
      {
        name: 'BOLLORE TRANSPORT & LOGISTICS',
        email: 'info@bollore.ci',
        phone: '+225 27 21 23 80 00',
        address: 'Boulevard de Vridi, Zone Portuaire',
        city: 'Abidjan',
        postalCode: '01 BP 1905',
        country: 'Côte d\'Ivoire',
        siret: 'CI-ABJ-2023-B-01234',
        vatNumber: 'CI001012345678',
        isActive: true,
      },
    ];

    for (const customerData of customers) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: customerData.email },
      });

      if (!existingCustomer) {
        const customer = this.customerRepository.create(customerData);
        await this.customerRepository.save(customer);
        console.log(`✅ Customer created: ${customerData.name}`);
      } else {
        console.log(`ℹ️  Customer already exists: ${customerData.name}`);
      }
    }
  }
}