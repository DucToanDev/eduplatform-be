const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndex() {
  try {
    const uri = process.env.DB_CONNECTION;
    if (!uri) {
      console.error('Không tìm thấy biến môi trường DB_CONNECTION');
      process.exit(1);
    }
    
    console.log('Đang kết nối tới Database...');
    await mongoose.connect(uri);
    
    const db = mongoose.connection.db;
    const collection = db.collection('class_enrollments');
    
    console.log('Đang kiểm tra các indexes hiện tại...');
    const indexes = await collection.indexes();
    console.log(indexes.map(i => i.name));
    
    const hasOldIndex = indexes.some(i => i.name === 'student_id_1');
    
    if (hasOldIndex) {
      console.log('Phát hiện index cũ student_id_1. Đang tiến hành xóa...');
      await collection.dropIndex('student_id_1');
      console.log('Xóa index thành công! Học sinh giờ đã có thể thêm vào nhiều lớp.');
    } else {
      console.log('Không tìm thấy index student_id_1. Có thể nó đã được xóa từ trước.');
    }
    
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixIndex();
