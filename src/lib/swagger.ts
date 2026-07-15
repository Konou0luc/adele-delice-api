import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Adèle Délice',
        version: '1.0.0',
        description: 'API complète pour la gestion du restaurant Adèle Délice : commandes, réservations, menus, plats et plus !',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Serveur de développement',
        },
      ],
      components: {
        securitySchemes: {},
        schemas: {
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
              type: { type: 'string', enum: ['DAILY', 'WEEKLY', 'SPECIAL'] },
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
              status: { type: 'string', enum: ['PENDING', 'PAYMENT_CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'] },
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
              status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED'] },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      tags: [
        { name: 'Categories', description: 'Gestion des catégories de plats' },
        { name: 'Dishes', description: 'Gestion des plats (création, modification, suppression)' },
        { name: 'Menus', description: 'Gestion des menus (quotidiens, hebdomadaires, spéciaux)' },
        { name: 'Orders', description: 'Gestion des commandes clients' },
        { name: 'Reservations', description: 'Gestion des réservations de tables' },
      ],
    },
  });
  return spec;
};
