import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const uri = process.env.DB_CONNECTION;
  if (!uri) throw new Error('No DB_CONNECTION');
  
  await mongoose.connect(uri);
  const ErrorLogSchema = new mongoose.Schema({
    message: String,
    stack: String,
    path: String,
    method: String,
    body: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
  });
  const ErrorLog = mongoose.model('ErrorLog', ErrorLogSchema, 'error_logs');
  const logs = await ErrorLog.find({ statusCode: 500 }).sort({ createdAt: -1 }).limit(10);
  
  console.log(JSON.stringify(logs, null, 2));
  await mongoose.disconnect();
}

run().catch(console.error);
