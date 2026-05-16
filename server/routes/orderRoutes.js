import express from 'express';
import { addOrderItems, getOrderById, getMyOrders, createRazorpayOrder, verifyPayment } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addOrderItems);
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

export default router;

