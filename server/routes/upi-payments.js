const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");
const auth = require("../middleware/auth");
const crypto = require("crypto");

// UPI Payment Gateway Configuration
const UPI_CONFIG = {
  // Razorpay UPI Configuration
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_key",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "webhook_secret",
  },

  // PhonePe Configuration
  phonepe: {
    merchantId: process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT",
    saltKey:
      process.env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399",
    saltIndex: process.env.PHONEPE_SALT_INDEX || "1",
    apiEndpoint:
      process.env.PHONEPE_API_ENDPOINT ||
      "https://api-preprod.phonepe.com/apis/pg-sandbox",
  },

  // Paytm Configuration
  paytm: {
    merchantId: process.env.PAYTM_MERCHANT_ID || "test_merchant",
    merchantKey: process.env.PAYTM_MERCHANT_KEY || "test_key",
    website: process.env.PAYTM_WEBSITE || "WEBSTAGING",
    industryType: process.env.PAYTM_INDUSTRY_TYPE || "Retail",
  },
};

// Get Razorpay Configuration for Frontend
router.get("/razorpay-config", auth, async (req, res) => {
  try {
    res.json({
      keyId: UPI_CONFIG.razorpay.keyId,
      currency: "INR",
    });
  } catch (error) {
    console.error("Error getting Razorpay config:", error);
    res.status(500).json({ message: "Failed to get payment configuration" });
  }
});

// Create Razorpay Order
// router.post("/create-order", auth, async (req, res) => {
//   try {
//     const { amount, registrationId, customerInfo } = req.body;

//     const Razorpay = require("razorpay");
//     const razorpay = new Razorpay({
//       key_id: UPI_CONFIG.razorpay.keyId,
//       key_secret: UPI_CONFIG.razorpay.keySecret,
//     });

//     const options = {
//       amount: amount * 100, // Convert to paise
//       currency: "INR",
//       receipt: `receipt_${registrationId || Date.now()}`,
//       notes: {
//         registrationId: registrationId || "temp",
//         customerName: customerInfo?.name || "Patient",
//       },
//     };

//     const order = await razorpay.orders.create(options);

//     res.json({
//       success: true,
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       keyId: UPI_CONFIG.razorpay.keyId,
//     });
//   } catch (error) {
//     console.error("Error creating Razorpay order:", error);
//     res.status(500).json({ message: "Failed to create payment order" });
//   }
// });

router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount, registrationId, customerInfo } = req.body;

    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: UPI_CONFIG.razorpay.keyId,
      key_secret: UPI_CONFIG.razorpay.keySecret,
    });

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${registrationId || Date.now()}`,
      notes: {
        registrationId: registrationId || "temp",
        customerName: customerInfo?.name || "Patient",
      },
    };

    // 🔥 YAHAN DAALNA HAI (order banne se pehle)
    console.log("Creating Razorpay order...");

    const order = await razorpay.orders.create(options);

    // 🔥 YAHAN DAALNA HAI (order banne ke baad)
    console.log("Order:", order);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: UPI_CONFIG.razorpay.keyId,
    });

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

// Generate UPI Payment Link
router.post("/generate-payment-link", auth, async (req, res) => {
  try {
    const { registrationId, amount, paymentMethod = "razorpay" } = req.body;

    // Get registration details
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const orderId = `ORDER_${registration.labCode}_${Date.now()}`;
    const customerInfo = {
      name: registration.patient.name,
      email: registration.patient.email || "patient@example.com",
      contact: registration.patient.mobile,
    };

    let paymentLink;

    switch (paymentMethod) {
      case "razorpay":
        paymentLink = await generateRazorpayLink(
          orderId,
          amount,
          customerInfo,
          registrationId,
        );
        break;
      case "phonepe":
        paymentLink = await generatePhonePeLink(
          orderId,
          amount,
          customerInfo,
          registrationId,
        );
        break;
      case "paytm":
        paymentLink = await generatePaytmLink(
          orderId,
          amount,
          customerInfo,
          registrationId,
        );
        break;
      default:
        return res.status(400).json({ message: "Invalid payment method" });
    }

    // Store payment details in registration
    registration.paymentDetails = {
      orderId,
      paymentMethod,
      paymentLink,
      amount,
      status: "pending",
      createdAt: new Date(),
    };
    await registration.save();

    res.json({
      success: true,
      paymentLink,
      orderId,
      qrCode: generateUPIQRCode(paymentLink, amount, registration.patient.name),
    });
  } catch (error) {
    console.error("Error generating payment link:", error);
    res.status(500).json({ message: "Failed to generate payment link" });
  }
});

// Razorpay Payment Link Generation
async function generateRazorpayLink(
  orderId,
  amount,
  customerInfo,
  registrationId,
) {
  const Razorpay = require("razorpay");

  const razorpay = new Razorpay({
    key_id: UPI_CONFIG.razorpay.keyId,
    key_secret: UPI_CONFIG.razorpay.keySecret,
  });

  const paymentLinkRequest = {
    amount: amount * 100, // Convert to paise
    currency: "INR",
    accept_partial: false,
    first_min_partial_amount: 100,
    description: `Payment for Lab Test - ${orderId}`,
    customer: {
      name: customerInfo.name,
      email: customerInfo.email,
      contact: customerInfo.contact,
    },
    notify: {
      sms: true,
      email: true,
    },
    reminder_enable: true,
    notes: {
      registrationId,
      orderId,
    },
    callback_url: `${process.env.FRONTEND_URL}/payment-success`,
    callback_method: "get",
  };

  const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);
  return paymentLink.short_url;
}

// PhonePe Payment Link Generation
async function generatePhonePeLink(
  orderId,
  amount,
  customerInfo,
  registrationId,
) {
  const axios = require("axios");

  const payload = {
    merchantId: UPI_CONFIG.phonepe.merchantId,
    merchantTransactionId: orderId,
    merchantUserId: `USER_${registrationId}`,
    amount: amount * 100, // Convert to paise
    redirectUrl: `${process.env.FRONTEND_URL}/payment-success`,
    redirectMode: "POST",
    callbackUrl: `${process.env.BACKEND_URL}/api/upi-payments/phonepe-callback`,
    mobileNumber: customerInfo.contact,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const checksum =
    crypto
      .createHash("sha256")
      .update(base64Payload + "/pg/v1/pay" + UPI_CONFIG.phonepe.saltKey)
      .digest("hex") +
    "###" +
    UPI_CONFIG.phonepe.saltIndex;

  const response = await axios.post(
    `${UPI_CONFIG.phonepe.apiEndpoint}/pg/v1/pay`,
    {
      request: base64Payload,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
    },
  );

  return response.data.data.instrumentResponse.redirectInfo.url;
}

// Paytm Payment Link Generation
async function generatePaytmLink(
  orderId,
  amount,
  customerInfo,
  registrationId,
) {
  const PaytmChecksum = require("paytmchecksum");

  const paytmParams = {
    MID: UPI_CONFIG.paytm.merchantId,
    WEBSITE: UPI_CONFIG.paytm.website,
    INDUSTRY_TYPE_ID: UPI_CONFIG.paytm.industryType,
    ORDER_ID: orderId,
    CUST_ID: `CUST_${registrationId}`,
    TXN_AMOUNT: amount.toString(),
    CHANNEL_ID: "WEB",
    MOBILE_NO: customerInfo.contact,
    EMAIL: customerInfo.email,
    CALLBACK_URL: `${process.env.BACKEND_URL}/api/upi-payments/paytm-callback`,
  };

  const checksum = await PaytmChecksum.generateSignature(
    paytmParams,
    UPI_CONFIG.paytm.merchantKey,
  );
  paytmParams.CHECKSUMHASH = checksum;

  // Return Paytm payment URL with parameters
  const paytmURL = "https://securegw-stage.paytm.in/order/process";
  return `${paytmURL}?${new URLSearchParams(paytmParams).toString()}`;
}

// Generate UPI QR Code Data
function generateUPIQRCode(paymentLink, amount, payeeName) {
  // Generate UPI QR code string
  const upiString = `upi://pay?pa=merchant@upi&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=Lab%20Test%20Payment`;

  return {
    upiString,
    qrData: upiString,
    displayText: `Pay ₹${amount} to ${payeeName}`,
  };
}

// Razorpay Webhook for Payment Verification
router.post("/razorpay-webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", UPI_CONFIG.razorpay.webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = req.body.event;
    const paymentData = req.body.payload.payment.entity;

    if (event === "payment.captured") {
      await updatePaymentStatus(
        paymentData.notes.registrationId,
        "completed",
        paymentData.id,
        paymentData.amount / 100,
        "razorpay",
      );
    } else if (event === "payment.failed") {
      await updatePaymentStatus(
        paymentData.notes.registrationId,
        "failed",
        paymentData.id,
        0,
        "razorpay",
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

// PhonePe Callback
router.post("/phonepe-callback", async (req, res) => {
  try {
    const { response } = req.body;
    const base64Response = Buffer.from(response, "base64").toString();
    const responseData = JSON.parse(base64Response);

    if (responseData.success) {
      const registrationId = responseData.data.merchantUserId.replace(
        "USER_",
        "",
      );
      await updatePaymentStatus(
        registrationId,
        "completed",
        responseData.data.transactionId,
        responseData.data.amount / 100,
        "phonepe",
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("PhonePe callback error:", error);
    res.status(500).json({ message: "Callback processing failed" });
  }
});

// Paytm Callback
router.post("/paytm-callback", async (req, res) => {
  try {
    const PaytmChecksum = require("paytmchecksum");
    const paytmParams = req.body;

    const isValidChecksum = PaytmChecksum.verifySignature(
      paytmParams,
      UPI_CONFIG.paytm.merchantKey,
      paytmParams.CHECKSUMHASH,
    );

    if (isValidChecksum && paytmParams.STATUS === "TXN_SUCCESS") {
      const registrationId = paytmParams.CUST_ID.replace("CUST_", "");
      await updatePaymentStatus(
        registrationId,
        "completed",
        paytmParams.TXNID,
        parseFloat(paytmParams.TXNAMOUNT),
        "paytm",
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Paytm callback error:", error);
    res.status(500).json({ message: "Callback processing failed" });
  }
});

// Update Payment Status in Database
async function updatePaymentStatus(
  registrationId,
  status,
  transactionId,
  amount,
  gateway,
) {
  try {
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      console.error("Registration not found:", registrationId);
      return;
    }

    registration.paymentDetails = {
      ...registration.paymentDetails,
      status,
      transactionId,
      paidAmount: amount,
      gateway,
      verifiedAt: new Date(),
    };

    if (status === "completed") {
      registration.paymentMethod = "UPI";
      registration.paidAmount = amount;
      registration.balanceAmount = Math.max(
        0,
        registration.totalAmount - amount,
      );
      registration.status =
        registration.balanceAmount === 0 ? "Completed" : "Pending";
    }

    await registration.save();

    // Emit real-time update
    const io = require("../server").io;
    if (io) {
      io.to("registrations").emit("registration-updated", {
        registration,
        message: `Payment ${status} for ${registration.labCode}`,
      });
    }

    console.log(`Payment ${status} for registration ${registration.labCode}`);
  } catch (error) {
    console.error("Error updating payment status:", error);
  }
}

// Manual Payment Verification
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const {
      registrationId,
      transactionId,
      amount,
      gateway = "manual",
    } = req.body;

    // Verify with payment gateway
    let isValid = false;

    switch (gateway) {
      case "razorpay":
        isValid = await verifyRazorpayPayment(transactionId);
        break;
      case "phonepe":
        isValid = await verifyPhonePePayment(transactionId);
        break;
      case "paytm":
        isValid = await verifyPaytmPayment(transactionId);
        break;
      case "manual":
        isValid = true; // Manual verification by admin
        break;
    }

    if (isValid) {
      await updatePaymentStatus(
        registrationId,
        "completed",
        transactionId,
        amount,
        gateway,
      );
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

// Razorpay Payment Verification
async function verifyRazorpayPayment(paymentId) {
  try {
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: UPI_CONFIG.razorpay.keyId,
      key_secret: UPI_CONFIG.razorpay.keySecret,
    });

    const payment = await razorpay.payments.fetch(paymentId);
    return payment.status === "captured";
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return false;
  }
}

// PhonePe Payment Verification
async function verifyPhonePePayment(transactionId) {
  try {
    const axios = require("axios");

    const checksum =
      crypto
        .createHash("sha256")
        .update(
          `/pg/v1/status/${UPI_CONFIG.phonepe.merchantId}/${transactionId}` +
            UPI_CONFIG.phonepe.saltKey,
        )
        .digest("hex") +
      "###" +
      UPI_CONFIG.phonepe.saltIndex;

    const response = await axios.get(
      `${UPI_CONFIG.phonepe.apiEndpoint}/pg/v1/status/${UPI_CONFIG.phonepe.merchantId}/${transactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": UPI_CONFIG.phonepe.merchantId,
        },
      },
    );

    return response.data.success && response.data.data.state === "COMPLETED";
  } catch (error) {
    console.error("PhonePe verification error:", error);
    return false;
  }
}

// Paytm Payment Verification
async function verifyPaytmPayment(transactionId) {
  try {
    const PaytmChecksum = require("paytmchecksum");
    const axios = require("axios");

    const paytmParams = {
      MID: UPI_CONFIG.paytm.merchantId,
      ORDERID: transactionId,
    };

    const checksum = await PaytmChecksum.generateSignature(
      paytmParams,
      UPI_CONFIG.paytm.merchantKey,
    );
    paytmParams.CHECKSUMHASH = checksum;

    const response = await axios.post(
      "https://securegw-stage.paytm.in/order/status",
      paytmParams,
    );

    return response.data.STATUS === "TXN_SUCCESS";
  } catch (error) {
    console.error("Paytm verification error:", error);
    return false;
  }
}

// Get Payment Status
router.get("/payment-status/:registrationId", auth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.registrationId);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.json({
      paymentDetails: registration.paymentDetails || {},
      paymentMethod: registration.paymentMethod,
      paidAmount: registration.paidAmount || 0,
      balanceAmount: registration.balanceAmount || registration.totalAmount,
      status: registration.status,
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    res.status(500).json({ message: "Failed to get payment status" });
  }
});

module.exports = router;
