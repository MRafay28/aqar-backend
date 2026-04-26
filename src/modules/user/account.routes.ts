import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    getMyAds,
    createWishlist,
    getWishlists,
    updateWishlist,
    deleteWishlist,
    addFavorite,
    removeFavorite,
    getFavorites,
    checkIsFavorite,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUnreadNotificationCount,
    deleteAccount
} from './account.controller';
import authMiddleware from '../../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/delete-account', deleteAccount);

// My Ads routes
router.get('/my-ads', getMyAds);

// Wishlist routes
router.post('/wishlist', createWishlist);
router.get('/wishlist', getWishlists);
router.put('/wishlist/:id', updateWishlist);
router.delete('/wishlist/:id', deleteWishlist);

// Favorites routes
router.post('/favorites', addFavorite);
router.delete('/favorites/:adId', removeFavorite);
router.get('/favorites', getFavorites);
router.get('/favorites/check/:adId', checkIsFavorite);

// Notifications routes
router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadNotificationCount);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.put('/notifications/:id/read', markNotificationAsRead);
router.delete('/notifications/:id', deleteNotification);
router.delete('/notifications', deleteAllNotifications);

export default router;
