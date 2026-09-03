import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=200&h=200&fit=crop',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Business = mongoose.model('Business', businessSchema);
export default Business;
