import { PropertyType } from '../modules/metadata/models/property-type.model';
import { Area } from '../modules/metadata/models/area.model';
import logger from '../utils/logger';
import { AREAS, PROPERTY_TYPES } from '../utils/meta-data';

export function generateObjectId(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    return (timestamp + 'xxxxxxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))).slice(0, 24);
}

const seedMetadata = async (): Promise<void> => {
    try {
        // Seed Property Types (Upsert to update Arabic labels)
        for (const type of PROPERTY_TYPES) {
            await PropertyType.findOneAndUpdate(
                { value: type.value },
                {
                    $set: {
                        label: type.label,
                        labelAr: type.labelAr
                    }
                },
                { upsert: true, new: true }
            );
            logger.info(`Property Type seeded/updated: ${type.label}`);
        }

        // Seed Areas (Upsert to preserve ObjectIDs and relationships)
        for (const area of AREAS) {
            await Area.findOneAndUpdate(
                { value: area.value },
                {
                    $set: {
                        label: area.label,
                        labelAr: area.labelAr,
                        governorate: area.governorate,
                        governorateAr: area.governorateAr
                    }
                },
                { upsert: true, new: true }
            );
            logger.info(`Area seeded/updated: ${area.label} (${area.governorate})`);
        }

        logger.info('Metadata seeding completed.');
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`Error seeding metadata: ${error.message}`, { stack: error.stack });
        } else {
            logger.error('Unknown error occurred while seeding metadata');
        }
    }
};

export default seedMetadata;
