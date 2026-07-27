const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Types } = mongoose;

async function run() {
  const uri = process.env.DB_CONNECTION || "mongodb+srv://pductoandev_db_user:ductoandev@edu-platform.liogl7v.mongodb.net/edu-platform?retryWrites=true&w=majority&appName=edu-platform";
  await mongoose.connect(uri);
  
  try {
    const db = mongoose.connection.db;
    
    // IDs
    const teacherId = new Types.ObjectId();
    const studentId = new Types.ObjectId();
    const courseId = new Types.ObjectId();
    const classId = new Types.ObjectId();
    const pathId = new Types.ObjectId();
    const lesson1Id = new Types.ObjectId();
    const lesson2Id = new Types.ObjectId();
    const lesson3Id = new Types.ObjectId();
    const lesson4Id = new Types.ObjectId();

    console.log("Đang khởi tạo dữ liệu...");

    // Users
    await db.collection('users').insertMany([
      { _id: teacherId, role: 'teacher', fullname: 'GV Seed Lộ Trình', email: 'gv_seed@edu.com' },
      { _id: studentId, role: 'student', fullname: 'HS Seed Lộ Trình', email: 'hs_seed@edu.com' }
    ]);
    
    // Course
    await db.collection('courses').insertOne({
      _id: courseId,
      author_id: teacherId,
      title: "Khóa học Lộ Trình Có Điều Kiện",
      is_deleted: false
    });

    // Class
    await db.collection('classes').insertOne({
      _id: classId,
      class_name: "Lớp Thực hành Điều Kiện Mở Khóa",
      teacher_id: teacherId,
      course_id: courseId,
      status: 'active'
    });
    
    // Class Enrollment
    await db.collection('classenrollments').insertOne({
      class_id: classId,
      student_id: studentId,
      joined_date: new Date()
    });
    
    // Lessons
    await db.collection('lessons').insertMany([
      { _id: lesson1Id, class_id: classId, title: 'Bài 1: Khởi đầu (Không điều kiện)', order_index: 1, prerequisite_lessons: [], is_deleted: false },
      { _id: lesson2Id, class_id: classId, title: 'Bài 2: Nâng cao (Cần xong Bài 1)', order_index: 2, prerequisite_lessons: [lesson1Id], is_deleted: false },
      { _id: lesson3Id, class_id: classId, title: 'Bài 3: Thực hành (Cần xong Bài 2)', order_index: 3, prerequisite_lessons: [lesson2Id], is_deleted: false },
      { _id: lesson4Id, class_id: classId, title: 'Bài 4: Trùm cuối (Cần xong Bài 2 và 3)', order_index: 4, prerequisite_lessons: [lesson2Id, lesson3Id], is_deleted: false },
    ]);
    
    // Learning Path
    await db.collection('learningpaths').insertOne({
      _id: pathId,
      class_id: classId,
      title: 'Lộ trình Chinh phục 4 Ải',
      stages: [
        {
          stage_name: 'Giai đoạn 1',
          lessons: [
            { lesson_id: lesson1Id, order_index: 1 },
            { lesson_id: lesson2Id, order_index: 2 }
          ]
        },
        {
          stage_name: 'Giai đoạn 2',
          lessons: [
            { lesson_id: lesson3Id, order_index: 1 },
            { lesson_id: lesson4Id, order_index: 2 }
          ]
        }
      ]
    });
    
    // Progress: Student completed Bài 1 and Bài 2
    await db.collection('studentprogresses').insertMany([
      { student_id: studentId, lesson_id: lesson1Id, is_completed: true, completed_at: new Date(), score: 100 },
      { student_id: studentId, lesson_id: lesson2Id, is_completed: true, completed_at: new Date(), score: 90 },
      { student_id: studentId, lesson_id: lesson3Id, is_completed: false, score: 0 } // chưa hoàn thành
    ]);
    
    // Generate JWT
    const jwtSecret = 'edu_plat_form_bla_bla_1234_T1_number_1'; // Từ .env
    const studentToken = jwt.sign({ id: studentId.toString(), role: 'student' }, jwtSecret, { expiresIn: '7d' });
    const teacherToken = jwt.sign({ id: teacherId.toString(), role: 'teacher' }, jwtSecret, { expiresIn: '7d' });

    console.log('\n======================================================');
    console.log('✅ SEED THÀNH CÔNG ĐẦY ĐỦ DỮ LIỆU LOGIC (REALISTIC)');
    console.log('======================================================');
    console.log(`Lớp học (Class ID): ${classId.toString()}`);
    console.log(`\nTình trạng của Học sinh (${studentId.toString()}):`);
    console.log(' - Đã hoàn thành: Bài 1, Bài 2.');
    console.log(' - Đang học giở: Bài 3.');
    
    console.log('\n🔥 KẾT QUẢ KỲ VỌNG TRÊN LỘ TRÌNH:');
    console.log(' - Bài 1: Mở khóa (is_locked: false) vì không có điều kiện.');
    console.log(' - Bài 2: Mở khóa (is_locked: false) vì đã học xong Bài 1.');
    console.log(' - Bài 3: Mở khóa (is_locked: false) vì đã học xong Bài 2.');
    console.log(' - Bài 4: BỊ KHÓA (is_locked: true) vì BÀI 3 CHƯA HOÀN THÀNH (Dù đã xong Bài 2).');
    
    console.log('\n--- THÔNG TIN ĐỂ SẾP TEST (MỞ POSTMAN/SWAGGER) ---');
    console.log(`1. Test Lộ trình (Learning Path): GET /learning-paths/class/${classId}`);
    console.log(`2. Test Chặn Truy Cập (403): GET /lessons/${lesson4Id}`);
    console.log(`\n🔑 Bearer Token (STUDENT):\n${studentToken}\n`);
    console.log(`🔑 Bearer Token (TEACHER - Để test bypass admin/teacher):\n${teacherToken}`);
    console.log('======================================================');
    
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(console.error);
