import { CounterKey, CounterModel } from './counter.model';

export const nextPublicId = async (key: CounterKey): Promise<number> => {
    const counter = await CounterModel.findByIdAndUpdate(key, { $inc: { sequence: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return counter.sequence;
};

export const ensureCounterAtLeast = async (key: CounterKey, value: number): Promise<void> => {
    await CounterModel.findByIdAndUpdate(key, { $max: { sequence: value } }, { upsert: true, setDefaultsOnInsert: true });
};

export const setCounterSequence = async (key: CounterKey, value: number): Promise<void> => {
    await CounterModel.findByIdAndUpdate(key, { $set: { sequence: value } }, { upsert: true, setDefaultsOnInsert: true });
};
