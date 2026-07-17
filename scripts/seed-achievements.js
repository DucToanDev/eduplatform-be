const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const achievements = [
  {
    title: 'Tân Binh Gia Nhập',
    description: 'Chào mừng em gia nhập hệ thống. Một hành trình mới bắt đầu!',
    badge_url: 'https://cdn-icons-png.flaticon.com/512/1000/1000997.png',
    condition_type: 'FIRST_LOGIN',
    condition_value: 1,
    point_reward: 10,
  },
  {
    title: 'Gương Mặt Mới',
    description: 'Tuyệt vời, em đã cập nhật ảnh đại diện của riêng mình.',
    badge_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    condition_type: 'AVATAR_UPDATED',
    condition_value: 1,
    point_reward: 15,
  },
  {
    title: 'Bước Chân Đầu Tiên',
    description: 'Dũng cảm bước đi đầu tiên! Em đã hoàn thành bài học mở đầu.',
    badge_url: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
    condition_type: 'LESSONS_COMPLETED',
    condition_value: 1,
    point_reward: 20,
  },
  {
    title: 'Điểm 10 Tuyệt Đối',
    description: 'Không có gì làm khó được em. Đạt điểm tối đa trong bài kiểm tra.',
    badge_url: 'https://cdn-icons-png.flaticon.com/512/5405/5405908.png',
    condition_type: 'QUIZ_SCORE',
    condition_value: 100,
    point_reward: 50,
  },
  {
    title: 'Chăm Ngoan',
    description: 'Học tập không ngừng nghỉ! Đăng nhập 3 ngày liên tiếp.',
    badge_url: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png',
    condition_type: 'LOGIN_STREAK',
    condition_value: 3,
    point_reward: 30,
  },
  {
    title: 'Học Giả Nhí',
    description: 'Chăm chỉ tích tiểu thành đại. Hoàn thành 10 bài học.',
    badge_url: 'https://cdn-icons-png.flaticon.com/512/2916/2916315.png',
    condition_type: 'LESSONS_COMPLETED',
    condition_value: 10,
    point_reward: 50,
  },
  {
    title: 'Nhanh Như Chớp',
    description: 'Tốc độ ánh sáng! Nộp bài tập trước thời hạn.',
    badge_url: 'https://cdn-icons-png.flaticon.com/512/2814/2814368.png',
    condition_type: 'QUIZ_EARLY_SUBMIT',
    condition_value: 1,
    point_reward: 40,
  },
  {
    title: 'Chiến Binh Cuối Tuần',
    description: 'Ai nghỉ cứ nghỉ, ta vẫn học! Hoạt động vào Thứ 7, Chủ Nhật.',
    badge_url: 'https://cdn-icons-png.flaticon.com/512/2822/2822606.png',
    condition_type: 'WEEKEND_WARRIOR',
    condition_value: 1,
    point_reward: 50,
  }
];

const achievementSchema = new mongoose.Schema({
  title: String,
  description: String,
  badge_url: String,
  condition_type: String,
  condition_value: Number,
  point_reward: Number,
}, { timestamps: true });

const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

async function seed() {
  try {
    const uri = process.env.DB_CONNECTION;
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    await Achievement.deleteMany({});
    console.log('Cleared old achievements');

    await Achievement.insertMany(achievements);
    console.log('Seeded 8 new achievements successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
