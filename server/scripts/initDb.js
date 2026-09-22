const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};


const DB_NAME = process.env.DB_NAME || 'hquantech_db';

async function initDatabase() {
  console.log(`[InitDB] Connecting to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}...`);
  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    console.log(`[InitDB] Creating database '${DB_NAME}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.changeUser({ database: DB_NAME });

    console.log(`[InitDB] Creating tables for HQuanTech...`);

    // 1. Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        address VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Categories Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Brands Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) NOT NULL UNIQUE,
        logo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Products Table (bao gồm target_use: Đạt tiêu chuẩn cho nhu cầu nào)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        brand_id INT NOT NULL,
        category_id INT NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        original_price DECIMAL(15, 2),
        stock INT DEFAULT 15,
        target_use VARCHAR(255) NOT NULL,
        cpu VARCHAR(100) NOT NULL,
        ram VARCHAR(50) NOT NULL,
        storage VARCHAR(100) NOT NULL,
        gpu VARCHAR(100) NOT NULL,
        screen VARCHAR(150) NOT NULL,
        battery VARCHAR(100),
        weight VARCHAR(50),
        ports TEXT,
        os VARCHAR(50) DEFAULT 'Windows 11 Home',
        is_featured BOOLEAN DEFAULT FALSE,
        is_new BOOLEAN DEFAULT TRUE,
        rating DECIMAL(2, 1) DEFAULT 5.0,
        review_count INT DEFAULT 0,
        short_desc TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Product Images Table (ít nhất 3 góc chụp mỗi sản phẩm)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url TEXT NOT NULL,
        caption VARCHAR(100) DEFAULT 'Góc chụp sản phẩm',
        is_primary BOOLEAN DEFAULT FALSE,
        display_order INT DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Orders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_code VARCHAR(30) NOT NULL UNIQUE,
        user_id INT,
        customer_name VARCHAR(100) NOT NULL,
        customer_email VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        shipping_address VARCHAR(255) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cod',
        total_amount DECIMAL(15, 2) NOT NULL,
        discount_amount DECIMAL(15, 2) DEFAULT 0,
        voucher_code VARCHAR(50),
        status ENUM('pending', 'processing', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Order Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        quantity INT NOT NULL,
        image_url TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Reviews Table (Chỉ người đã mua mới được viết review)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        rating INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log(`[InitDB] All tables created successfully.`);

    // Check if categories already seeded
    const [catRows] = await connection.query(`SELECT COUNT(*) as count FROM categories`);
    if (catRows[0].count === 0) {
      console.log(`[InitDB] Seeding categories and brands...`);

      // Seed Categories
      await connection.query(`
        INSERT INTO categories (id, name, slug, description, icon) VALUES
        (1, 'Laptop Gaming', 'laptop-gaming', 'Chiến mọi tựa game AAA đỉnh cao với đồ họa RTX và màn hình tần số quét cực cao', 'Gamepad2'),
        (2, 'Laptop Văn phòng & Doanh nhân', 'laptop-van-phong', 'Thiết kế sang trọng, thời lượng pin cả ngày, bảo mật vân tay & nhận diện gương mặt', 'Briefcase'),
        (3, 'Laptop Đồ họa & Sáng tạo', 'laptop-do-hoa', 'Sức mạnh dựng phim 8K, render 3D, màn hình màu sắc chuẩn 100% DCI-P3 chuyên nghiệp', 'Palette'),
        (4, 'Laptop Mỏng nhẹ & Ultrabook', 'laptop-mong-nhe', 'Trọng lượng siêu nhẹ dưới 1.3kg, khung vỏ hợp kim titan/nhôm siêu bền di động', 'Feather');
      `);

      // Seed Brands
      await connection.query(`
        INSERT INTO brands (id, name, slug, logo_url) VALUES
        (1, 'ASUS ROG', 'asus', 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg'),
        (2, 'Apple', 'apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'),
        (3, 'Dell', 'dell', 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg'),
        (4, 'Lenovo', 'lenovo', 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg'),
        (5, 'Acer', 'acer', 'https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg'),
        (6, 'HP', 'hp', 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg'),
        (7, 'MSI', 'msi', 'https://upload.wikimedia.org/wikipedia/commons/0/08/MSI_Logo.svg');
      `);

      console.log(`[InitDB] Seeding products with distinct multi-angle photos and target standards...`);

      // Seed Products
      const productsData = [
        {
          id: 1,
          name: 'ASUS ROG Strix SCAR 18 (2026)',
          slug: 'asus-rog-strix-scar-18-2026',
          brand_id: 1,
          category_id: 1,
          price: 94990000,
          original_price: 104990000,
          stock: 8,
          target_use: 'Đạt chuẩn: Gaming AAA Max Settings 4K, Esport 240Hz, Streamer & Render đồ họa nặng',
          cpu: 'Intel Core i9-14900HX (24 cores, 32 threads, up to 5.8GHz)',
          ram: '64GB DDR5 5600MHz (2x32GB)',
          storage: '2TB PCIe 4.0 NVMe M.2 SSD (RAID 0)',
          gpu: 'NVIDIA GeForce RTX 4090 16GB GDDR6 (TGP 175W)',
          screen: '18.0 inch 2.5K QHD+ (2560x1600) ROG Nebula HDR Mini LED 240Hz 3ms 100% DCI-P3 1100 nits',
          battery: '90WHrs 4-cell Li-ion sạc nhanh 330W',
          weight: '3.10 kg',
          ports: '1x Thunderbolt 4, 1x USB-C 3.2 Gen 2, 2x USB-A 3.2 Gen 2, 1x HDMI 2.1, 1x LAN 2.5G',
          os: 'Windows 11 Home Bản Quyền',
          is_featured: true,
          is_new: true,
          rating: 5.0,
          review_count: 12,
          short_desc: 'Cỗ máy gaming đỉnh cao vũ trụ với màn hình 18 inch Mini-LED 240Hz và RTX 4090 tột đỉnh.',
          description: 'ROG Strix SCAR 18 đại diện cho tinh hoa công nghệ gaming tối tân. Được trang bị vi xử lý Intel Core i9-14900HX cùng card đồ họa NVIDIA GeForce RTX 4090 16GB, hệ thống làm mát 3 quạt với keo kim loại lỏng Conductonaut Extreme mang lại hiệu năng ổn định tuyệt đối trong mọi phiên chinh chiến.'
        },
        {
          id: 2,
          name: 'Apple MacBook Pro 16 M3 Max',
          slug: 'apple-macbook-pro-16-m3-max',
          brand_id: 2,
          category_id: 3,
          price: 89990000,
          original_price: 98990000,
          stock: 12,
          target_use: 'Đạt chuẩn: Creator Đồ họa chuyên nghiệp, Dựng phim 8K ProRes, Lập trình Trí tuệ nhân tạo AI',
          cpu: 'Apple M3 Max (16-core CPU: 12 performance cores và 4 efficiency cores)',
          ram: '48GB Unified Memory siêu tốc độ',
          storage: '1TB SSD siêu nhanh 7.4GB/s',
          gpu: '40-core GPU kiến trúc Dynamic Caching đột phá',
          screen: '16.2 inch Liquid Retina XDR (3456x2234) ProMotion 120Hz 1600 nits đỉnh cao',
          battery: '100Wh lên đến 22 giờ sử dụng liên tục',
          weight: '2.16 kg',
          ports: '3x Thunderbolt 4, 1x HDMI, 1x Khe thẻ SDXC, 1x Cổng sạc MagSafe 3',
          os: 'macOS Sonoma',
          is_featured: true,
          is_new: true,
          rating: 4.9,
          review_count: 19,
          short_desc: 'Siêu phẩm vũ trụ của sáng tạo: chip M3 Max hủy diệt, pin 22 tiếng và màn hình XDR chân thực.',
          description: 'MacBook Pro 16 inch với chip M3 Max đưa hiệu năng và tính cơ động lên tầm cao vũ trụ mới. Dynamic Caching tối ưu hóa bộ nhớ trên chip để tăng đáng kể mức sử dụng GPU trung bình, xử lý trơn tru các khung cảnh 3D siêu phức tạp và mô hình ngôn ngữ lớn.'
        },
        {
          id: 3,
          name: 'Dell XPS 16 9640 OLED (2026)',
          slug: 'dell-xps-16-9640-oled-2026',
          brand_id: 3,
          category_id: 2,
          price: 68990000,
          original_price: 74500000,
          stock: 10,
          target_use: 'Đạt chuẩn: Doanh nhân đẳng cấp, Thiết kế đa phương tiện, Màn hình 4K OLED vô cực chuẩn màu',
          cpu: 'Intel Core Ultra 9 185H (16 cores, NPU AI Boost tích hợp)',
          ram: '32GB LPDDR5x 7467MHz Dual Channel',
          storage: '1TB PCIe Gen4 NVMe M.2 SSD',
          gpu: 'NVIDIA GeForce RTX 4070 8GB GDDR6 Studio Edition',
          screen: '16.3 inch 4K+ (3840x2400) InfinityEdge OLED Touch 100% DCI-P3 500 nits',
          battery: '99.5Wh pin khủng hỗ trợ ExpressCharge',
          weight: '2.13 kg',
          ports: '3x Thunderbolt 4 Type-C (DisplayPort & Power Delivery), 1x Khe đọc thẻ microSD v7.1',
          os: 'Windows 11 Pro Bản Quyền',
          is_featured: true,
          is_new: true,
          rating: 4.8,
          review_count: 8,
          short_desc: 'Kiệt tác nhôm nguyên khối tương lai, bàn phím cảm ứng ẩn và màn hình OLED 4K sắc sảo.',
          description: 'Dell XPS 16 là sự giao thoa hoàn mỹ giữa nghệ thuật tối giản và công nghệ tương lai. Toàn bộ khung máy chế tác từ nhôm nguyên khối CNC tinh xảo kết hợp kính cường lực Gorilla Glass 3 liền mạch. Màn hình OLED 4K+ chuẩn màu đồ họa cùng chip AI Core Ultra 9 mạnh mẽ.'
        },
        {
          id: 4,
          name: 'Lenovo Legion Pro 7i Gen 9',
          slug: 'lenovo-legion-pro-7i-gen-9',
          brand_id: 4,
          category_id: 1,
          price: 76990000,
          original_price: 82990000,
          stock: 14,
          target_use: 'Đạt chuẩn: Gaming Hardcore thi đấu chuyên nghiệp, Render 3D kiến trúc & Kỹ thuật cơ khí',
          cpu: 'Intel Core i9-14900HX (24 nhân 32 luồng, Turbo 5.8GHz)',
          ram: '32GB DDR5 5600MHz (Nâng cấp tối đa 64GB)',
          storage: '1TB SSD M.2 2280 PCIe 4.0x4 NVMe',
          gpu: 'NVIDIA GeForce RTX 4080 12GB GDDR6 (TGP 175W max công suất)',
          screen: '16.0 inch WQXGA (2560x1600) IPS 240Hz 500nits 100% sRGB G-SYNC DisplayHDR 400',
          battery: '99.9Wh Super Rapid Charge Pro (sạc 80% trong 30 phút)',
          weight: '2.62 kg',
          ports: '1x Thunderbolt 4, 1x USB-C 3.2 Gen 2, 4x USB-A 3.2 Gen 1, 1x HDMI 2.1, 1x RJ-45 2.5G',
          os: 'Windows 11 Home',
          is_featured: true,
          is_new: false,
          rating: 4.9,
          review_count: 15,
          short_desc: 'Chiến binh esport trang bị chip AI Lenovo LA-2Q tối ưu hóa FPS thời gian thực.',
          description: 'Legion Pro 7i Gen 9 sở hữu hệ thống tản nhiệt buồng hơi Legion Coldfront 5.0 buồng kín với quạt cánh siêu mỏng 3D giúp duy trì hiệu năng 235W TDP tổng thể ổn định không tụt xung.'
        },
        {
          id: 5,
          name: 'HP Spectre x360 14 (2026) 2-in-1',
          slug: 'hp-spectre-x360-14-2026-2-in-1',
          brand_id: 6,
          category_id: 4,
          price: 45990000,
          original_price: 49990000,
          stock: 9,
          target_use: 'Đạt chuẩn: Doanh nhân cao cấp, Chuẩn Intel Evo siêu mỏng xoay gập 360 độ, Pin 15h, Bút vẽ cảm ứng',
          cpu: 'Intel Core Ultra 7 155H (16 nhân, 22 luồng, NPU Intel AI Boost)',
          ram: '32GB LPDDR5x 6400MHz Onboard',
          storage: '1TB PCIe Gen4 NVMe TLC M.2 SSD',
          gpu: 'Intel Arc Graphics 8 Xe-cores sắc nét',
          screen: '14.0 inch 2.8K (2880x1800) OLED Touch 120Hz 500nits HDR 100% DCI-P3 kèm bút HP Tilt Pen',
          battery: '68Wh thời lượng pin lên đến 15 giờ liên tục',
          weight: '1.44 kg',
          ports: '2x Thunderbolt 4 with USB Type-C 40Gbps, 1x USB Type-A 10Gbps, 1x jack tai nghe 3.5mm',
          os: 'Windows 11 Home Bản Quyền',
          is_featured: true,
          is_new: true,
          rating: 4.8,
          review_count: 6,
          short_desc: 'Tuyệt tác xoay gập 360 độ góc cạnh vát kim cương, webcam 9MP AI thông minh tự động căn khung hình.',
          description: 'HP Spectre x360 14 thế hệ mới là đại diện tiêu biểu cho dòng ultrabook biến hình 2 trong 1. Màn hình OLED 2.8K 120Hz siêu mịn, âm thanh tinh chỉnh bởi Poly Studio cùng thời lượng pin bền bỉ cả ngày dài.'
        },
        {
          id: 6,
          name: 'Lenovo ThinkPad X1 Carbon Gen 12',
          slug: 'lenovo-thinkpad-x1-carbon-gen-12',
          brand_id: 4,
          category_id: 2,
          price: 52990000,
          original_price: 56990000,
          stock: 11,
          target_use: 'Đạt chuẩn: Doanh nghiệp cao cấp, Bảo mật vân tay & Camera IR nhận diện, Độ bền quân đội MIL-STD 810H',
          cpu: 'Intel Core Ultra 7 155H vPro (16 nhân, NPU AI tối ưu hóa họp trực tuyến)',
          ram: '32GB LPDDR5x 6400MHz Dual Channel',
          storage: '1TB SSD M.2 2280 PCIe 4.0 Performance NVMe Opal 2.0',
          gpu: 'Intel Arc Graphics',
          screen: '14.0 inch 2.8K (2880x1800) OLED AG 120Hz 400 nits 100% DCI-P3 DisplayHDR True Black 500',
          battery: '57Wh sạc nhanh 65W Rapid Charge (80% trong 60 phút)',
          weight: '1.09 kg',
          ports: '2x Thunderbolt 4, 2x USB-A 3.2 Gen 1, 1x HDMI 2.1, 1x Jack combo 3.5mm',
          os: 'Windows 11 Pro 64-bit',
          is_featured: false,
          is_new: true,
          rating: 5.0,
          review_count: 10,
          short_desc: 'Huyền thoại bàn phím số 1 thế giới, sợi carbon siêu nhẹ 1.09kg và độ bền chuẩn quân sự Mỹ.',
          description: 'ThinkPad X1 Carbon Gen 12 tái định nghĩa máy tính xách tay cao cấp cho doanh nhân. Vỏ máy kết hợp sợi carbon tái chế và hợp kim magiê siêu bền, bàn phím TrackPoint công thái học trứ danh cho trải nghiệm gõ êm ái nhất.'
        },
        {
          id: 7,
          name: 'Acer Predator Helios 16 PH16-72',
          slug: 'acer-predator-helios-16-ph16-72',
          brand_id: 5,
          category_id: 1,
          price: 59990000,
          original_price: 66990000,
          stock: 15,
          target_use: 'Đạt chuẩn: Gaming Cày cuốc Esport & AAA, Thiết kế đồ họa kỹ thuật số với phím cơ MagKey 3.0',
          cpu: 'Intel Core i9-14900HX (24 nhân, 32 luồng, xung nhịp lên đến 5.8GHz)',
          ram: '32GB DDR5 5600MHz (2 khe rời nâng cấp 64GB)',
          storage: '1TB PCIe NVMe SED SSD',
          gpu: 'NVIDIA GeForce RTX 4080 12GB GDDR6 (TGP 175W)',
          screen: '16.0 inch WQXGA (2560x1600) Mini-LED 250Hz 100% DCI-P3 1000 nits siêu sáng',
          battery: '90Wh Li-ion Battery 330W Adapter',
          weight: '2.65 kg',
          ports: '2x Thunderbolt 4 Type-C, 3x USB 3.2 Gen 2 Type-A, 1x HDMI 2.1, 1x MicroSD reader, 1x RJ-45 Killer E3100G',
          os: 'Windows 11 Home',
          is_featured: false,
          is_new: true,
          rating: 4.7,
          review_count: 5,
          short_desc: 'Quái thú gaming màn hình Mini-LED 250Hz 1000 nits, tản nhiệt kim loại lỏng AeroBlade 3D thế hệ thứ 5.',
          description: 'Predator Helios 16 sẵn sàng thống trị mọi đấu trường ảo. Tích hợp phím nóng cơ học MagKey độc quyền có thể thay thế cụm switch WASD để mang lại cảm giác bấm cơ học phản hồi tức thì trong từng pha combat.'
        },
        {
          id: 8,
          name: 'MSI Stealth 16 AI Studio A1V',
          slug: 'msi-stealth-16-ai-studio-a1v',
          brand_id: 7,
          category_id: 4,
          price: 62990000,
          original_price: 68990000,
          stock: 7,
          target_use: 'Đạt chuẩn: Kỹ sư phần mềm & Lập trình viên AI, Mỏng nhẹ cao cấp mang đi họp và chiến game ban đêm',
          cpu: 'Intel Core Ultra 9 185H tích hợp NPU AI Engine',
          ram: '32GB DDR5 5600MHz (2 khe cắm nâng cấp)',
          storage: '1TB NVMe PCIe Gen4 SSD',
          gpu: 'NVIDIA GeForce RTX 4070 8GB GDDR6 Studio Driver Certified',
          screen: '16.0 inch QHD+ (2560x1600) 240Hz IPS-Level 100% DCI-P3',
          battery: '99.9Wh pin dung lượng tối đa cho phép mang lên máy bay',
          weight: '1.99 kg',
          ports: '1x Thunderbolt 4, 1x USB-C 3.2 Gen 2 (DisplayPort/PD), 1x USB-A 3.2 Gen 2, 1x HDMI 2.1 8K@60Hz, 1x MicroSD',
          os: 'Windows 11 Pro',
          is_featured: false,
          is_new: true,
          rating: 4.9,
          review_count: 7,
          short_desc: 'Vỏ hợp kim Nhôm-Magiê Star Blue vũ trụ siêu mỏng dưới 2kg, trang bị pin 99.9Wh tối đa hàng không.',
          description: 'MSI Stealth 16 AI Studio sở hữu ngôn ngữ thiết kế phi thuyền tối giản Star Blue sang trọng. Máy vừa là cỗ máy đồ họa làm việc chuyên nghiệp ban ngày, vừa là vũ khí chiến game đồ họa cao ban đêm với hệ thống loa Dynaudio 6 loa vòm sống động.'
        }
      ];

      for (const p of productsData) {
        await connection.query(`
          INSERT INTO products (
            id, name, slug, brand_id, category_id, price, original_price, stock,
            target_use, cpu, ram, storage, gpu, screen, battery, weight, ports,
            os, is_featured, is_new, rating, review_count, short_desc, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.id, p.name, p.slug, p.brand_id, p.category_id, p.price, p.original_price, p.stock,
          p.target_use, p.cpu, p.ram, p.storage, p.gpu, p.screen, p.battery, p.weight, p.ports,
          p.os, p.is_featured, p.is_new, p.rating, p.review_count, p.short_desc, p.description
        ]);
      }

      // Seed Product Images: Ít nhất 3 góc chụp rõ nét cho mỗi laptop
      // Góc 1: Mở màn hình chính diện
      // Góc 2: Cạnh bên / Góc nghiêng mỏng nhẹ
      // Góc 3: Bàn phím / Mặt lưng vũ trụ
      const imagesData = [
        // Laptop 1: ASUS ROG Strix SCAR 18
        { product_id: 1, image_url: 'https://dlcdnwebimgs.asus.com/gain/4B54DA05-C385-4DC3-84B9-C608EB78B6FE/w1000/h750', caption: 'Góc chính diện màn hình 18 inch 240Hz', is_primary: true, display_order: 1 },
        { product_id: 1, image_url: 'https://dlcdnwebimgs.asus.com/gain/42EAFAC2-C57A-4FD2-A00D-52824C857876/w1000/h750', caption: 'Góc nghiêng cạnh bên tản nhiệt Aura Sync', is_primary: false, display_order: 2 },
        { product_id: 1, image_url: 'https://dlcdnwebimgs.asus.com/gain/97127B04-03BF-4F54-AE9A-D922718E3197/w1000/h750', caption: 'Góc cận cảnh bàn phím Per-Key RGB', is_primary: false, display_order: 3 },

        // Laptop 2: MacBook Pro 16 M3 Max
        { product_id: 2, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', caption: 'Góc chính diện Space Black Liquid Retina XDR', is_primary: true, display_order: 1 },
        { product_id: 2, image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80', caption: 'Góc mở máy nghiêng 45 độ mỏng nguyên khối', is_primary: false, display_order: 2 },
        { product_id: 2, image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80', caption: 'Góc cận cảnh bàn phím Magic Keyboard', is_primary: false, display_order: 3 },

        // Laptop 3: Dell XPS 16 9640
        { product_id: 3, image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80', caption: 'Góc chính diện màn hình vô cực InfinityEdge OLED 4K', is_primary: true, display_order: 1 },
        { product_id: 3, image_url: 'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=800&auto=format&fit=crop&q=80', caption: 'Góc nghiêng đường cắt CNC nhôm kim loại', is_primary: false, display_order: 2 },
        { product_id: 3, image_url: 'https://images.unsplash.com/photo-1593642634443-44adaa06623a?w=800&auto=format&fit=crop&q=80', caption: 'Góc mặt kính bàn rê chuột ẩn tàng hình', is_primary: false, display_order: 3 },

        // Laptop 4: Lenovo Legion Pro 7i
        { product_id: 4, image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80', caption: 'Góc chính diện mở màn hình 240Hz viền siêu mỏng', is_primary: true, display_order: 1 },
        { product_id: 4, image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80', caption: 'Góc nghiêng cạnh bên khe tản nhiệt buồng hơi', is_primary: false, display_order: 2 },
        { product_id: 4, image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80', caption: 'Góc bàn phím Legion TrueStrike RGB', is_primary: false, display_order: 3 },

        // Laptop 5: HP Spectre x360 14
        { product_id: 5, image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', caption: 'Góc mở màn hình chính diện chuẩn doanh nhân', is_primary: true, display_order: 1 },
        { product_id: 5, image_url: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&auto=format&fit=crop&q=80', caption: 'Góc xoay gập 360 độ siêu mỏng nhẹ', is_primary: false, display_order: 2 },
        { product_id: 5, image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80', caption: 'Góc cạnh vát kim cương Nightfall Black', is_primary: false, display_order: 3 },

        // Laptop 6: ThinkPad X1 Carbon Gen 12
        { product_id: 6, image_url: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop&q=80', caption: 'Góc chính diện mở màn hình chuẩn doanh nhân', is_primary: true, display_order: 1 },
        { product_id: 6, image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80', caption: 'Góc mở phẳng 180 độ đặc trưng', is_primary: false, display_order: 2 },
        { product_id: 6, image_url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80', caption: 'Góc bàn phím TrackPoint công thái học', is_primary: false, display_order: 3 },

        // Laptop 7: Acer Predator Helios 16
        { product_id: 7, image_url: 'https://static-ecapac.acer.com/media/catalog/product/p/r/predator_helios_16_ph16-72_rgb_wallpaper_01_1_2.png', caption: 'Góc chính diện màn hình Mini-LED 250Hz', is_primary: true, display_order: 1 },
        { product_id: 7, image_url: 'https://static-ecapac.acer.com/media/catalog/product/p/r/predator_helios_16_ph16-72_rgb_wallpaper_02_1_1.png', caption: 'Góc nghiêng thanh đèn RGB đuôi máy', is_primary: false, display_order: 2 },
        { product_id: 7, image_url: 'https://static-ecapac.acer.com/media/catalog/product/p/r/predator_helios_16_ph16-72_rgb_wallpaper_03_1.png', caption: 'Góc bàn phím cơ MagKey 3.0', is_primary: false, display_order: 3 },

        // Laptop 8: MSI Stealth 16 AI Studio
        { product_id: 8, image_url: 'https://asset.msi.com/resize/image/global/product/product_1704770281be276f5716dfd08c5c16dae9962a373b.png62405b38c58fe0f07fcdc23677851505/1024.png', caption: 'Góc chính diện Star Blue viền mỏng', is_primary: true, display_order: 1 },
        { product_id: 8, image_url: 'https://asset.msi.com/resize/image/global/product/product_1704770281b10620f4c935ee5ea4c885bc49c33659.png62405b38c58fe0f07fcdc23677851505/1024.png', caption: 'Góc nghiêng mỏng nhẹ dưới 2kg', is_primary: false, display_order: 2 },
        { product_id: 8, image_url: 'https://asset.msi.com/resize/image/global/product/product_17047702817d2a58bfa9df6554b73b50c0cfdcfe46.png62405b38c58fe0f07fcdc23677851505/1024.png', caption: 'Góc mặt lưng biểu tượng rồng MSI tàng hình', is_primary: false, display_order: 3 }
      ];

      for (const img of imagesData) {
        await connection.query(`
          INSERT INTO product_images (product_id, image_url, caption, is_primary, display_order)
          VALUES (?, ?, ?, ?, ?)
        `, [img.product_id, img.image_url, img.caption, img.is_primary, img.display_order]);
      }

      // Seed Accounts: Admin & Sample Customer
      console.log(`[InitDB] Seeding default Admin and Customer accounts with bcrypt hashes...`);
      const salt = await bcrypt.genSalt(10);
      const adminPasswordHash = await bcrypt.hash('admin123', salt);
      const userPasswordHash = await bcrypt.hash('user123', salt);

      const [adminResult] = await connection.query(`
        INSERT INTO users (id, username, email, password, full_name, address, phone, role)
        VALUES (1, 'admin', 'admin@hquantech.com', ?, 'Quản Trị Viên HQuanTech', 'Tòa nhà HQuanTech, Cầu Giấy, Hà Nội', '0988889999', 'admin')
      `, [adminPasswordHash]);

      const [userResult] = await connection.query(`
        INSERT INTO users (id, username, email, password, full_name, address, phone, role)
        VALUES (2, 'khachhang1', 'khachhang@gmail.com', ?, 'Nguyễn Hoàng Quân', 'Số 68 Đường Cầu Giấy, Hà Nội', '0912345678', 'user')
      `, [userPasswordHash]);

      // Seed 1 đơn hàng đã giao (delivered) cho khachhang1 đối với Laptop 1 (ASUS ROG Strix SCAR 18)
      // Để kích hoạt điều kiện "Chỉ ai đã mua mới đánh giá được"
      console.log(`[InitDB] Seeding sample delivered order and verified review...`);
      const [orderRes] = await connection.query(`
        INSERT INTO orders (
          order_code, user_id, customer_name, customer_email, customer_phone,
          shipping_address, payment_method, total_amount, discount_amount, status, notes
        ) VALUES (
          'HQT-ORD-2026-001', 2, 'Nguyễn Hoàng Quân', 'khachhang@gmail.com', '0912345678',
          'Số 68 Đường Cầu Giấy, Hà Nội', 'cod', 94990000, 0, 'delivered', 'Giao hàng hỏa tốc trong ngày'
        )
      `);

      const orderId = orderRes.insertId;
      await connection.query(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image_url)
        VALUES (?, 1, 'ASUS ROG Strix SCAR 18 (2026)', 94990000, 1, 'https://dlcdnwebimgs.asus.com/gain/4B54DA05-C385-4DC3-84B9-C608EB78B6FE/w1000/h750')
      `, [orderId]);

      // Seed 1 review mẫu của khachhang1 cho laptop 1
      await connection.query(`
        INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
        VALUES (1, 2, 'Nguyễn Hoàng Quân', 5, 'Máy thực sự quá đỉnh! Màn hình 18 inch Mini-LED siêu nét, chơi Cyberpunk 2077 max settings bật Ray Tracing vẫn trên 100 FPS mượt mà. Đóng gói rất kỹ, HQuanTech giao hàng cực nhanh!')
      `);

      console.log(`[InitDB] Sample data initialized successfully!`);
    } else {
      console.log(`[InitDB] Database already contains data. Skipping seeding.`);
    }

    console.log(`[InitDB] Database initialization finished successfully!`);
  } catch (error) {
    console.error(`[InitDB] Error during database initialization:`, error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
