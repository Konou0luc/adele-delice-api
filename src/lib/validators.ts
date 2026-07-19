import { z } from 'zod';

// Schéma pour les utilisateurs
export const UserCreateUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)'),
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional()
});

export const UserUpdateUserSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  firstName: z.string().min(2, 'Prénom trop court').optional(),
  lastName: z.string().min(2, 'Nom trop court').optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
  isActive: z.boolean().optional()
});

// Schéma pour les catégories
export const CategoryCreateCategorySchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number().optional()
});

export const CategoryUpdateCategorySchema = z.object({
  name: z.string().min(1, 'Nom requis').optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional()
});

// Schéma pour les plats
export const DishCreateDishSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  price: z.number().positive('Prix invalide'),
  categoryId: z.string().min(1, 'Catégorie requise'),
  images: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
  preparationTime: z.number().optional(),
  spiceLevel: z.number().optional(),
  allergens: z.array(z.string()).optional(),
  isPromoted: z.boolean().optional(),
  isNew: z.boolean().optional()
});

export const DishUpdateDishSchema = z.object({
  name: z.string().min(1, 'Nom requis').optional(),
  description: z.string().optional(),
  price: z.number().positive('Prix invalide').optional(),
  categoryId: z.string().min(1, 'Catégorie requise').optional(),
  images: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
  preparationTime: z.number().optional(),
  spiceLevel: z.number().optional(),
  allergens: z.array(z.string()).optional(),
  isPromoted: z.boolean().optional(),
  isNew: z.boolean().optional()
});

// Schéma pour les commandes
export const OrderCreateOrderSchema = z.object({
  customerName: z.string().min(1, 'Nom du client requis'),
  customerPhone: z.string().min(1, 'Téléphone du client requis'),
  deliveryAddress: z.string().optional(),
  comment: z.string().optional(),
  orderType: z.string().optional(),
  totalAmount: z.number().positive('Montant total invalide'),
  orderItems: z.array(z.object({
    dishId: z.string().min(1, 'Plat requis'),
    quantity: z.number().int().positive('Quantité invalide'),
    unitPrice: z.number().positive('Prix unitaire invalide')
  }))
});

export const OrderUpdateOrderSchema = z.object({
  customerName: z.string().min(1, 'Nom du client requis').optional(),
  customerPhone: z.string().min(1, 'Téléphone du client requis').optional(),
  deliveryAddress: z.string().optional(),
  comment: z.string().optional(),
  orderType: z.string().optional(),
  status: z.enum(['PENDING', 'PAYMENT_CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELED']).optional()
});

// Schéma pour les paiements
export const PaymentCreatePaymentSchema = z.object({
  orderId: z.string().min(1, 'Commande requise'),
  amount: z.number().positive('Montant invalide'),
  method: z.enum(['YAS_MONEY', 'MOOV_MONEY'])
});

export const PaymentUpdatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED']).optional()
});

// Schéma pour les réservations
export const ReservationCreateReservationSchema = z.object({
  customerName: z.string().min(1, 'Nom du client requis'),
  customerPhone: z.string().min(1, 'Téléphone du client requis'),
  date: z.string().datetime('Date invalide'),
  numberOfPeople: z.number().int().positive('Nombre de personnes invalide'),
  comment: z.string().optional()
});

export const ReservationUpdateReservationSchema = z.object({
  customerName: z.string().min(1, 'Nom du client requis').optional(),
  customerPhone: z.string().min(1, 'Téléphone du client requis').optional(),
  date: z.string().datetime('Date invalide').optional(),
  numberOfPeople: z.number().int().positive('Nombre de personnes invalide').optional(),
  comment: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELED']).optional()
});
