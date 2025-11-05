import mongoose from 'mongoose';

export interface IProduct {
  id?: string; // Firebase ID
  _id?: string; // MongoDB ID
  name: string;
  description?: string;
  wholesalePrice?: number;
  salePrice: number;
  stock?: number;
  category: string;
  image?: string;
  supplier?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  images: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product; 