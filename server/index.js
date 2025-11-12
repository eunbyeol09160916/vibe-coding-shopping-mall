require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Middleware
// CORS 설정: 프로덕션에서는 CLIENT_URL 환경 변수 사용, 개발 환경에서는 모든 origin 허용
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (비동기로 실행, 실패해도 서버는 계속 실행)
connectDB().catch(err => {
  console.log('MongoDB 연결 시도 중...');
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// User routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Product routes
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

// Cart routes
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

// Order routes
const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Heroku는 PORT 환경 변수를 자동으로 제공하므로 이를 사용
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
  if (process.env.CLIENT_URL) {
    console.log(`📡 허용된 클라이언트 URL: ${process.env.CLIENT_URL}`);
  }
});

