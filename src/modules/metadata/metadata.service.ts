import { PropertyType } from './models/property-type.model';
import { Area } from './models/area.model';

export const getPropertyTypes = async () => {
    const propertyTypes = await PropertyType.find().lean();
    return propertyTypes.map((type) => ({
        ...type,
        id: type.publicId
    }));
};

export const getAreas = async () => {
    const areas = await Area.find().lean();
    return areas.map((area) => ({
        ...area,
        id: area.publicId
    }));
};
