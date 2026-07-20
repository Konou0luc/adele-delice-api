import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev 
    ? 'http://localhost:3000' 
    : `https://${process.env.VERCEL_URL || 'adele-delice-api.vercel.app'}`;
    
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Adèle Délice',
        version: '1.0.0',
        description: 'API complète pour la gestion du restaurant Adèle Délice : commandes, réservations, menus, plats, utilisateurs, promotions, paiements et plus !',
      },
      servers: [
        {
          url: baseUrl,
          description: isDev ? 'Serveur de développement' : 'Serveur de production',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          Role: {
            type: 'string',
            enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
          },
          OrderStatus: {
            type: 'string',
            enum: ['PENDING', 'PAYMENT_CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'],
          },
          PaymentMethod: {
            type: 'string',
            enum: ['YAS_MONEY', 'MOOV_MONEY'],
          },
          PaymentStatus: {
            type: 'string',
            enum: ['PENDING', 'SUCCESS', 'FAILED'],
          },
          ReservationStatus: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED'],
          },
          MenuType: {
            type: 'string',
            enum: ['DAILY', 'WEEKLY', 'SPECIAL'],
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              password: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              phone: { type: 'string' },
              role: { $ref: '#/components/schemas/Role' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          Category: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              imageUrl: { type: 'string' },
              order: { type: 'number' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          Dish: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number', format: 'decimal' },
              categoryId: { type: 'string' },
              images: { type: 'array', items: { type: 'string' } },
              isAvailable: { type: 'boolean' },
              preparationTime: { type: 'number' },
              spiceLevel: { type: 'number' },
              allergens: { type: 'array', items: { type: 'string' } },
              isPromoted: { type: 'boolean' },
              isNew: { type: 'boolean' },
              orderCount: { type: 'number' },
              qrCodeUrl: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          Menu: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              type: { $ref: '#/components/schemas/MenuType' },
              date: { type: 'string', format: 'date-time' },
              dayOfWeek: { type: 'number' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              imageUrl: { type: 'string' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          MenuItem: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              menuId: { type: 'string' },
              dishId: { type: 'string' },
              price: { type: 'number', format: 'decimal' },
              quantity: { type: 'number' },
            },
          },
          Promotion: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              percentage: { type: 'number', format: 'decimal' },
              fixedAmount: { type: 'number', format: 'decimal' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              isActive: { type: 'boolean' },
              dishId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          Order: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              orderNumber: { type: 'string' },
              customerName: { type: 'string' },
              customerPhone: { type: 'string' },
              deliveryAddress: { type: 'string' },
              comment: { type: 'string' },
              orderType: { type: 'string' },
              totalAmount: { type: 'number', format: 'decimal' },
              status: { $ref: '#/components/schemas/OrderStatus' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          OrderItem: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              orderId: { type: 'string' },
              dishId: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number', format: 'decimal' },
            },
          },
          Payment: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              orderId: { type: 'string' },
              amount: { type: 'number', format: 'decimal' },
              method: { $ref: '#/components/schemas/PaymentMethod' },
              status: { $ref: '#/components/schemas/PaymentStatus' },
              fedaPayReference: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          Reservation: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              customerName: { type: 'string' },
              customerPhone: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              numberOfPeople: { type: 'number' },
              comment: { type: 'string' },
              status: { $ref: '#/components/schemas/ReservationStatus' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          Review: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              rating: { type: 'number' },
              comment: { type: 'string' },
              isApproved: { type: 'boolean' },
              dishId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          GalleryItem: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              imageUrl: { type: 'string' },
              title: { type: 'string' },
              category: { type: 'string' },
              isActive: { type: 'boolean' },
              order: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          BlogPost: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              imageUrl: { type: 'string' },
              isPublished: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          SiteContent: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              key: { type: 'string' },
              value: { type: 'string' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Authentification (connexion, inscription)' },
        { name: 'Users', description: 'Gestion des utilisateurs (admin, manager, employé)' },
        { name: 'Categories', description: 'Gestion des catégories de plats' },
        { name: 'Dishes', description: 'Gestion des plats (création, modification, suppression)' },
        { name: 'Menus', description: 'Gestion des menus (quotidiens, hebdomadaires, spéciaux)' },
        { name: 'MenuItems', description: 'Gestion des éléments de menu (association plats-menus)' },
        { name: 'Promotions', description: 'Gestion des promotions et réductions' },
        { name: 'Orders', description: 'Gestion des commandes clients' },
        { name: 'OrderItems', description: 'Gestion des éléments de commande' },
        { name: 'Payments', description: 'Gestion des paiements (Yas Money, Moov Money)' },
        { name: 'Reservations', description: 'Gestion des réservations de tables' },
        { name: 'Reviews', description: 'Gestion des avis clients sur les plats' },
        { name: 'Gallery', description: 'Gestion de la galerie d\'images du restaurant' },
        { name: 'Blog', description: 'Gestion des articles de blog' },
        { name: 'SiteContent', description: 'Gestion du contenu du site web' },
        { name: 'Upload', description: 'Upload d\'images sur Cloudinary' },
      ],
    },
  });
  return spec;
};
