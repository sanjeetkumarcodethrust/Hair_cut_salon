import 'dotenv/config.js';
import connectDB from './config/db.js';
import User from './models/User.js';
import Appointment from './models/Appointment.js';

connectDB().then(async () => {
  const users = await User.find().sort({createdAt: -1}).limit(5).lean();
  console.log("Recent users:", JSON.stringify(users.map(u => ({ id: u._id, name: u.name, role: u.role })), null, 2));
  
  const appts = await Appointment.find().sort({createdAt: -1}).limit(2).lean();
  console.log("Recent appts customer IDs:", appts.map(a => a.customer.toString()));
  process.exit(0);
}).catch(e => {
  console.log(e);
  process.exit(1);
});
