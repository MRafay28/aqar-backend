import { UserModel } from '../modules/user/models';
import { UserRole } from '../modules/user/user.constants';
import logger from '../utils/logger';

const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || '99999999';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const SUPER_ADMIN_NAME = 'Super Admin';

const seedSuperAdmin = async (): Promise<void> => {
    try {
        if (!SUPER_ADMIN_PHONE || !SUPER_ADMIN_PASSWORD) {
            logger.error('Super admin phone or password is not set');
            return;
        }

        // Check if super admin already exists
        const existingSuperAdmin = await UserModel.findOne({ phoneNumber: SUPER_ADMIN_PHONE });

        if (existingSuperAdmin) {
            logger.info('Super admin already exists. Skipping seed.');
            return;
        }

        // Create super admin user
        const superAdmin = new UserModel({
            name: SUPER_ADMIN_NAME,
            phoneNumber: SUPER_ADMIN_PHONE,
            password: SUPER_ADMIN_PASSWORD,
            role: UserRole.SUPER_ADMIN,
            isVerified: true,
            isActive: true
        });

        await superAdmin.save();
        logger.info('Super admin created successfully.');
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`Error seeding super admin: ${error.message}`, { stack: error.stack });
        } else {
            logger.error('Unknown error occurred while seeding super admin');
        }
    }
};

export default seedSuperAdmin;
