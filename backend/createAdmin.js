require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashed
    });
    console.log('✅ Admin user created: username=admin, password=admin123');
    process.exit();
  })
  .catch(err => console.error(err));
