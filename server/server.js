const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 [HQuanTech Server] running on http://localhost:${PORT}`);
  console.log(`🌌 Connected to MySQL XAMPP Database: ${process.env.DB_NAME || 'hquantech_db'}`);
  console.log(`====================================================`);
});
