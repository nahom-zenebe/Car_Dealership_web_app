#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envTemplate = `# Database
DATABASE_URL="mongodb://localhost:27017/car_dealership"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret_here"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# SMTP (for email notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_email_password_or_app_password"

# JWT Secret
JWT_SECRET="your_jwt_secret_key_here"
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Skipping creation.');
  console.log('Please check your environment variables are properly set.');
} else {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file with template values.');
  console.log('📝 Please update the values in .env.local with your actual credentials:');
  console.log('');
  console.log('1. Get your Stripe keys from: https://dashboard.stripe.com/apikeys');
  console.log('2. Get your Cloudinary credentials from: https://cloudinary.com/console');
  console.log('3. Set up your SMTP credentials for email notifications');
  console.log('4. Generate a secure JWT secret (you can use: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))")');
  console.log('');
  console.log('⚠️  IMPORTANT: Never commit .env.local to version control!');
}

console.log('');
console.log('🔧 Next steps:');
console.log('1. Update .env.local with your actual credentials');
console.log('2. Run: npm run dev');
console.log('3. Test the purchase flow'); 