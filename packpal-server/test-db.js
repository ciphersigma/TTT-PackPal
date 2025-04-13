const mongoose = require('mongoose');

// Connect with explicit IPv4 address
mongoose.connect('mongodb://127.0.0.1:27017/packpal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log(`Timestamp: 2025-04-12 11:04:52`);
  console.log(`User: ciphersigma`);
  
  // Create a test document
  const Test = mongoose.model('Test', new mongoose.Schema({
    name: String,
    date: Date
  }));
  
  return Test.create({
    name: 'ciphersigma',
    date: new Date('2025-04-12 11:04:52')
  });
})
.then((result) => {
  console.log('✅ Test data created:', result);
  mongoose.connection.close();
})
.catch(err => {
  console.error('❌ Connection error:', err.message);
  console.log('\n🔍 TROUBLESHOOTING:');
  console.log('1. Check if MongoDB service is running: net start MongoDB');
  console.log('2. Check if MongoDB is listening on port 27017');
  console.log('3. Ensure no firewall is blocking the connection');
  console.log('4. Try starting MongoDB manually:');
  console.log('   "C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe" --dbpath="C:\\data\\db"');
  console.log('5. Check MongoDB logs for errors');
  
  process.exit(1);
});