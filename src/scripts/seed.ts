import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { Types } from 'mongoose';

dotenv.config();

const uri = process.env.DB_CONNECTION;

if (!uri) {
  console.error('Missing DB_CONNECTION in .env file');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection failed');
    }

    console.log('Clearing old data...');
    const collectionsToClear = [
      'users',
      'student_profiles',
      'teacher_profiles',
      'course_categories',
      'courses',
      'classes',
      'class_enrollments',
      'lessons',
      'lesson_materials',
      'storeitems',
      'studentinventories',
      'rewardhistories',
    ];

    for (const collName of collectionsToClear) {
      try {
        await db.collection(collName).deleteMany({});
      } catch (e) {
        console.log(`Collection ${collName} might not exist yet.`);
      }
    }

    console.log('Generating seed data...');

    const defaultPassword = '123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    const now = new Date();

    const generateUser = (id: Types.ObjectId, username: string, fullname: string, role: string, email: string) => ({
      _id: id,
      username,
      fullname,
      role,
      email,
      password: hashedPassword,
      raw_password: defaultPassword,
      status: true,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=f97316&color=ffffff&size=128`,
      createdAt: now,
      updatedAt: now,
    });

    // 1. Create Users
    const adminId = new Types.ObjectId();
    const managerId = new Types.ObjectId();
    const teacher1Id = new Types.ObjectId();
    const teacher2Id = new Types.ObjectId();
    const parent1Id = new Types.ObjectId();
    const parent2Id = new Types.ObjectId();
    const student1Id = new Types.ObjectId();
    const student2Id = new Types.ObjectId();
    const student3Id = new Types.ObjectId();
    const student4Id = new Types.ObjectId();

    const users = [
      generateUser(adminId, 'admin', 'Quản Trị Viên', 'admin', 'admin@edu.com'),
      generateUser(managerId, 'manager', 'Quản Lý Học Tập', 'manager', 'manager@edu.com'),
      generateUser(teacher1Id, 'giaovien1', 'Cô Giáo Tâm', 'teacher', 'gv1@edu.com'),
      generateUser(teacher2Id, 'giaovien2', 'Thầy Giáo Sơn', 'teacher', 'gv2@edu.com'),
      generateUser(parent1Id, 'phuhuynh1', 'Phụ Huynh Bé Nam', 'parent', 'ph1@edu.com'),
      generateUser(parent2Id, 'phuhuynh2', 'Phụ Huynh Bé Mai', 'parent', 'ph2@edu.com'),
      generateUser(student1Id, 'hocsinh1', 'Học sinh Nam', 'student', 'hs1@edu.com'),
      generateUser(student2Id, 'hocsinh2', 'Học sinh Mai', 'student', 'hs2@edu.com'),
      generateUser(student3Id, 'hocsinh3', 'Học sinh Bách', 'student', 'hs3@edu.com'),
      generateUser(student4Id, 'hocsinh4', 'Học sinh Lan', 'student', 'hs4@edu.com'),
    ];

    await db.collection('users').insertMany(users);

    // 2. Create Student Profiles
    const studentProfiles = [
      {
        _id: new Types.ObjectId(),
        user_id: student1Id,
        teacher_id: teacher1Id,
        points: 10000,
        parent_access_codes: 'PAC-NAM-123',
        grade_level: 'Lớp 10',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: new Types.ObjectId(),
        user_id: student2Id,
        teacher_id: teacher1Id,
        points: 10000,
        parent_access_codes: 'PAC-MAI-123',
        grade_level: 'Lớp 10',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: new Types.ObjectId(),
        user_id: student3Id,
        teacher_id: teacher2Id,
        points: 10000,
        parent_access_codes: 'PAC-BACH-123',
        grade_level: 'Lớp 11',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: new Types.ObjectId(),
        user_id: student4Id,
        teacher_id: teacher2Id,
        points: 10000,
        parent_access_codes: 'PAC-LAN-123',
        grade_level: 'Lớp 11',
        createdAt: now,
        updatedAt: now,
      },
    ];

    await db.collection('student_profiles').insertMany(studentProfiles);

    // 3. Create Course Categories
    const catMathId = new Types.ObjectId();
    const catEngId = new Types.ObjectId();
    const catSciId = new Types.ObjectId();

    const categories = [
      { _id: catMathId, name: 'Toán Học', description: 'Các khóa học Toán', is_active: true, createdAt: now, updatedAt: now },
      { _id: catEngId, name: 'Tiếng Anh', description: 'Các khóa học Tiếng Anh', is_active: true, createdAt: now, updatedAt: now },
      { _id: catSciId, name: 'Khoa Học', description: 'Khám phá thế giới', is_active: true, createdAt: now, updatedAt: now },
    ];

    await db.collection('course_categories').insertMany(categories);

    // 4. Create Courses
    const course1Id = new Types.ObjectId();
    const course2Id = new Types.ObjectId();
    const course3Id = new Types.ObjectId();

    const courses = [
      {
        _id: course1Id,
        author_id: teacher1Id,
        title: 'Toán Cơ Bản Lớp 10',
        description: 'Khóa học lấy gốc Toán 10',
        category: catMathId,
        status: 'PUBLISHED',
        price: 500000,
        is_demo: false,
        is_marketplace: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca9?w=500&q=80',
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: course2Id,
        author_id: teacher1Id,
        title: 'Tiếng Anh Giao Tiếp Demo',
        description: 'Học tiếng anh giao tiếp',
        category: catEngId,
        status: 'PUBLISHED',
        price: 0,
        is_demo: true,
        is_marketplace: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=500&q=80',
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: course3Id,
        author_id: teacher2Id,
        title: 'Khoa Học Vui Lớp 11',
        description: 'Vật lý và Hóa học ứng dụng',
        category: catSciId,
        status: 'PUBLISHED',
        price: 300000,
        is_demo: false,
        is_marketplace: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&q=80',
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await db.collection('courses').insertMany(courses);

    // 5. Create Classes and Lessons
    const class1Id = new Types.ObjectId();
    const lesson1Id = new Types.ObjectId();
    const lesson2Id = new Types.ObjectId();

    await db.collection('classes').insertMany([
      {
        _id: class1Id,
        class_name: 'Lớp Toán 10A1',
        teacher_id: teacher1Id,
        course_id: course1Id,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      }
    ]);

    await db.collection('class_enrollments').insertMany([
      {
        _id: new Types.ObjectId(),
        class_id: class1Id,
        student_id: student1Id,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: new Types.ObjectId(),
        class_id: class1Id,
        student_id: student2Id,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      }
    ]);

    await db.collection('lessons').insertMany([
      {
        _id: lesson1Id,
        class_id: class1Id,
        title: 'Bài 1: Mệnh Đề',
        content: 'Nội dung bài học mệnh đề...',
        order_index: 1,
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: lesson2Id,
        class_id: class1Id,
        title: 'Bài 2: Tập Hợp',
        content: 'Nội dung bài học tập hợp...',
        order_index: 2,
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      }
    ]);

    await db.collection('lesson_materials').insertMany([
      {
        _id: new Types.ObjectId(),
        lesson_id: lesson1Id,
        material_type: 'DOCX',
        url: 'https://example.com/tailieu1.docx',
        order_index: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: new Types.ObjectId(),
        lesson_id: lesson1Id,
        material_type: 'IMG',
        url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80',
        order_index: 2,
        createdAt: now,
        updatedAt: now,
      }
    ]);

    // 6. Create Store Items
    const storeAvatar1Id = new Types.ObjectId();
    const storeFrame1Id = new Types.ObjectId();
    const storePhysical1Id = new Types.ObjectId();

    const storeItems = [
      {
        _id: storeAvatar1Id,
        teacher_id: teacher1Id,
        type: 'avatar',
        name: 'Avatar Cú Đêm',
        description: 'Dành cho cú đêm học bài',
        points: 500,
        stock: 50,
        sold_count: 0,
        image_url: 'https://res.cloudinary.com/ds52btbjy/image/upload/v1782660562/sticker/z7970678589642_05ef4184a404757bb738d7a6da18ea33_rtihnl.jpg',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: storeFrame1Id,
        teacher_id: teacher1Id,
        type: 'frame',
        name: 'Khung Rồng Lửa VIP',
        description: 'Khung avatar rực cháy',
        points: 1000,
        stock: 10,
        sold_count: 0,
        image_url: 'https://example.com/khung-rong-lua.png',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: storePhysical1Id,
        teacher_id: teacher1Id,
        type: 'physical',
        name: 'Sticker Hổ',
        description: 'Gửi về tận nhà',
        points: 200,
        stock: 100,
        sold_count: 0,
        image_url: 'https://res.cloudinary.com/ds52btbjy/image/upload/v1782660561/sticker/z7970678587484_0741244e565a2463747752e1f7b406a2_l8yrdg.jpg',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      }
    ];

    await db.collection('storeitems').insertMany(storeItems);

    // 7. Create Student Inventory
    await db.collection('studentinventories').insertMany([
      {
        _id: new Types.ObjectId(),
        student_id: student1Id,
        item_id: storeAvatar1Id,
        type: 'avatar',
        points: 500,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: new Types.ObjectId(),
        student_id: student1Id,
        item_id: storeFrame1Id,
        type: 'frame',
        points: 1000,
        active: true,
        createdAt: now,
        updatedAt: now,
      }
    ]);

    // Set Avatar & Frame for Student 1
    await db.collection('users').updateOne(
      { _id: student1Id },
      { 
        $set: { 
          avatar_url: 'https://res.cloudinary.com/ds52btbjy/image/upload/v1782660562/sticker/z7970678589642_05ef4184a404757bb738d7a6da18ea33_rtihnl.jpg',
          frame_url: 'https://example.com/khung-rong-lua.png'
        } 
      }
    );

    // 8. Add Learning Rewards
    await db.collection('rewardhistories').insertMany([
      {
        _id: new Types.ObjectId(),
        student_id: student1Id,
        teacher_id: teacher1Id,
        points_awarded: 5000,
        reason: 'Làm bài xuất sắc',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: new Types.ObjectId(),
        student_id: student1Id,
        teacher_id: teacher1Id,
        points_awarded: 5000,
        reason: 'Điểm danh chuyên cần',
        createdAt: now,
        updatedAt: now,
      }
    ]);

    console.log('Seed data successfully generated! 🌱');

  } catch (error) {
    console.error('Seed execution failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
