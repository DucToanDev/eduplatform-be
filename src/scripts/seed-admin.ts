import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION;

if (!DB_CONNECTION) {
  console.error('Lỗi: Không tìm thấy DB_CONNECTION trong file .env');
  process.exit(1);
}

// Định nghĩa schema tạm thời để thao tác với collection users
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'TEACHER' },
  status: { type: Boolean, default: true },
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    console.log('Đang kết nối tới cơ sở dữ liệu...');
    await mongoose.connect(DB_CONNECTION as string);
    console.log('Kết nối Database thành công!');

    const adminEmail = 'admin@eduplatform.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️ Tài khoản Admin đã tồn tại trong hệ thống!');
      console.log(`Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      fullname: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      status: true,
    });

    await adminUser.save();
    console.log('✅ Tạo tài khoản Admin thành công!');
    console.log('-----------------------------------');
    console.log(`Email:    ${adminEmail}`);
    console.log('Password: admin123');
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi tạo tài khoản Admin:', error);
    process.exit(1);
  }
}

seedAdmin();
