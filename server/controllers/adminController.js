const pool = require('../config/db');

// Thống kê tổng quan cho Admin Dashboard
const getDashboardStats = async (req, res) => {
  try {
    // 1. Doanh thu
    const [revResult] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue 
       FROM orders WHERE status != 'cancelled'`
    );
    const totalRevenue = parseFloat(revResult[0].total_revenue);

    // 2. Tổng số đơn hàng
    const [orderCountResult] = await pool.query(`SELECT COUNT(*) as total_orders FROM orders`);
    const totalOrders = orderCountResult[0].total_orders;

    // 3. Tổng số laptop
    const [productCountResult] = await pool.query(`SELECT COUNT(*) as total_products FROM products`);
    const totalProducts = productCountResult[0].total_products;

    // 4. Tổng số thành viên
    const [userCountResult] = await pool.query(`SELECT COUNT(*) as total_users FROM users WHERE role = 'user'`);
    const totalUsers = userCountResult[0].total_users;

    // 5. Đơn hàng gần đây
    const [recentOrders] = await pool.query(
      `SELECT id, order_code, customer_name, total_amount, status, created_at 
       FROM orders 
       ORDER BY created_at DESC 
       LIMIT 6`
    );

    // 6. Thống kê trạng thái đơn hàng
    const [statusStats] = await pool.query(
      `SELECT status, COUNT(*) as count FROM orders GROUP BY status`
    );

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        statusStats
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu thống kê' });
  }
};

// Lấy danh sách sản phẩm quản trị
const getAdminProducts = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, 
             b.name AS brand_name, 
             c.name AS category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    // Lấy kèm toàn bộ ảnh của từng sản phẩm
    for (let p of products) {
      const [imgs] = await pool.query(
        'SELECT id, image_url, caption, is_primary, display_order FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
        [p.id]
      );
      p.images = imgs;
    }

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('getAdminProducts error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách sản phẩm quản trị' });
  }
};

// Thêm mới laptop kèm nhiều góc chụp
const createProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      name,
      brand_id,
      category_id,
      price,
      original_price,
      stock = 10,
      target_use,
      cpu,
      ram,
      storage,
      gpu,
      screen,
      battery,
      weight,
      ports,
      os = 'Windows 11 Home',
      is_featured = false,
      is_new = true,
      short_desc,
      description,
      images = []
    } = req.body;

    if (!name || !brand_id || !category_id || !price || !target_use || !cpu || !ram || !storage || !gpu || !screen) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: tên máy, hãng, danh mục, giá, tiêu chuẩn nhu cầu, CPU, RAM, Ổ cứng, GPU, Màn hình'
      });
    }

    await connection.beginTransaction();

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const [result] = await connection.query(
      `INSERT INTO products (
        name, slug, brand_id, category_id, price, original_price, stock,
        target_use, cpu, ram, storage, gpu, screen, battery, weight, ports,
        os, is_featured, is_new, short_desc, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(), slug, brand_id, category_id, price, original_price || null, stock,
        target_use.trim(), cpu.trim(), ram.trim(), storage.trim(), gpu.trim(), screen.trim(),
        battery || '', weight || '', ports || '', os || 'Windows 11 Home',
        is_featured ? 1 : 0, is_new ? 1 : 0, short_desc || '', description || ''
      ]
    );

    const productId = result.insertId;

    // Thêm các ảnh góc chụp
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, caption, is_primary, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, img.image_url, img.caption || `Góc chụp ${i + 1}`, i === 0 ? 1 : 0, i + 1]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm laptop mới thành công',
      productId
    });
  } catch (error) {
    await connection.rollback();
    console.error('createProduct error:', error);
    res.status(500).json({ success: false, message: 'Lỗi thêm sản phẩm' });
  } finally {
    connection.release();
  }
};

// Cập nhật laptop
const updateProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      name,
      brand_id,
      category_id,
      price,
      original_price,
      stock,
      target_use,
      cpu,
      ram,
      storage,
      gpu,
      screen,
      battery,
      weight,
      ports,
      os,
      is_featured,
      is_new,
      short_desc,
      description,
      images
    } = req.body;

    await connection.beginTransaction();

    await connection.query(
      `UPDATE products SET
        name = ?, brand_id = ?, category_id = ?, price = ?, original_price = ?, stock = ?,
        target_use = ?, cpu = ?, ram = ?, storage = ?, gpu = ?, screen = ?, battery = ?,
        weight = ?, ports = ?, os = ?, is_featured = ?, is_new = ?, short_desc = ?, description = ?
       WHERE id = ?`,
      [
        name, brand_id, category_id, price, original_price || null, stock,
        target_use, cpu, ram, storage, gpu, screen, battery,
        weight, ports, os, is_featured ? 1 : 0, is_new ? 1 : 0, short_desc, description,
        id
      ]
    );

    // Nếu có gửi danh sách ảnh mới thì cập nhật lại
    if (images && Array.isArray(images) && images.length > 0) {
      await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, caption, is_primary, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [id, img.image_url, img.caption || `Góc chụp ${i + 1}`, i === 0 ? 1 : 0, i + 1]
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    await connection.rollback();
    console.error('updateProduct error:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật sản phẩm' });
  } finally {
    connection.release();
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Đã xóa sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa sản phẩm' });
  }
};

// Quản lý đơn hàng (Admin)
const getAdminOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const [orders] = await pool.query(query, params);

    for (let order of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách đơn hàng' });
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng sang '${status}' thành công`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái đơn hàng' });
  }
};

// Quản lý thành viên
const getAdminUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.username, u.email, u.full_name, u.address, u.phone, u.role, u.created_at,
             (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as orders_count
      FROM users u
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách người dùng' });
  }
};

module.exports = {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers
};
