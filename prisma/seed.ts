import 'dotenv/config';
import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';



async function main() {
  console.log('🌱 Début du seeding...');

  // Supprimer les anciennes données (optionnel)
  await prisma.orderItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.category.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('📝 Création des utilisateurs...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@adledelice.com',
      password: hashedPassword,
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+33612345678',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@adledelice.com',
      password: hashedPassword,
      name: 'Manager User',
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
      phone: '+33612345679',
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: 'employee@adledelice.com',
      password: hashedPassword,
      name: 'Employee User',
      firstName: 'Employee',
      lastName: 'User',
      role: 'EMPLOYEE',
      phone: '+33612345680',
    },
  });

  console.log('🍴 Création des catégories...');
  const starters = await prisma.category.create({
    data: { name: 'Entrées', description: 'Nos délicieuses entrées', order: 1 },
  });

  const mains = await prisma.category.create({
    data: { name: 'Plats Principaux', description: 'Nos plats phares', order: 2 },
  });

  const desserts = await prisma.category.create({
    data: { name: 'Desserts', description: 'Nos douceurs sucrées', order: 3 },
  });

  const drinks = await prisma.category.create({
    data: { name: 'Boissons', description: 'Nos boissons fraîches', order: 4 },
  });

  console.log('🍝 Création des plats...');
  const salad = await prisma.dish.create({
    data: {
      name: 'Salade César',
      description: 'Salade verte avec poulet grillé et parmesan',
      price: 12.99,
      categoryId: starters.id,
      images: ['https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800'],
      isAvailable: true,
      preparationTime: 15,
      allergens: ['lait', 'oeuf'],
      isPromoted: true,
      isNew: false,
    },
  });

  const soup = await prisma.dish.create({
    data: {
      name: 'Soupe à l\'oignon',
      description: 'Soupe gratinée au fromage',
      price: 9.99,
      categoryId: starters.id,
      images: ['https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800'],
      isAvailable: true,
      preparationTime: 20,
      allergens: ['lait'],
      isPromoted: false,
      isNew: true,
    },
  });

  const steak = await prisma.dish.create({
    data: {
      name: 'Steak Frites',
      description: 'Steak de boeuf avec frites maison',
      price: 24.99,
      categoryId: mains.id,
      images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'],
      isAvailable: true,
      preparationTime: 25,
      allergens: [],
      isPromoted: false,
      isNew: false,
    },
  });

  const pasta = await prisma.dish.create({
    data: {
      name: 'Pâtes Carbonara',
      description: 'Pâtes avec crème, lardons et parmesan',
      price: 18.99,
      categoryId: mains.id,
      images: ['https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800'],
      isAvailable: true,
      preparationTime: 20,
      allergens: ['lait', 'oeuf'],
      isPromoted: true,
      isNew: false,
    },
  });

  const tiramisu = await prisma.dish.create({
    data: {
      name: 'Tiramisu',
      description: 'Tiramisu italien aux café',
      price: 8.99,
      categoryId: desserts.id,
      images: ['https://images.unsplash.com/photo-1571877227200-a0d1e3305643?w=800'],
      isAvailable: true,
      preparationTime: 10,
      allergens: ['lait', 'oeuf'],
      isPromoted: false,
      isNew: true,
    },
  });

  const cremeBrulee = await prisma.dish.create({
    data: {
      name: 'Crème Brûlée',
      description: 'Crème vanillée avec sucre caramélisé',
      price: 7.99,
      categoryId: desserts.id,
      images: ['https://images.unsplash.com/photo-1587440871875-191322e47ae3?w=800'],
      isAvailable: true,
      preparationTime: 10,
      allergens: ['lait', 'oeuf'],
      isPromoted: false,
      isNew: false,
    },
  });

  const water = await prisma.dish.create({
    data: {
      name: 'Eau Plate',
      description: 'Bouteille d\'eau 50cl',
      price: 2.99,
      categoryId: drinks.id,
      images: [],
      isAvailable: true,
      allergens: [],
      isPromoted: false,
      isNew: false,
    },
  });

  const coke = await prisma.dish.create({
    data: {
      name: 'Coca-Cola',
      description: 'Canette 33cl',
      price: 3.99,
      categoryId: drinks.id,
      images: [],
      isAvailable: true,
      allergens: [],
      isPromoted: false,
      isNew: false,
    },
  });

  console.log('📋 Création des menus...');
  const dailyMenu = await prisma.menu.create({
    data: {
      name: 'Menu du Jour',
      description: 'Notre sélection du jour',
      type: 'DAILY',
      date: new Date(),
      isActive: true,
      menuItems: {
        create: [
          { dishId: salad.id, price: 10.99, quantity: 1 },
          { dishId: steak.id, price: 22.99, quantity: 1 },
          { dishId: tiramisu.id, price: 7.99, quantity: 1 },
        ],
      },
    },
  });

  const specialMenu = await prisma.menu.create({
    data: {
      name: 'Menu Spécial Saint-Valentin',
      description: 'Menu romantique pour deux',
      type: 'SPECIAL',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-28'),
      isActive: true,
      menuItems: {
        create: [
          { dishId: soup.id, price: 8.99, quantity: 2 },
          { dishId: pasta.id, price: 16.99, quantity: 2 },
          { dishId: cremeBrulee.id, price: 6.99, quantity: 2 },
        ],
      },
    },
  });

  console.log('🎉 Création des promotions...');
  const promo = await prisma.promotion.create({
    data: {
      name: 'Happy Hour',
      description: '20% de réduction sur les boissons de 17h à 19h',
      percentage: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      dishId: coke.id,
    },
  });

  console.log('📸 Création de la galerie...');
  await prisma.galleryItem.createMany({
    data: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        title: 'Notre salle de restaurant',
        category: 'interieur',
        order: 1,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        title: 'Notre cuisine',
        category: 'cuisine',
        order: 2,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        title: 'Notre terrasse',
        category: 'exterieur',
        order: 3,
      },
    ],
  });

  console.log('📰 Création des articles de blog...');
  await prisma.blogPost.createMany({
    data: [
      {
        title: 'Notre nouvelle carte d\'été',
        content: 'Découvrez nos nouveaux plats pour l\'été : salades fraîches, desserts glacés et boissons pétillantes !',
        isPublished: true,
      },
      {
        title: 'Fermeture exceptionnelle le 15 août',
        content: 'Nous serons fermés le 15 août pour le jour de l\'Assomption. Merci de votre compréhension.',
        isPublished: true,
      },
    ],
  });

  console.log('✨ Création du contenu du site...');
  await prisma.siteContent.createMany({
    data: [
      { key: 'home_title', value: 'Bienvenue chez Adèle Délice' },
      { key: 'home_subtitle', value: 'Restaurant gastronomique à Paris' },
      { key: 'contact_phone', value: '+33 1 23 45 67 89' },
      { key: 'contact_email', value: 'contact@adledelice.com' },
      { key: 'contact_address', value: '12 Rue des Gourmets, 75001 Paris' },
    ],
  });

  console.log('✅ Seeding terminé !');
  console.log('🔑 Identifiants de test :');
  console.log('   Admin: admin@adledelice.com / password123');
  console.log('   Manager: manager@adledelice.com / password123');
  console.log('   Employee: employee@adledelice.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
