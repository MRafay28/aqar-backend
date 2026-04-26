import { PropertyType } from './models/property-type.model';
import { Area } from './models/area.model';

export const getPropertyTypes = async () => {
    return await PropertyType.find();
};

export const getAreas = async () => {
    return await Area.find();
};
