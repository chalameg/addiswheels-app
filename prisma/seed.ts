import { PrismaClient, VehicleType, VehicleStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user first
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@addiswheels.com',
      phone: '+251900000000',
      whatsapp: '+251900000000',
      password: adminPassword,
      role: 'admin',
      blocked: false
    }
  });

  // Create users with contact information
  const users = [
    { name: 'Abebe Kebede', email: 'abebe.kebede@email.com', phone: '+251911234567', whatsapp: '+251911234567' },
    { name: 'Tigist Haile', email: 'tigist.haile@email.com', phone: '+251922345678', whatsapp: '+251922345678' },
    { name: 'Dawit Mengistu', email: 'dawit.mengistu@email.com', phone: '+251933456789', whatsapp: '+251933456789' },
    { name: 'Yohannes Tadesse', email: 'yohannes.tadesse@email.com', phone: '+251944567890', whatsapp: '+251944567890' },
    { name: 'Martha Assefa', email: 'martha.assefa@email.com', phone: '+251955678901', whatsapp: '+251955678901' },
    { name: 'Solomon Bekele', email: 'solomon.bekele@email.com', phone: '+251966789012', whatsapp: '+251966789012' },
    { name: 'Bethel Tekle', email: 'bethel.tekle@email.com', phone: '+251977890123', whatsapp: '+251977890123' },
    { name: 'Daniel Worku', email: 'daniel.worku@email.com', phone: '+251988901234', whatsapp: '+251988901234' },
    { name: 'Rahel Girma', email: 'rahel.girma@email.com', phone: '+251999012345', whatsapp: '+251999012345' },
    { name: 'Elias Desta', email: 'elias.desta@email.com', phone: '+251900123456', whatsapp: '+251900123456' },
    { name: 'Kebede Alemu', email: 'kebede.alemu@email.com', phone: '+251911111111', whatsapp: '+251911111111' },
    { name: 'Alemayehu Tesfaye', email: 'alemayehu.tesfaye@email.com', phone: '+251922222222', whatsapp: '+251922222222' },
    { name: 'Tadesse Mamo', email: 'tadesse.mamo@email.com', phone: '+251933333333', whatsapp: '+251933333333' },
    { name: 'Mulugeta Haile', email: 'mulugeta.haile@email.com', phone: '+251944444444', whatsapp: '+251944444444' },
    { name: 'Bekele Negussie', email: 'bekele.negussie@email.com', phone: '+251955555555', whatsapp: '+251955555555' },
  ];

  // Create users with hashed passwords
  const createdUsers = [];
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: 'user'
      }
    });
    createdUsers.push(user);
  }

  // Demo cars with ownerId references
  const cars = [
    { brand: 'Toyota', model: 'Corolla', year: 2020, pricePerDay: 40, images: ['https://images.unsplash.com/photo-1511918984145-48de785d4c4e'], type: VehicleType.CAR, ownerId: createdUsers[0].id, status: VehicleStatus.APPROVED },
    { brand: 'Honda', model: 'Civic', year: 2019, pricePerDay: 38, images: ['https://images.unsplash.com/photo-1503736334956-4c8f8e92946d'], type: VehicleType.CAR, ownerId: createdUsers[1].id, status: VehicleStatus.APPROVED },
    { brand: 'Ford', model: 'Focus', year: 2021, pricePerDay: 42, images: ['https://images.unsplash.com/photo-1461632830798-3adb3034e4c8'], type: VehicleType.CAR, ownerId: createdUsers[2].id, status: VehicleStatus.APPROVED },
    { brand: 'Chevrolet', model: 'Malibu', year: 2018, pricePerDay: 35, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8'], type: VehicleType.CAR, ownerId: createdUsers[3].id, status: VehicleStatus.APPROVED },
    { brand: 'BMW', model: '3 Series', year: 2022, pricePerDay: 70, images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a'], type: VehicleType.CAR, ownerId: createdUsers[4].id, status: VehicleStatus.APPROVED },
    { brand: 'Mercedes', model: 'C-Class', year: 2021, pricePerDay: 75, images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308'], type: VehicleType.CAR, ownerId: createdUsers[5].id, status: VehicleStatus.APPROVED },
    { brand: 'Audi', model: 'A4', year: 2020, pricePerDay: 68, images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9'], type: VehicleType.CAR, ownerId: createdUsers[6].id, status: VehicleStatus.APPROVED },
    { brand: 'Hyundai', model: 'Elantra', year: 2019, pricePerDay: 36, images: ['https://images.unsplash.com/photo-1465101046530-73398c7f28ca'], type: VehicleType.CAR, ownerId: createdUsers[7].id, status: VehicleStatus.APPROVED },
    { brand: 'Kia', model: 'Optima', year: 2018, pricePerDay: 34, images: ['https://images.unsplash.com/photo-1470770841072-f978cf4d019e'], type: VehicleType.CAR, ownerId: createdUsers[8].id, status: VehicleStatus.APPROVED },
    { brand: 'Volkswagen', model: 'Jetta', year: 2021, pricePerDay: 41, images: ['https://images.unsplash.com/photo-1462392246754-28dfa2df8e6b'], type: VehicleType.CAR, ownerId: createdUsers[9].id, status: VehicleStatus.APPROVED },
  ];

  // Demo motorbikes with ownerId references
  const bikes = [
    { brand: 'Yamaha', model: 'MT-07', year: 2021, pricePerDay: 30, images: ['https://images.unsplash.com/photo-1518655048521-f130df041f66'], type: VehicleType.MOTORBIKE, ownerId: createdUsers[10].id, status: VehicleStatus.APPROVED },
    { brand: 'Honda', model: 'CBR500R', year: 2020, pricePerDay: 32, images: ['https://images.unsplash.com/photo-1503736317-1c1b7b8e6b8e'], type: VehicleType.MOTORBIKE, ownerId: createdUsers[11].id, status: VehicleStatus.APPROVED },
    { brand: 'Kawasaki', model: 'Ninja 400', year: 2019, pricePerDay: 28, images: ['https://images.unsplash.com/photo-1511918984145-48de785d4c4e'], type: VehicleType.MOTORBIKE, ownerId: createdUsers[12].id, status: VehicleStatus.APPROVED },
    { brand: 'Suzuki', model: 'GSX250R', year: 2018, pricePerDay: 25, images: ['https://images.unsplash.com/photo-1465101178521-c1a9136a3b99'], type: VehicleType.MOTORBIKE, ownerId: createdUsers[13].id, status: VehicleStatus.APPROVED },
    { brand: 'Ducati', model: 'Monster 797', year: 2022, pricePerDay: 40, images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308'], type: VehicleType.MOTORBIKE, ownerId: createdUsers[14].id, status: VehicleStatus.APPROVED },
  ];

  await prisma.vehicle.createMany({ data: [...cars, ...bikes] });

  // Create a test user
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 