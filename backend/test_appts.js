import 'dotenv/config.js';
import connectDB from './config/db.js';
import Appointment from './models/Appointment.js';

connectDB().then(async () => {
  const appts = await Appointment.find().sort({createdAt: -1}).limit(5).lean();
  console.log(JSON.stringify(appts, null, 2));
  process.exit(0);
}).catch(e => {
  console.log(e);
  process.exit(1);
});
