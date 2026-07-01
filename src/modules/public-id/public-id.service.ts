import { Types } from 'mongoose';
import CustomError from '../../utils/custom-error';
import { AdModel } from '../ad/models/ad.model';
import { Area } from '../metadata/models/area.model';
import { PropertyType } from '../metadata/models/property-type.model';

const parsePublicId = (value: unknown, label: string): number => {
    const id = typeof value === 'number' ? value : Number(value);
    if (!Number.isSafeInteger(id) || id < 1) {
        throw new CustomError(`${label} ID must be a positive integer`, 400, 'INVALID_PUBLIC_ID');
    }
    return id;
};

export const resolveAreaId = async (value: unknown): Promise<Types.ObjectId> => {
    const item = await Area.findOne({ publicId: parsePublicId(value, 'Area') }).select('_id');
    if (!item) throw new CustomError('Area not found', 404, 'AREA_NOT_FOUND');
    return item._id as Types.ObjectId;
};

export const resolvePropertyTypeId = async (value: unknown): Promise<Types.ObjectId> => {
    const item = await PropertyType.findOne({ publicId: parsePublicId(value, 'Property type') }).select('_id');
    if (!item) throw new CustomError('Property type not found', 404, 'PROPERTY_TYPE_NOT_FOUND');
    return item._id as Types.ObjectId;
};

export const resolveAdId = async (value: unknown, allowLegacyObjectId = false): Promise<Types.ObjectId> => {
    if (allowLegacyObjectId && typeof value === 'string' && Types.ObjectId.isValid(value) && value.length === 24) {
        return new Types.ObjectId(value);
    }
    const item = await AdModel.findOne({ publicId: parsePublicId(value, 'Ad') }).select('_id');
    if (!item) throw new CustomError('Ad not found', 404, 'AD_NOT_FOUND');
    return item._id as Types.ObjectId;
};

export const resolveMetadataInput = async <T extends { propertyType?: unknown; area?: unknown }>(input: T): Promise<T> => {
    const result = { ...input };
    if (input.propertyType !== undefined) result.propertyType = await resolvePropertyTypeId(input.propertyType);
    if (input.area !== undefined) result.area = await resolveAreaId(input.area);
    return result;
};
