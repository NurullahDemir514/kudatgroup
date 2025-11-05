import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
  },
  companyName: {
    type: String,
  },
  addressCity: {
    type: String,
    required: true,
  },
  addressDistrict: {
    type: String,
  },
  addressStreet: {
    type: String,
  },
  addressBuildingNo: {
    type: String,
  },
  taxNumber: {
    type: String,
  },
  whatsappEnabled: {
    type: Boolean,
    default: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  subscriptionDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);
export default Newsletter; 