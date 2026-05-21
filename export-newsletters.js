const mongoose = require('mongoose');
const fs = require('fs');

// Newsletter modeli
const newsletterSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  companyName: String,
  addressCity: String,
  addressDistrict: String,
  addressStreet: String,
  addressBuildingNo: String,
  taxNumber: String,
  whatsappEnabled: Boolean,
  active: Boolean,
  subscriptionDate: Date,
  createdAt: Date,
  updatedAt: Date,
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

async function exportNewsletters() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bulten');
    
    // Tüm newsletter'ları çek
    const newsletters = await Newsletter.find({}).lean();
    
    // JSON dosyasına kaydet
    const exportData = {
      success: true,
      count: newsletters.length,
      data: newsletters,
      exportDate: new Date().toISOString()
    };
    
    fs.writeFileSync('newsletter-export.json', JSON.stringify(exportData, null, 2));
    
    console.log(`✅ ${newsletters.length} newsletter abonesi başarıyla export edildi!`);
    console.log('📁 Dosya: newsletter-export.json');
    
  } catch (error) {
    console.error('❌ Export hatası:', error);
  } finally {
    await mongoose.disconnect();
  }
}

exportNewsletters();
