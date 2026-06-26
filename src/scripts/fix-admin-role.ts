import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { UserRole } from '../modules/users/schemas/users.schema';
import { UsersDocument } from '../modules/users/schemas/users.schema';

dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION as string;

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const User = mongoose.model('User', userSchema);

async function fix() {
  await mongoose.connect(DB_CONNECTION);
  const result = await User.updateMany(
    { role: 'ADMIN' },
    { $set: { role: 'admin' } }
  );
  console.log(`Updated ${result.modifiedCount} admin users to lowercase role.`);
  process.exit(0);
}
fix();
