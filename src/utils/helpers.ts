import axios, { AxiosResponse } from 'axios';

const exposePublicIds = (value: any): any => {
    if (value === null || value === undefined || value instanceof Date || Buffer.isBuffer(value)) return value;
    if (Array.isArray(value)) return value.map(exposePublicIds);
    if (typeof value !== 'object') return value;
    if (value._bsontype === 'ObjectId') return value;

    const source = typeof value.toObject === 'function' ? value.toObject({ virtuals: true }) : value;
    const result: Record<string, any> = {};
    for (const [key, child] of Object.entries(source)) result[key] = exposePublicIds(child);
    if (typeof source.publicId === 'number') result.id = source.publicId;
    return result;
};

const formatResponse = (success: boolean, message: string, data: any = null, code?: string) => {
    const response: { success: boolean; message: string; data: any; code?: string } = { success, message, data: exposePublicIds(data) };
    if (code) {
        response.code = code;
    }
    return response;
};

const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generatePassword = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!.';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const generateRandomNumber = (length: number) => {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return String(result);
};

const sendRequest = async (url: string, data: any): Promise<AxiosResponse> => {
    const method: string = data.method || 'post';
    const payload: object = data.payload || {};
    const headers: object = data.headers || {};

    const axiosConfig: any = {
        method,
        url,
        headers,
        validateStatus: () => true
    };

    if (method === 'get') {
        axiosConfig.params = payload;
    } else {
        axiosConfig.data = payload;
    }

    try {
        const response: AxiosResponse = await axios(axiosConfig);
        return response;
    } catch (error: any) {
        return error;
    }
};

const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};

export { formatResponse, getRandomInt, generatePassword, generateRandomNumber, sendRequest, chunkArray };
