import { Request, Response } from 'express';
import asyncHandler from '../../utils/async-handler';
import * as couponService from './coupon.service';
import { formatResponse } from '../../utils/helpers';

export const getAllCoupons = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    const search = req.query.search as string;
    const status = req.query.status as string;

    const result = await couponService.getAllCoupons(page, limit, search, status);
    res.status(200).json(formatResponse(true, 'Coupons fetched successfully', result));
});

export const getCouponById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const coupon = await couponService.getCouponById(id.toString());
    res.status(200).json(formatResponse(true, 'Coupon fetched successfully', coupon));
});

export const getCouponStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await couponService.getCouponStats();
    res.status(200).json(formatResponse(true, 'Coupon stats fetched successfully', stats));
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const coupon = await couponService.createCoupon(data);
    res.status(201).json(formatResponse(true, 'Coupon created successfully', coupon));
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const coupon = await couponService.updateCoupon(id.toString(), data);
    res.status(200).json(formatResponse(true, 'Coupon updated successfully', coupon));
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await couponService.deleteCoupon(id.toString());
    res.status(200).json(formatResponse(true, 'Coupon deleted successfully'));
});

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).json(formatResponse(false, 'Coupon code is required'));
    const validationResult = await couponService.validateCoupon(code);
    res.status(200).json(formatResponse(true, 'Coupon validated successfully', validationResult));
});
