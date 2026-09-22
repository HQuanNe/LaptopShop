const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const register = async (req, res) => {
  try {
    const { username, password, email, full_name, address, phone } = req.body;

    // Validate fields
    if (!username || !password || !email || !full_name || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin: tên đăng nhập, mật khẩu, email, họ tên, địa chỉ và số điện thoại'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có độ dài từ 6 ký tự trở lên'
      });
    }

    // Check duplicate
    const [existing] = await pool.query(
      'SELECT id, username, email FROM users WHERE username = ? OR email = ?',
      [username.trim(), email.trim()]
    );

    if (existing.length > 0) {
      const isUsername = existing.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
      return res.status(400).json({
        success: false,
        message: isUsername ? 'Tên đăng nhập này đã được sử dụng' : 'Email này đã được đăng ký'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (username, password, email, full_name, address, phone, role)
       VALUES (?, ?, ?, ?, ?, ?, 'user')`,
      [username.trim(), hashedPassword, email.trim(), full_name.trim(), address.trim(), phone.trim()]
    );

    const userId = result.insertId;

    // Generate JWT
    const token = jwt.sign({ id: userId, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      token,
      user: {
        id: userId,
        username: username.trim(),
        email: email.trim(),
        full_name: full_name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đăng ký tài khoản' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên đăng nhập (hoặc email) và mật khẩu'
      });
    }

    // Find user by username or email
    const [users] = await pool.query(
      `SELECT id, username, email, password, full_name, address, phone, role
       FROM users WHERE username = ? OR email = ?`,
      [username.trim(), username.trim()]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác'
      });
    }

    const user = users[0];

    // Check bcrypt password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác'
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        address: user.address,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng nhập' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy thông tin tài khoản' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, address, phone } = req.body;
    await pool.query(
      `UPDATE users SET full_name = ?, address = ?, phone = ? WHERE id = ?`,
      [full_name, address, phone, req.user.id]
    );

    const [updated] = await pool.query(
      'SELECT id, username, email, full_name, address, phone, role FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: updated[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật hồ sơ cá nhân' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
