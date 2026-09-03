import LoyaltyTransaction from '../models/LoyaltyTransaction.js';

// @desc    Get current user's loyalty transactions
// @route   GET /api/loyalty/transactions
// @access  Private
export const getLoyaltyTransactions = async (req, res) => {
  try {
    const transactions = await LoyaltyTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
