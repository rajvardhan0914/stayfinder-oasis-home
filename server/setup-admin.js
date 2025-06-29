const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔒 StayFinder Admin Setup');
console.log('========================\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAdmin() {
  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    const envExists = fs.existsSync(envPath);
    
    if (envExists) {
      console.log('⚠️  .env file already exists. This will overwrite it.');
      const confirm = await question('Do you want to continue? (y/N): ');
      if (confirm.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }
    
    console.log('Please provide the following information:\n');
    
    // Get admin email
    const adminEmail = await question('Admin Email: ');
    if (!adminEmail || !adminEmail.includes('@')) {
      console.log('❌ Invalid email address');
      rl.close();
      return;
    }
    
    // Get admin password
    const adminPassword = await question('Admin Password (min 8 characters): ');
    if (!adminPassword || adminPassword.length < 8) {
      console.log('❌ Password must be at least 8 characters long');
      rl.close();
      return;
    }
    
    // Generate JWT secret
    const jwtSecret = require('crypto').randomBytes(32).toString('hex');
    
    // Hash the password
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    
    // Create .env content
    const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/stayfinder

# JWT Configuration
JWT_SECRET=${jwtSecret}

# Admin Credentials
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD=${hashedPassword}

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
`;
    
    // Write .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Admin setup completed successfully!');
    console.log('📧 Admin Email:', adminEmail);
    console.log('🔑 Password: [HIDDEN]');
    console.log('🔐 JWT Secret: [GENERATED]');
    console.log('\n🚀 Please restart your server to apply changes:');
    console.log('   npm run dev');
    console.log('\n💡 You can now log in with these credentials in the admin panel.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupAdmin(); 