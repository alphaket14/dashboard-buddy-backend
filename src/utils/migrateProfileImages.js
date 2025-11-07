import { getPublicFileUrl } from './s3Utils.js';
import User from '../models/user.js';
import Business from '../models/business.js';
import { Op } from 'sequelize';

/**
 * Migration utility to convert existing S3 keys to permanent URLs
 * Run this once to update existing records
 */
export const migrateProfileImagesToPermanentUrls = async () => {
    try {
        console.log('Starting migration of profile images to permanent URLs...');

        // Update user profile images
        const users = await User.findAll({
            where: {
                profileImageUrl: {
                    [Op.and]: [
                        { [Op.ne]: null },
                        { [Op.notLike]: 'https://%' },
                        { [Op.notLike]: 'http://%' }
                    ]
                }
            }
        });

        console.log(`Found ${users.length} users with S3 keys to migrate`);

        for (const user of users) {
            const permanentUrl = getPublicFileUrl(user.profileImageUrl);
            if (permanentUrl && permanentUrl !== user.profileImageUrl) {
                await user.update({ profileImageUrl: permanentUrl });
                console.log(`Migrated user ${user.id}: ${user.profileImageUrl} -> ${permanentUrl}`);
            }
        }

        // Update business logos
        const businesses = await Business.findAll({
            where: {
                logoUrl: {
                    [Op.and]: [
                        { [Op.ne]: null },
                        { [Op.notLike]: 'https://%' },
                        { [Op.notLike]: 'http://%' }
                    ]
                }
            }
        });

        console.log(`Found ${businesses.length} businesses with S3 keys to migrate`);

        for (const business of businesses) {
            const permanentUrl = getPublicFileUrl(business.logoUrl);
            if (permanentUrl && permanentUrl !== business.logoUrl) {
                await business.update({ logoUrl: permanentUrl });
                console.log(`Migrated business ${business.id}: ${business.logoUrl} -> ${permanentUrl}`);
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateProfileImagesToPermanentUrls()
        .then(() => {
            console.log('Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration script failed:', error);
            process.exit(1);
        });
}
