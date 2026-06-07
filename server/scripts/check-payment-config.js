const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("🔍 Checking UPI Payment Configuration...\n");

// Check basic environment
console.log("📋 Basic Configuration:");
console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || "Not set"}`);
console.log(`✅ PORT: ${process.env.PORT || "Not set"}`);
console.log(`✅ FRONTEND_URL: ${process.env.FRONTEND_URL || "Not set"}`);
console.log(`✅ BACKEND_URL: ${process.env.BACKEND_URL || "Not set"}\n`);

// Check Razorpay configuration
console.log("💳 Razorpay Configuration:");
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (razorpayKeyId && razorpayKeyId !== "rzp_test_your_key_id_here") {
  console.log(`✅ RAZORPAY_KEY_ID: ${razorpayKeyId.substring(0, 15)}...`);
} else {
  console.log("❌ RAZORPAY_KEY_ID: Not configured (update in .env file)");
}

if (
  razorpayKeySecret &&
  razorpayKeySecret !== "your_razorpay_key_secret_here"
) {
  console.log(
    `✅ RAZORPAY_KEY_SECRET: ${razorpayKeySecret.substring(0, 10)}... (Hidden)`,
  );
} else {
  console.log("❌ RAZORPAY_KEY_SECRET: Not configured (update in .env file)");
}

if (
  razorpayWebhookSecret &&
  razorpayWebhookSecret !== "your_webhook_secret_here"
) {
  console.log(
    `✅ RAZORPAY_WEBHOOK_SECRET: ${razorpayWebhookSecret.substring(0, 10)}... (Hidden)`,
  );
} else {
  console.log(
    "❌ RAZORPAY_WEBHOOK_SECRET: Not configured (update in .env file)",
  );
}

// Check if Razorpay is properly configured
const razorpayConfigured =
  razorpayKeyId &&
  razorpayKeySecret &&
  razorpayKeyId !== "rzp_test_your_key_id_here" &&
  razorpayKeySecret !== "your_razorpay_key_secret_here";

console.log("\n🎯 Configuration Status:");
if (razorpayConfigured) {
  console.log("✅ Razorpay: Ready for payments!");

  // Test Razorpay connection
  console.log("\n🔗 Testing Razorpay Connection...");
  try {
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Test API call
    razorpay.payments
      .all({ count: 1 })
      .then(() => {
        console.log("✅ Razorpay API: Connection successful!");
        console.log("\n🚀 Your UPI payment system is ready!");
        console.log("\nNext steps:");
        console.log("1. Start your server: npm start");
        console.log("2. Test a payment in your app");
        console.log("3. Check Razorpay dashboard for transactions");
      })
      .catch((error) => {
        console.log("❌ Razorpay API: Connection failed");
        console.log("Error:", error.message);
        console.log("\nPlease check your API keys in .env file");
      });
  } catch (error) {
    console.log("❌ Razorpay package not installed");
    console.log("Run: npm install razorpay");
  }
} else {
  console.log("❌ Razorpay: Not configured");
  console.log("\n📝 To configure Razorpay:");
  console.log("1. Sign up at https://razorpay.com/");
  console.log("2. Get your API keys from dashboard");
  console.log("3. Update .env file with your keys");
  console.log("4. Run this script again to verify");
}

// Check PhonePe configuration
console.log("\n📱 PhonePe Configuration:");
const phonePeMerchantId = process.env.PHONEPE_MERCHANT_ID;
if (phonePeMerchantId && phonePeMerchantId !== "PGTESTPAYUAT") {
  console.log(`✅ PHONEPE_MERCHANT_ID: ${phonePeMerchantId}`);
} else {
  console.log("⚠️  PHONEPE_MERCHANT_ID: Using test credentials (optional)");
}

// Check Paytm configuration
console.log("\n💰 Paytm Configuration:");
const paytmMerchantId = process.env.PAYTM_MERCHANT_ID;
if (paytmMerchantId && paytmMerchantId !== "your_paytm_merchant_id_here") {
  console.log(`✅ PAYTM_MERCHANT_ID: ${paytmMerchantId}`);
} else {
  console.log("⚠️  PAYTM_MERCHANT_ID: Not configured (optional)");
}

console.log("\n" + "=".repeat(50));
console.log("💡 Tip: Focus on Razorpay first - it's the easiest to set up!");
console.log("📚 Read RAZORPAY_SETUP_GUIDE.md for detailed instructions");
console.log("=".repeat(50));
