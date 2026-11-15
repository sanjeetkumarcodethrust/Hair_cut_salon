import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
        managedBranches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon'
    }],
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      validate: {
        validator: function (val) {
          if (!this.isModified('password')) return true;
          return (
            typeof val === 'string' &&
            val.length >= 8 &&
            /[A-Z]/.test(val) &&
            /[a-z]/.test(val) &&
            /[^A-Za-z0-9\s]/.test(val)
          );
        },
        message: 'Password must be at least 8 characters long and contain at least one capital letter, one small letter, and one symbol.',
      },
      select: false,
    },

    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },
    suspensionReason: String,

    loyaltyPoints: {
      type: Number,
      default: 0
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['customer', 'barber', 'owner', 'manager', 'admin'],
      default: 'customer',
    },
    profileImage: {
      type: String,
      default: 'default-avatar-url.jpg',
    },
    phone: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    address: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
