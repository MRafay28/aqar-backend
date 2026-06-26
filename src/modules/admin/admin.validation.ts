import { z } from 'zod';
import { passwordSchema } from '../user/user.validation';

const createAdminUserSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').trim(),
        phoneNumber: z.string().min(1, 'Phone number is required'),
        password: passwordSchema,
        avatar: z.string().min(1, 'Profile photo is required')
    })
});

export { createAdminUserSchema };
