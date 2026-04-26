import { z } from 'zod';

export const createCouponSchema = z.object({
    body: z
        .object({
            code: z.string({ required_error: 'Coupon code is required' }).min(3, 'Code must be at least 3 characters').max(20, 'Code must not exceed 20 characters'),
            discountValue: z.number({ required_error: 'Discount value is required' }).min(1, 'Discount must be at least 1%').max(100, 'Discount cannot exceed 100%'),
            userLimit: z.number({ required_error: 'User limit is required' }).min(0, 'User limit cannot be negative'),
            expiryDate: z.string({ required_error: 'Expiry date is required' })
        })
        .strict()
});

export const updateCouponSchema = z.object({
    body: z
        .object({
            code: z.string().optional(),
            discountValue: z.number().min(1).max(100).optional(),
            userLimit: z.number().min(0).optional(),
            expiryDate: z.string().optional(),
            isActive: z.boolean().optional()
        })
        .strict()
});
