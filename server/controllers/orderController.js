const pool = require('../config/db');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      payment_method = 'cod',
      items,
      voucher_code,
      notes
    } = req.body;

    const userId = req.user ? req.user.id : null;

    if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin nhận hàng (họ tên, email, số điện thoại, địa chỉ)'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng của bạn đang trống'
      });
    }

    await connection.beginTransaction();

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const [products] = await connection.query(
        'SELECT id, name, price, stock, (SELECT image_url FROM product_images WHERE product_id = products.id ORDER BY is_primary DESC LIMIT 1) as primary_image FROM products WHERE id = ?',
        [item.product_id]
      );

      if (products.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ID ${item.product_id} không còn tồn tại`
        });
      }

      const prod = products[0];
      const qty = parseInt(item.quantity, 10) || 1;
      const itemSubtotal = parseFloat(prod.price) * qty;
      calculatedTotal += itemSubtotal;

      validatedItems.push({
        product_id: prod.id,
        product_name: prod.name,
        price: prod.price,
        quantity: qty,
        image_url: prod.primary_image || item.image_url || ''
      });
    }

    // Voucher logic
    let discountAmount = 0;
    if (voucher_code) {
      const code = voucher_code.toUpperCase().trim();
      if (code === 'HQUANTECH' || code === 'COSMIC10') {
        discountAmount = Math.round(calculatedTotal * 0.1); // Giảm 10%
      } else if (code === 'GAMING500') {
        discountAmount = 500000;
      }
    }

    const finalAmount = Math.max(0, calculatedTotal - discountAmount);
    const orderCode = `HQT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_code, user_id, customer_name, customer_email, customer_phone,
        shipping_address, payment_method, total_amount, discount_amount, voucher_code,
        status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        orderCode, userId, customer_name.trim(), customer_email.trim(), customer_phone.trim(),
        shipping_address.trim(), payment_method, finalAmount, discountAmount, voucher_code || null,
        notes || null
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.price, item.quantity, item.image_url]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công! HQuanTech sẽ sớm liên hệ xác nhận đơn hàng.',
      order: {
        id: orderId,
        order_code: orderCode,
        total_amount: finalAmount,
        discount_amount: discountAmount,
        status: 'pending',
        items_count: validatedItems.length
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý đặt hàng' });
  } finally {
    connection.release();
  }
};

// Lấy danh sách đơn hàng của người dùng hiện tại
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    for (let order of orders) {
      const [items] = await pool.query(
        `SELECT * FROM order_items WHERE order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('getMyOrders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải lịch sử đơn hàng' });
  }
};

// Xem chi tiết một đơn hàng theo mã đơn
const getOrderByCode = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE order_code = ?`,
      [orderCode]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const order = orders[0];
    const [items] = await pool.query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [order.id]
    );
    order.items = items;

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết đơn hàng' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderByCode
};
