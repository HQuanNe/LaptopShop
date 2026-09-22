const pool = require('../config/db');

// Gửi đánh giá cho sản phẩm (Chỉ người đã mua mới được đánh giá)
const addReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const userId = req.user.id;
    const userName = req.user.full_name || req.user.username;

    if (!product_id || !rating || !comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp số sao đánh giá (1-5) và nội dung nhận xét'
      });
    }

    const numRating = parseInt(rating, 10);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Số sao đánh giá phải từ 1 đến 5'
      });
    }

    // KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT: ĐÃ MUA HÀNG MỚI ĐƯỢC ĐÁNH GIÁ
    const [purchaseRecords] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'cancelled'`,
      [userId, product_id]
    );

    if (purchaseRecords[0].count === 0) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ khách hàng đã đặt mua sản phẩm này tại HQuanTech mới có thể gửi đánh giá!'
      });
    }

    // Thêm đánh giá
    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [product_id, userId, userName, numRating, comment.trim()]
    );

    // Cập nhật lại điểm trung bình và số lượng review trong bảng products
    const [stats] = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
       FROM reviews WHERE product_id = ?`,
      [product_id]
    );

    const newAvg = parseFloat(stats[0].avg_rating || 5).toFixed(1);
    const totalCount = stats[0].total_reviews || 1;

    await pool.query(
      `UPDATE products SET rating = ?, review_count = ? WHERE id = ?`,
      [newAvg, totalCount, product_id]
    );

    res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã gửi đánh giá sản phẩm thành công!',
      review: {
        id: result.insertId,
        product_id,
        user_id: userId,
        user_name: userName,
        rating: numRating,
        comment: comment.trim(),
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('addReview error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi gửi đánh giá' });
  }
};

module.exports = {
  addReview
};
