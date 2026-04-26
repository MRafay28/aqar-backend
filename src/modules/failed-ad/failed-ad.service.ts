import { PipelineStage, Types } from 'mongoose';
import { FailedAdModel, IFailedAd } from './models/failed-ad.model';

export interface GetFailedAdsParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface GetFailedAdsResult {
    data: IFailedAd[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const saveFailedAd = async (adData: any, errorMessage: string): Promise<IFailedAd> => {
    if (typeof adData?.isPremium === 'boolean' && typeof adData?.premiumAd !== 'boolean') {
        adData.premiumAd = adData.isPremium;
    }

    return await FailedAdModel.create({
        ...adData,
        error: errorMessage
    });
};

export const getFailedAds = async (params: GetFailedAdsParams): Promise<GetFailedAdsResult> => {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                pipeline: [{ $project: { name: 1, phoneNumber: 1 } }],
                as: 'user'
            }
        },
        { $unwind: '$user' }
    ];

    if (search?.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        pipeline.push({
            $match: {
                $or: [{ 'user.name': regex }, { 'user.phoneNumber': regex }, { description: regex }, { error: regex }]
            }
        });
    }

    pipeline.push({
        $facet: {
            data: [
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'propertytypes',
                        localField: 'propertyType',
                        foreignField: '_id',
                        as: 'propertyType'
                    }
                },
                { $unwind: { path: '$propertyType', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'areas',
                        localField: 'area',
                        foreignField: '_id',
                        as: 'area'
                    }
                },
                { $unwind: { path: '$area', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'media',
                        localField: 'media',
                        foreignField: '_id',
                        as: 'media'
                    }
                }
            ],
            count: [{ $count: 'total' }]
        }
    });

    const result = await FailedAdModel.aggregate(pipeline);

    const data = result[0]?.data || [];
    const total = result[0]?.count[0]?.total || 0;

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const getFailedAdById = async (id: string): Promise<IFailedAd | null> => {
    if (!Types.ObjectId.isValid(id)) return null;
    return await FailedAdModel.findById(id)
        .populate('user', 'name phoneNumber')
        .populate('propertyType', 'label labelAr value')
        .populate('area', 'label labelAr value governorateAr')
        .populate('media');
};

export const deleteFailedAd = async (id: string): Promise<boolean> => {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await FailedAdModel.findByIdAndDelete(id);
    return !!result;
};
