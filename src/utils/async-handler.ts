// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
