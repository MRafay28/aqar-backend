import { Request, Response } from 'express';
import * as AccountService from './account.service';
import asyncHandler from '../../utils/async-handler';
import { formatResponse } from '../../utils/helpers';
import { JwtPayload } from 'jsonwebtoken';
import { WishlistStatus } from './models/wishlist.model';
import * as AdService from '../ad/ad.service';
// Profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const profile = await AccountService.getProfile(user.id);
    res.status(200).json(formatResponse(true, 'Profile retrieved successfully', profile));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const profile = await AccountService.updateProfile(user.id, req.body);
    res.status(200).json(formatResponse(true, 'Profile updated successfully', profile));
});

// My Ads
export const getMyAds = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { status, page, limit } = req.query;
    const result = await AccountService.getUserAds(user.id, status as string, parseInt(page as string) || 1, parseInt(limit as string) || 12);
    res.status(200).json(formatResponse(true, 'Ads retrieved successfully', result));
});

// Wishlist
export const createWishlist = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const wishlist = await AccountService.createWishlist(user.id, req.body);
    res.status(201).json(formatResponse(true, 'Wishlist created successfully', wishlist));
});

export const getWishlists = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { status } = req.query;
    const wishlists = await AccountService.getWishlists(user.id, status as WishlistStatus);
    res.status(200).json(formatResponse(true, 'Wishlists retrieved successfully', wishlists));
});

export const updateWishlist = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { id } = req.params;
    const wishlist = await AccountService.updateWishlist(id as string, user.id, req.body);
    res.status(200).json(formatResponse(true, 'Wishlist updated successfully', wishlist));
});

export const deleteWishlist = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { id } = req.params;
    const wishlist = await AccountService.deleteWishlist(id as string, user.id);
    res.status(200).json(formatResponse(true, 'Wishlist cancelled successfully', wishlist));
});

// Favorites
export const addFavorite = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { adId } = req.body;
    // Check if user is trying to favorite their own ad
    const ad = await AdService.getAdById(adId);
    if (!ad) {
        return res.status(404).json(formatResponse(false, 'Ad not found'));
    }
    if (ad.user.toString() === user.id) {
        return res.status(400).json(formatResponse(false, 'You cannot favorite your own property'));
    }
    const favorite = await AccountService.addFavorite(user.id, adId);
    res.status(201).json(formatResponse(true, 'Favorite added successfully', favorite));
});

export const removeFavorite = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { adId } = req.params;
    await AccountService.removeFavorite(user.id, adId as string);
    res.status(200).json(formatResponse(true, 'Favorite removed successfully'));
});

export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { page, limit } = req.query;
    const result = await AccountService.getFavorites(user.id, parseInt(page as string) || 1, parseInt(limit as string) || 12);
    res.status(200).json(formatResponse(true, 'Favorites retrieved successfully', result));
});

export const checkIsFavorite = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { adId } = req.params;
    const isFav = await AccountService.isFavorite(user.id, adId as string);
    res.status(200).json(formatResponse(true, 'Favorite status retrieved', { isFavorite: isFav }));
});

// Notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { page, limit } = req.query;
    const result = await AccountService.getNotifications(user.id, parseInt(page as string) || 1, parseInt(limit as string) || 20);
    res.status(200).json(formatResponse(true, 'Notifications retrieved successfully', result));
});

export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { id } = req.params;
    const notification = await AccountService.markNotificationAsRead(id as string, user.id);
    res.status(200).json(formatResponse(true, 'Notification marked as read', notification));
});

export const markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    await AccountService.markAllNotificationsAsRead(user.id);
    res.status(200).json(formatResponse(true, 'All notifications marked as read'));
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { id } = req.params;
    await AccountService.deleteNotification(id as string, user.id);
    res.status(200).json(formatResponse(true, 'Notification deleted successfully'));
});

export const deleteAllNotifications = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    await AccountService.deleteAllNotifications(user.id);
    res.status(200).json(formatResponse(true, 'All notifications deleted successfully'));
});

export const getUnreadNotificationCount = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const count = await AccountService.getUnreadNotificationCount(user.id);
    res.status(200).json(formatResponse(true, 'Unread count retrieved', { count }));
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    await AccountService.deleteAccount(user.id);
    res.status(200).json(formatResponse(true, 'Account deleted successfully'));
});
