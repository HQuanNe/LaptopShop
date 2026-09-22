const pool = require('../config/db');

// Lấy danh sách sản phẩm với bộ lọc chuyên sâu
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      ram,
      cpu,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT p.*, 
             b.name AS brand_name, b.slug AS brand_slug,
             c.name AS category_name, c.slug AS category_slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by Category
    if (category) {
      if (!isNaN(category)) {
        query += ` AND p.category_id = ?`;
        params.push(parseInt(category, 10));
      } else {
        query += ` AND c.slug = ?`;
        params.push(category);
      }
    }

    // Filter by Brand
    if (brand) {
      if (!isNaN(brand)) {
        query += ` AND p.brand_id = ?`;
        params.push(parseInt(brand, 10));
      } else {
        query += ` AND b.slug = ?`;
        params.push(brand);
      }
    }

    // Search by name, specs or description
    if (search && search.trim()) {
      query += ` AND (p.name LIKE ? OR p.short_desc LIKE ? OR p.cpu LIKE ? OR p.gpu LIKE ? OR p.target_use LIKE ?)`;
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    // Filter by Price range
    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    // Filter by RAM
    if (ram) {
      query += ` AND p.ram LIKE ?`;
      params.push(`%${ram}%`);
    }

    // Filter by CPU
    if (cpu) {
      query += ` AND p.cpu LIKE ?`;
      params.push(`%${cpu}%`);
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'rating':
        query += ` ORDER BY p.rating DESC, p.review_count DESC`;
        break;
      case 'name_asc':
        query += ` ORDER BY p.name ASC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY p.is_new DESC, p.id DESC`;
        break;
    }

    // Pagination
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), offset);

    const [products] = await pool.query(query, params);

    // Attach all angle images to each product
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      const [allImages] = await pool.query(
        'SELECT id, product_id, image_url, caption, is_primary, display_order FROM product_images WHERE product_id IN (?) ORDER BY display_order ASC',
        [productIds]
      );
      const imagesByProduct = {};
      for (const img of allImages) {
        if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
        imagesByProduct[img.product_id].push(img);
      }
      for (const prod of products) {
        prod.images = imagesByProduct[prod.id] || [];
      }
    }

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const countParams = params.slice(0, params.length - 2); // Exclude limit & offset
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      products
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách sản phẩm' });
  }
};

// Lấy sản phẩm nổi bật phục vụ cuộn trang Flagship Showcase
const getFeaturedProducts = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, 
             b.name AS brand_name,
             c.name AS category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = 1 OR p.is_new = 1
      ORDER BY p.price DESC
      LIMIT 6
    `);

    // For each product, also fetch all its images
    for (let prod of products) {
      const [images] = await pool.query(
        'SELECT id, image_url, caption, is_primary, display_order FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
        [prod.id]
      );
      prod.images = images;
    }

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('getFeaturedProducts error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải sản phẩm nổi bật' });
  }
};

// Chi tiết sản phẩm với tất cả các góc chụp và thông tin đánh giá
const getProductByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let query = `
      SELECT p.*, 
             b.name AS brand_name, b.logo_url AS brand_logo,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE `;

    const params = [];
    if (!isNaN(idOrSlug)) {
      query += `p.id = ?`;
      params.push(parseInt(idOrSlug, 10));
    } else {
      query += `p.slug = ?`;
      params.push(idOrSlug);
    }

    const [products] = await pool.query(query, params);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm yêu cầu' });
    }

    const product = products[0];

    // Lấy danh sách ảnh các góc chụp (ít nhất 3 góc chụp)
    const [images] = await pool.query(
      `SELECT id, image_url, caption, is_primary, display_order 
       FROM product_images 
       WHERE product_id = ? 
       ORDER BY is_primary DESC, display_order ASC`,
      [product.id]
    );
    product.images = images;

    // Lấy đánh giá đã duyệt
    const [reviews] = await pool.query(
      `SELECT r.id, r.user_id, r.user_name, r.rating, r.comment, r.created_at
       FROM reviews r
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [product.id]
    );
    product.reviews = reviews;

    // Kiểm tra xem người dùng hiện tại có đủ điều kiện đánh giá không: "đã mua mới đánh giá nhé"
    let canReview = false;
    if (req.user && req.user.id) {
      const [purchaseCheck] = await pool.query(
        `SELECT COUNT(*) as purchasedCount
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'cancelled'`,
        [req.user.id, product.id]
      );
      canReview = purchaseCheck[0].purchasedCount > 0;
    }
    product.canReview = canReview;

    // Sản phẩm liên quan cùng danh mục
    const [related] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.price, p.original_price, p.cpu, p.gpu, p.target_use,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) AS primary_image
       FROM products p
       WHERE p.category_id = ? AND p.id != ?
       LIMIT 4`,
      [product.category_id, product.id]
    );
    product.related = related;

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('getProductByIdOrSlug error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải thông tin sản phẩm' });
  }
};

// So sánh cấu hình laptop (Nhận danh sách IDs: e.g. ids=1,2,3)
const compareProducts = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách ID để so sánh' });
    }

    const idList = ids.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    if (idList.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách ID không hợp lệ' });
    }

    const placeholders = idList.map(() => '?').join(',');
    const [products] = await pool.query(
      `SELECT p.*, 
              b.name AS brand_name,
              c.name AS category_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) AS primary_image
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id IN (${placeholders})`,
      idList
    );

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('compareProducts error:', error);
    res.status(500).json({ success: false, message: 'Lỗi so sánh sản phẩm' });
  }
};

// Lấy danh mục và hãng sản xuất
const getMetadata = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    const [brands] = await pool.query('SELECT * FROM brands ORDER BY name ASC');

    res.json({
      success: true,
      categories,
      brands
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh mục' });
  }
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  compareProducts,
  getMetadata
};
