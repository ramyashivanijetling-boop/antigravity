const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

// Initialize Brevo Email API client logger
if (process.env.BREVO_API_KEY) {
  console.log("✉️ Brevo Email API initialized securely.");
} else {
  console.log("⚠️ BREVO_API_KEY missing in environment. Email dispatches will be simulated in terminal logs only.");
}

// Initialize PhonePe Gateway client logger
if (process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_SALT_KEY) {
  const cid = process.env.PHONEPE_CLIENT_ID;
  const mid = process.env.PHONEPE_MERCHANT_ID || "N/A";
  console.log(`💳 PhonePe Gateway V2 initialized. Client ID: ${cid.slice(0, 6)}... | MID: ${mid}`);
} else {
  console.log("⚠️ PhonePe Gateway credentials missing in environment. Sandbox Simulator will be active on localhost, requests will fail on production.");
}

// Helper: Send email via Brevo HTTP API
async function sendEmailViaBrevo(to, subject, text, bcc = null) {
  // Try Nodemailer SMTP first (Gmail app password) if available
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  if (smtpUser && smtpPass) {
    try {
      console.log(`Attempting SMTP dispatch to ${to}...`);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"${process.env.BREVO_SENDER_NAME || "Waakili Heritage"}" <${smtpUser}>`,
        to: to,
        subject: subject,
        text: text,
      };

      if (bcc) {
        mailOptions.bcc = bcc;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ SMTP Email dispatched successfully to ${to}. Message ID: ${info.messageId}`);
      return; // Success! Skip Brevo fallback
    } catch (smtpErr) {
      console.error(`❌ SMTP dispatch failed: ${smtpErr.message}. Falling back to Brevo API.`);
    }
  }

  // Fallback to Brevo HTTP API
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log(`[SIMULATED EMAIL NOT SENT] No SMTP credentials and no Brevo API Key. To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "anti.gravityy24@gmail.com";
    const senderName = process.env.BREVO_SENDER_NAME || "Waakili Heritage";

    const payload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject: subject,
      textContent: text,
    };

    if (bcc) {
      payload.bcc = [{ email: bcc }];
    }

    const response = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
    });

    console.log(`✅ Brevo Email dispatched successfully to ${to}. Message ID: ${response.data.messageId}`);
  } catch (err) {
    const errorDetails = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
    console.error(`❌ Brevo API Error sending email to ${to}:`, errorDetails);
  }
}

let cachedToken = null;
let tokenExpiry = 0;

// Helper: Get PhonePe V2 OAuth Access Token (with cache optimization)
async function getOAuthToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry > now + 300000) { // 5 minutes safety buffer
    return cachedToken;
  }

  const clientId = (process.env.PHONEPE_CLIENT_ID || "SU2606051813086277709374").trim();
  const clientSecret = (process.env.PHONEPE_SALT_KEY || "b470db2d-2548-4fda-8f2e-89314516253b").trim();
  const clientVersion = 1;
  const identityUrl = (process.env.PHONEPE_IDENTITY_URL || "https://api.phonepe.com/apis/identity-manager/v1/oauth/token").trim();

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("client_version", String(clientVersion));
  params.append("grant_type", "client_credentials");

  const response = await axios.post(identityUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  cachedToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in * 1000);
  return cachedToken;
}


// Hardening HTTP Headers for Security
app.disable("x-powered-by"); 
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY"); 
  res.setHeader("X-Content-Type-Options", "nosniff"); 
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === baseUrl || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1") || origin.includes("192.168.") || origin.includes("10.") || origin.includes("172.")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "X-Admin-Passcode"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve specific static frontend files securely
app.get("/styles.css", (req, res) => {
  res.setHeader("Content-Type", "text/css");
  res.sendFile(path.join(__dirname, "styles.css"));
});

app.get("/app.jsx", (req, res) => {
  res.setHeader("Content-Type", "text/javascript");
  res.sendFile(path.join(__dirname, "app.jsx"));
});

// Serve Favicon static routes
app.get("/favi.jpeg", (req, res) => {
  res.setHeader("Content-Type", "image/jpeg");
  res.sendFile(path.join(__dirname, "favi.jpeg"));
});

app.get("/favicon.ico", (req, res) => {
  res.setHeader("Content-Type", "image/jpeg");
  res.sendFile(path.join(__dirname, "favi.jpeg"));
});

// Serve new image assets
app.get("/waakili.png", (req, res) => {
  res.setHeader("Content-Type", "image/png");
  res.sendFile(path.join(__dirname, "waakili.png"));
});

app.get("/phoenix.png", (req, res) => {
  res.setHeader("Content-Type", "image/png");
  res.sendFile(path.join(__dirname, "phoenix.png"));
});

app.get("/Kalakriti.live.png", (req, res) => {
  res.setHeader("Content-Type", "image/png");
  res.sendFile(path.join(__dirname, "Kalakriti.live.png"));
});

app.get("/AG.png", (req, res) => {
  res.setHeader("Content-Type", "image/png");
  res.sendFile(path.join(__dirname, "AG.png"));
});

// Serve Waakili.html at root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Waakili.html"));
});

// Serve Admin Dashboard HTML
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("🟢 Connected securely to Supabase Database Cluster.");
} else {
  console.log("⚠️ Supabase credentials missing in .env. Falling back to local in-memory storage.");
}

// In-memory fallback database
const localBookings = {};

// Helper: Send Admin Login Alert Email
async function sendAdminLoginAlertEmail(ip, status, attemptedPasscode = "") {
  const emailSubject = `🛡️ SECURITY ALERT: Admin Console Login Attempt [${status.toUpperCase()}]`;
  const timeStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  
  let emailBody = `
This is an automated security alert for WAAKILI.

An attempt was made to log in to your Admin Approval Dashboard.

========================================
DETAILS
========================================
Time: ${timeStr} (IST)
IP Address: ${ip}
Status: ${status.toUpperCase()}
`;

  if (status === "failed") {
    emailBody += `Attempted Passcode: "${attemptedPasscode}"\n\n⚠️ WARNING: If this was not you, someone may be trying to guess your passcode. Please check your dashboard settings.`;
  } else {
    emailBody += `\nℹ️ INFO: A successful login has occurred. If this was you, you can safely ignore this email. Otherwise, change the ADMIN_PASSCODE in your .env file immediately.`;
  }

  emailBody += `\n\nRegards,\n— Security Systems`;

  console.log(`\n🚨 SECURITY ALERT: Admin Login Attempt [${status.toUpperCase()}] from IP ${ip}`);

  const alertRecipient = process.env.SMTP_USER || "anti.gravityy24@gmail.com";
  await sendEmailViaBrevo(alertRecipient, emailSubject, emailBody);
}

// Helper: Send Pending Verification Email
async function sendEmailPendingVerification(booking, txnId) {
  const emailSubject = `⏳ Booking Received — Verification Pending [${txnId}]`;
  const emailBody = `
Namaskar,

We have received your booking request for WAAKILI — A Walk into Timeless Heritage of Telangana.

========================================
DETAILS
========================================
Booking Reference: ${txnId}
Guests Count: ${booking.qty}
Submitted UTR/Ref No: ${booking.utr}
Amount Paid: ₹${booking.grand}

Your payment is currently under manual verification by the event organizers. 
Once verified against our bank statement (usually within a few minutes), your active ticket containing the access QR code will be dispatched to this email.

We look forward to welcoming you!

An evening to walk into.
— Team Antigravityy
`;

  console.log("\n======================================================================");
  console.log("📨 SIMULATED OUTGOING EMAIL (PENDING VERIFICATION)");
  console.log(`To: ${booking.email}`);
  console.log(`Subject: ${emailSubject}`);
  console.log("----------------------------------------------------------------------");
  console.log(emailBody.trim());
  console.log("======================================================================\n");

  await sendEmailViaBrevo(booking.email, emailSubject, emailBody);
}

// Helper: Parse add-ons from UTR string
function parseAddonsFromUtr(utr) {
  let pottery = 0, bangles = 0, combo = 0;
  if (utr && utr.includes('|')) {
    const [_, addonsPart] = utr.split('|');
    const pairs = addonsPart.split(';');
    pairs.forEach(pair => {
      const [key, val] = pair.split(':');
      if (key === 'pottery') pottery = parseInt(val) || 0;
      if (key === 'bangles') bangles = parseInt(val) || 0;
      if (key === 'combo') combo = parseInt(val) || 0;
    });
  }
  return { pottery, bangles, combo };
}

// Helper: Format add-ons for printing/email
function formatAddonsList(utr) {
  const { pottery, bangles, combo } = parseAddonsFromUtr(utr);
  const items = [];
  if (pottery > 0) items.push(`Pottery Workshop x${pottery} (₹199/ea)`);
  if (bangles > 0) items.push(`Lac Bangles Workshop x${bangles} (₹249/ea)`);
  if (combo > 0) items.push(`2-Workshops Combo Pack x${combo} (₹399/ea)`);
  return items.length > 0 ? items.join(", ") : "None";
}

// Helper: Send Ticket Confirmation Email
async function sendEmailConfirmation(booking, txnId) {
  const guestList = booking.names.map((n, i) => `Guest ${i + 1}: ${n}`).join("\n");
  const emailSubject = `🎟️ WAAKILI Ticket Confirmed — ${txnId}`;
  const addonsStr = booking.utr && booking.utr.includes('|') ? formatAddonsList(booking.utr) : "None";

  const emailBody = `
Namaskar,

Your tickets for WAAKILI — A Walk into Timeless Heritage of Telangana are confirmed! Your payment has been successfully verified.

========================================
TICKET DETAILS
========================================
Booking Reference: ${txnId}
Total Guests: ${booking.qty}
Date: 28 June 2026
Time: 4:00 PM — 9:00 PM
Venue: Phoenix Arena, Hyderabad
Amount Paid: ₹${booking.grand}
Add-ons: ${addonsStr}

ATTENDEES:
${guestList}

Please present the booking reference code (${txnId}) or download the ticket PDF at the venue threshold.
We look forward to welcoming you!

An evening to walk into.
— Team Antigravityy
`;

  console.log("\n======================================================================");
  console.log("📨 SIMULATED OUTGOING EMAIL (CONFIRMED)");
  console.log(`To: ${booking.email}`);
  console.log(`Subject: ${emailSubject}`);
  console.log("----------------------------------------------------------------------");
  console.log(emailBody.trim());
  console.log("======================================================================\n");

  const alertRecipient = process.env.SMTP_USER || "anti.gravityy24@gmail.com";
  await sendEmailViaBrevo(booking.email, emailSubject, emailBody, alertRecipient);
}

// Helper: Send Rejection Email
async function sendEmailRejection(booking, txnId) {
  const emailSubject = `⚠️ Booking Verification Declined — [${txnId}]`;
  const emailBody = `
Namaskar,

We were unable to verify your payment for WAAKILI — A Walk into Timeless Heritage of Telangana.

========================================
DETAILS
========================================
Booking Reference: ${txnId}
Submitted UTR/Ref No: ${booking.utr}

The transaction reference number you entered could not be matched with our bank statements. 

If you believe this is an error or your money was debited, please reply to this email or contact us at anti.gravityy24@gmail.com with a screenshot of the payment receipt so we can manually activate your seats.

Regards,
— Team Antigravityy
`;

  console.log("\n======================================================================");
  console.log("📨 SIMULATED OUTGOING EMAIL (REJECTED)");
  console.log(`To: ${booking.email}`);
  console.log(`Subject: ${emailSubject}`);
  console.log("----------------------------------------------------------------------");
  console.log(emailBody.trim());
  console.log("======================================================================\n");

  await sendEmailViaBrevo(booking.email, emailSubject, emailBody);
}

// API: Config endpoint (Provides UPI ID and Name to the frontend QR generator dynamically)
app.get("/api/payment-config", (req, res) => {
  res.json({
    upiId: process.env.UPI_ID || "anti.gravityy24@okaxis",
    upiName: process.env.UPI_NAME || "Antigravityy",
  });
});

// API: Validate Coupon Code
app.post("/api/validate-coupon", (req, res) => {
  try {
    const { code, qty, addons } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Coupon code is required." });
    }

    const cleanCode = code.trim();
    const cleanQty = parseInt(qty) || 0;
    
    // Parse Addons
    const potteryQty = addons && typeof addons.pottery === 'number' ? Math.max(0, parseInt(addons.pottery)) : 0;
    const banglesQty = addons && typeof addons.bangles === 'number' ? Math.max(0, parseInt(addons.bangles)) : 0;
    const comboQty = addons && typeof addons.combo === 'number' ? Math.max(0, parseInt(addons.combo)) : 0;

    const pricePerPerson = 499;
    const ticketsTotal = cleanQty * pricePerPerson;
    const addonsTotal = (potteryQty * 199) + (banglesQty * 249) + (comboQty * 399);
    const subtotal = ticketsTotal + addonsTotal;

    if (cleanCode === "Preetham") {
      return res.json({
        valid: true,
        code: "Preetham",
        type: "flat",
        value: 99,
        discount: 99
      });
    } else if (cleanCode === "AG15") {
      const discount = Math.round(subtotal * 0.15);
      return res.json({
        valid: true,
        code: "AG15",
        type: "percentage",
        value: 15,
        discount: discount
      });
    } else {
      return res.status(400).json({ error: "Invalid coupon code." });
    }
  } catch (error) {
    console.error("Coupon validation error:", error.message);
    return res.status(500).json({ error: "Server error validating coupon." });
  }
});

// API: Submit Booking and Initiate PhonePe Gateway Payment
app.post("/api/pay", async (req, res) => {
  try {
    const { qty, names, email, phone, grand, addons, couponCode } = req.body;

    // 1. Structural Validation
    if (!qty || !names || !email || !phone || !grand) {
      return res.status(400).json({ error: "Missing required booking details." });
    }

    // 2. Strict Input Type Validation
    const cleanQty = parseInt(qty);
    if (isNaN(cleanQty) || cleanQty < 1 || cleanQty > 8) {
      return res.status(400).json({ error: "Invalid ticket quantity (1-8 allowed)." });
    }

    if (!Array.isArray(names) || names.length !== cleanQty) {
      return res.status(400).json({ error: "Guest names count must match quantity." });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: "Invalid phone number." });
    }

    // Parse Addons
    const potteryQty = addons && typeof addons.pottery === 'number' ? Math.max(0, parseInt(addons.pottery)) : 0;
    const banglesQty = addons && typeof addons.bangles === 'number' ? Math.max(0, parseInt(addons.bangles)) : 0;
    const comboQty = addons && typeof addons.combo === 'number' ? Math.max(0, parseInt(addons.combo)) : 0;

    // 3. SECURE PRICING AUDIT: Recalculate price on the backend
    const pricePerPerson = 499;
    const ticketsTotal = cleanQty * pricePerPerson;
    const addonsTotal = (potteryQty * 199) + (banglesQty * 249) + (comboQty * 399);
    
    let discount = 0;
    if (couponCode) {
      const cleanCoupon = couponCode.trim();
      if (cleanCoupon === "Preetham") {
        discount = 99;
      } else if (cleanCoupon === "AG15") {
        discount = Math.round((ticketsTotal + addonsTotal) * 0.15);
      } else {
        return res.status(400).json({ error: "Invalid coupon code." });
      }
    }

    const subtotal = ticketsTotal + addonsTotal;
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);

    const gstTotal = Math.round(addonsTotal * 0.18);
    const computedFees = Math.round((subtotalAfterDiscount + gstTotal) * 0.03);
    const computedGrand = subtotalAfterDiscount + gstTotal + computedFees;

    if (parseInt(grand) !== computedGrand) {
      return res.status(400).json({ error: "Financial parameter mismatch. Booking aborted." });
    }

    // Unique Order Transaction ID
    const txnId = "WKL-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.floor(Math.random() * 9000 + 1000);

    // Save addons description and coupon inside UTR column
    const addonsStr = `pottery:${potteryQty};bangles:${banglesQty};combo:${comboQty}`;
    let utrValue = "PhonePe";
    const parts = [];
    if (addonsTotal > 0) parts.push(addonsStr);
    if (couponCode) parts.push(`coupon:${couponCode}`);
    if (parts.length > 0) {
      utrValue = `PhonePe|${parts.join('|')}`;
    }

    const bookingRecord = {
      qty: cleanQty,
      names,
      email,
      phone: cleanPhone,
      grand: computedGrand,
      utr: utrValue,
      status: "payment_initiated",
      createdAt: new Date(),
    };

    // Save booking state as payment_initiated
    if (supabase) {
      const { error } = await supabase.from("bookings").insert([{
        txn_id: txnId,
        qty: cleanQty,
        names,
        email,
        phone: cleanPhone,
        grand: computedGrand,
        utr: utrValue,
        status: "payment_initiated"
      }]);
      if (error) {
        console.error("Supabase Save Error:", error.message);
        return res.status(500).json({ error: "Failed to write booking to cloud database." });
      }
    } else {
      localBookings[txnId] = bookingRecord;
    }

    let responseData;
    try {
      console.log(`Initiating PhonePe V2 payment request for txnId: ${txnId}, amount: ${computedGrand} INR`);
      const token = await getOAuthToken();
      
      const v2PayUrl = (process.env.PHONEPE_V2_API_URL || "https://api.phonepe.com/apis/pg/checkout/v2/pay").trim();
      const v2Payload = {
        merchantOrderId: txnId,
        amount: computedGrand * 100, // paise
        expireAfter: 1200,
        paymentFlow: {
          type: "PG_CHECKOUT",
          merchantUrls: {
            redirectUrl: `${req.protocol}://${req.get("host")}/api/payment-response?txnId=${txnId}`
          }
        }
      };

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `O-Bearer ${token}`,
        "X-CALLBACK-URL": `${req.protocol}://${req.get("host")}/api/payment-callback`
      };

      const response = await axios.post(v2PayUrl, v2Payload, { headers });
      responseData = response.data;
      console.log(`PhonePe Gateway V2 response for ${txnId}:`, JSON.stringify(responseData));

      if (responseData.redirectUrl) {
        return res.json({ success: true, redirectUrl: responseData.redirectUrl, txnId });
      } else {
        throw new Error("Failed to retrieve redirect URL from V2 API.");
      }
    } catch (apiErr) {
      console.warn(`PhonePe API Handshake failed: ${apiErr.message}.`);
      if (apiErr.response && apiErr.response.data) {
        console.warn("PhonePe API Error Details:", JSON.stringify(apiErr.response.data));
      }
      
      const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1" || req.hostname.startsWith("192.168.") || req.hostname.startsWith("10.") || req.hostname.startsWith("172.");
      if (isLocal) {
        console.log("Falling back to Simulated Sandbox Mode on localhost.");
        const redirectUrl = `${req.protocol}://${req.get("host")}/api/payment-mock-checkout?txnId=${txnId}`;
        return res.json({ success: true, redirectUrl, txnId });
      } else {
        const errorMsg = apiErr.response && apiErr.response.data 
          ? (apiErr.response.data.message || `PhonePe Code ${apiErr.response.data.code || apiErr.response.status}`)
          : apiErr.message;
        return res.status(502).json({ error: `Payment initiation failed: ${errorMsg}` });
      }
    }
  } catch (error) {
    console.error("Secure Payment Handler Error:", error.message);
    return res.status(500).json({ error: "Server error initiating payment." });
  }
});

// API: Get booking status / details
app.get("/api/booking-details/:txnId", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("bookings").select("*").eq("txn_id", req.params.txnId).single();
    if (error || !data) {
      return res.status(404).json({ error: "Booking reference not found in cloud database." });
    }
    return res.json({
      txnId: data.txn_id,
      qty: data.qty,
      names: data.names,
      email: data.email,
      phone: data.phone,
      grand: data.grand,
      status: data.status,
      utr: data.utr,
      createdAt: data.created_at,
    });
  } else {
    const booking = localBookings[req.params.txnId];
    if (!booking) {
      return res.status(404).json({ error: "Booking reference not found." });
    }
    return res.json({
      txnId: req.params.txnId,
      qty: booking.qty,
      names: booking.names,
      email: booking.email,
      phone: booking.phone,
      grand: booking.grand,
      status: booking.status,
      utr: booking.utr,
      createdAt: booking.createdAt,
    });
  }
});

// Helper: Extract transaction ID and payment state from PhonePe callback or redirect requests
function extractPaymentData(req) {
  let txnId = req.query.txnId || null;
  let state = req.query.status || null; // standard parameter if mock checkout or query param status
  
  let bodyJson = {};
  
  // 1. Check if there is a base64 encoded response in the body
  if (req.body && req.body.response) {
    try {
      const decoded = Buffer.from(req.body.response, 'base64').toString('utf-8');
      bodyJson = JSON.parse(decoded);
      console.log("Extracted payment payload from base64 body:", JSON.stringify(bodyJson));
    } catch (err) {
      console.error("Failed to decode base64 response in body:", err.message);
    }
  } else if (req.body) {
    bodyJson = req.body;
  }

  const findVal = (obj, keys) => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return null;
  };

  const txnIdKeys = ["merchantOrderId", "merchantTransactionId", "transactionId"];
  const stateKeys = ["state", "paymentState", "status"];

  // Search root of bodyJson
  const rootTxn = findVal(bodyJson, txnIdKeys);
  const rootState = findVal(bodyJson, stateKeys);
  if (rootTxn) txnId = rootTxn;
  if (rootState) state = rootState;

  // Search payload
  if (bodyJson.payload) {
    const payloadTxn = findVal(bodyJson.payload, txnIdKeys);
    const payloadState = findVal(bodyJson.payload, stateKeys);
    if (payloadTxn) txnId = payloadTxn;
    if (payloadState) state = payloadState;
  }

  // Search data
  if (bodyJson.data) {
    const dataTxn = findVal(bodyJson.data, txnIdKeys);
    const dataState = findVal(bodyJson.data, stateKeys);
    if (dataTxn) txnId = dataTxn;
    if (dataState) state = dataState;
  }

  return { txnId, state };
}

// API: Handle PhonePe Payment Gateway Redirection (GET/POST)
app.all("/api/payment-response", async (req, res) => {
  const currentBaseUrl = `${req.protocol}://${req.get("host")}`;
  try {
    const { txnId } = extractPaymentData(req);
    const mockStatus = req.query.status; // Optional parameter passed by our mock page
    
    if (!txnId) {
      console.error("No txnId in redirect parameters.");
      return res.redirect(`${currentBaseUrl}/?status=failed`);
    }

    // Retrieve booking details to verify it exists
    let booking;
    if (supabase) {
      const { data, error } = await supabase.from("bookings").select("*").eq("txn_id", txnId).single();
      if (error || !data) {
        console.error(`Booking not found in Supabase for txnId: ${txnId}`);
        return res.redirect(`${currentBaseUrl}/?status=failed`);
      }
      booking = {
        qty: data.qty,
        names: data.names,
        email: data.email,
        phone: data.phone,
        grand: data.grand,
        status: data.status,
        utr: data.utr
      };
    } else {
      booking = localBookings[txnId];
      if (!booking) {
        console.error(`Booking not found in local memory for txnId: ${txnId}`);
        return res.redirect(`${currentBaseUrl}/?status=failed`);
      }
    }

    // If already marked success, just redirect to success page
    if (booking.status === "success") {
      return res.redirect(`${currentBaseUrl}/?status=success&txnId=${txnId}`);
    }

    // Handle mock simulation status if specified
    if (mockStatus) {
      const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1" || req.hostname.startsWith("192.168.") || req.hostname.startsWith("10.") || req.hostname.startsWith("172.");
      if (!isLocal) {
        console.warn(`⚠️ Warning: Blocked mock payment status attempt in production for txnId: ${txnId} from hostname: ${req.hostname}`);
        // Fall through to real PhonePe status check! Do NOT return simulated success.
      } else {
        console.log(`[SIMULATION] Processing mock status: ${mockStatus} for transaction: ${txnId}`);
        if (mockStatus === "success") {
          booking.status = "success";
          if (supabase) {
            await supabase.from("bookings").update({ status: "success" }).eq("txn_id", txnId);
          } else {
            localBookings[txnId].status = "success";
          }
          
          // Send confirmation email asynchronously
          sendEmailConfirmation(booking, txnId).catch(err => {
            console.error("❌ Background Error sending confirmation email:", err.message);
          });
          
          return res.redirect(`${currentBaseUrl}/?status=success&txnId=${txnId}`);
        } else {
          booking.status = "failed";
          if (supabase) {
            await supabase.from("bookings").update({ status: "failed" }).eq("txn_id", txnId);
          } else {
            localBookings[txnId].status = "failed";
          }
          return res.redirect(`${currentBaseUrl}/?status=failed&txnId=${txnId}`);
        }
      }
    }

    console.log(`Checking PhonePe V2 transaction status for: ${txnId}`);
    
    let responseData;
    try {
      const token = await getOAuthToken();
      const statusUrl = process.env.PHONEPE_V2_STATUS_URL 
        ? process.env.PHONEPE_V2_STATUS_URL.replace("{txnId}", txnId)
        : `https://api.phonepe.com/apis/pg/checkout/v2/order/${txnId}/status`;

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `O-Bearer ${token}`
      };

      const statusResponse = await axios.get(statusUrl, { headers });
      responseData = statusResponse.data;
      console.log(`PhonePe V2 Check Status Response for ${txnId}:`, JSON.stringify(responseData));
    } catch (apiErr) {
      console.warn(`PhonePe V2 Status API call failed: ${apiErr.message}.`);
      const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1" || req.hostname.startsWith("192.168.") || req.hostname.startsWith("10.") || req.hostname.startsWith("172.");
      if (isLocal) {
        return res.redirect(`${currentBaseUrl}/api/payment-mock-checkout?txnId=${txnId}`);
      } else {
        return res.redirect(`${currentBaseUrl}/?status=pending_verification&txnId=${txnId}`);
      }
    }

    if (responseData && responseData.state === "COMPLETED") {
      // Payment succeeded! Update status in database
      booking.status = "success";
      if (supabase) {
        await supabase.from("bookings").update({ status: "success" }).eq("txn_id", txnId);
      } else {
        localBookings[txnId].status = "success";
      }

      // Send confirmation email asynchronously
      sendEmailConfirmation(booking, txnId).catch(err => {
        console.error("❌ Background Error sending confirmation email:", err.message);
      });

      return res.redirect(`${currentBaseUrl}/?status=success&txnId=${txnId}`);
    } else if (responseData && responseData.state === "PENDING") {
      // Still pending / verifying
      return res.redirect(`${currentBaseUrl}/?status=pending_verification&txnId=${txnId}`);
    } else {
      // Payment failed / declined
      booking.status = "failed";
      if (supabase) {
        await supabase.from("bookings").update({ status: "failed" }).eq("txn_id", txnId);
      } else {
        localBookings[txnId].status = "failed";
      }

      return res.redirect(`${currentBaseUrl}/?status=failed&txnId=${txnId}`);
    }
  } catch (error) {
    console.error("Error handling payment redirect response:", error.message);
    const { txnId } = extractPaymentData(req);
    if (txnId) {
      return res.redirect(`${currentBaseUrl}/?status=failed&txnId=${txnId}`);
    }
    return res.redirect(`${baseUrl}/?status=failed`);
  }
});

// API: Handle PhonePe Server-to-Server Callback (Webhook)
app.post("/api/payment-callback", async (req, res) => {
  try {
    console.log("PhonePe Webhook callback received:", JSON.stringify(req.body));
    
    const { txnId, state } = extractPaymentData(req);

    if (!txnId) {
      console.error("No transaction identifier (txnId) found in webhook callback.");
      return res.status(400).json({ error: "Missing transaction identifier in payload." });
    }

    // Retrieve booking details
    let booking;
    if (supabase) {
      const { data, error } = await supabase.from("bookings").select("*").eq("txn_id", txnId).single();
      if (data) {
        booking = {
          qty: data.qty,
          names: data.names,
          email: data.email,
          phone: data.phone,
          grand: data.grand,
          status: data.status,
          utr: data.utr
        };
      }
    } else {
      booking = localBookings[txnId];
    }

    if (!booking) {
      console.error(`Booking not found in callback for txnId: ${txnId}`);
      return res.json({ success: true }); // Acknowledge receipt to PhonePe
    }

    // If status is already success, skip to prevent double emails
    if (booking.status === "success") {
      return res.json({ success: true });
    }

    // SECURE backend check status validation: Query direct API to confirm status before performing database state changes.
    console.log(`Webhook received for txnId: ${txnId}. Querying PhonePe V2 Status API for confirmation.`);
    let verifiedState = state;
    try {
      const token = await getOAuthToken();
      const statusResponse = await axios.get(`https://api.phonepe.com/apis/pg/checkout/v2/order/${txnId}/status`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `O-Bearer ${token}`
        }
      });
      verifiedState = statusResponse.data.state;
      console.log(`PhonePe Status API verified state for webhook callback: ${verifiedState}`);
    } catch (statusErr) {
      console.error(`Failed to verify webhook status with PhonePe Status API: ${statusErr.message}`);
      // If status API call fails, we rely on the state sent in webhook but flag a warning
      console.warn(`Falling back to status payload state: ${state}`);
    }

    if (verifiedState === "COMPLETED") {
      // Payment succeeded! Update status
      booking.status = "success";
      if (supabase) {
        await supabase.from("bookings").update({ status: "success" }).eq("txn_id", txnId);
      } else {
        localBookings[txnId].status = "success";
      }

      // Send confirmation email asynchronously
      sendEmailConfirmation(booking, txnId).catch(err => {
        console.error("❌ Background Error sending confirmation email in webhook:", err.message);
      });
    } else if (verifiedState === "FAILED") {
      // Payment failed
      booking.status = "failed";
      if (supabase) {
        await supabase.from("bookings").update({ status: "failed" }).eq("txn_id", txnId);
      } else {
        localBookings[txnId].status = "failed";
      }
    } else if (verifiedState === "PENDING") {
      // Payment is pending_verification
      booking.status = "pending_verification";
      if (supabase) {
        await supabase.from("bookings").update({ status: "pending_verification" }).eq("txn_id", txnId);
      } else {
        localBookings[txnId].status = "pending_verification";
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Error processing callback webhook:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// API: Render PhonePe Mock Sandbox Checkout Page (for local testing / API failure fallback)
app.get("/api/payment-mock-checkout", async (req, res) => {
  const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1" || req.hostname.startsWith("192.168.") || req.hostname.startsWith("10.") || req.hostname.startsWith("172.");
  if (!isLocal) {
    console.warn(`⚠️ Warning: Blocked access to mock checkout simulator page in production from hostname: ${req.hostname}`);
    return res.status(403).send("Forbidden. Sandbox simulator is only available on localhost.");
  }
  const txnId = req.query.txnId;
  if (!txnId) {
    return res.status(400).send("Missing txnId parameter.");
  }

  // Retrieve booking details to verify it exists
  let booking;
  if (supabase) {
    const { data } = await supabase.from("bookings").select("*").eq("txn_id", txnId).single();
    if (data) {
      booking = { grand: data.grand, qty: data.qty };
    }
  } else {
    booking = localBookings[txnId];
  }

  const amount = booking ? booking.grand : 514;
  const qty = booking ? booking.qty : 1;

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PhonePe Secure Mock Checkout</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --ink: #121619;
      --cream: #F5EFEB;
      --terracotta: #A64E38;
      --ochre: #C58F3B;
      --muted: #8E8A85;
      --green: #407A52;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: var(--ink);
      color: var(--cream);
      font-family: 'DM Sans', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      background: #1B2124;
      border: 1px solid var(--terracotta);
      border-radius: 8px;
      padding: 40px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      margin-bottom: 24px;
      color: var(--terracotta);
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: oklch(0.38 0.17 300); /* PhonePe Purple */
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 700;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .summary {
      background: #252D32;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 28px;
      text-align: left;
      border-left: 3px solid var(--ochre);
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .row.total {
      margin-bottom: 0;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed rgba(245, 239, 235, 0.2);
      font-size: 16px;
      font-weight: 600;
      color: var(--ochre);
    }
    p.info {
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 28px;
      line-height: 1.5;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    button {
      font-family: 'DM Sans', sans-serif;
      padding: 14px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    button.success {
      background: var(--green);
      color: white;
    }
    button.success:hover {
      background: #4d9263;
    }
    button.fail {
      background: transparent;
      border: 1px solid var(--terracotta);
      color: var(--cream);
    }
    button.fail:hover {
      background: rgba(166, 78, 56, 0.1);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-container">
      PhonePe Sandbox Simulator
    </div>
    <h1>Waakili Checkout</h1>
    
    <div class="summary">
      <div class="row">
        <span>Transaction ID</span>
        <span style="font-family: monospace;">${txnId}</span>
      </div>
      <div class="row">
        <span>Tickets Quantity</span>
        <span>${qty} ${qty === 1 ? 'ticket' : 'tickets'}</span>
      </div>
      <div class="row total">
        <span>Total Amount</span>
        <span>₹${amount.toLocaleString('en-IN')}</span>
      </div>
    </div>
    
    <p class="info">
      This is a secure local simulation of the PhonePe Payment Gateway checkout screen. Please choose the payment result to test the integration.
    </p>
    
    <div class="actions">
      <button class="success" onclick="redirect('success')">Simulate Success Payment</button>
      <button class="fail" onclick="redirect('failed')">Simulate Failed / Cancelled</button>
    </div>
  </div>

  <script>
    function redirect(status) {
      window.location.href = '/api/payment-response?txnId=${txnId}&status=' + status;
    }
  </script>
</body>
</html>
  `);
});


// ============================================
// ADMIN API ENDPOINTS (Passcode Protected)
// ============================================

// Middleware to verify Admin passcode
function verifyAdmin(req, res, next) {
  const clientPasscode = (req.headers["x-admin-passcode"] || "").trim();
  const correctPasscode = (process.env.ADMIN_PASSCODE || "waakili2026").trim();

  if (clientPasscode !== correctPasscode) {
    return res.status(401).json({ error: "Unauthorized. Invalid Admin Passcode." });
  }
  next();
}

// Admin: Login endpoint (Triggers security email notification)
app.post("/api/admin/login", async (req, res) => {
  const { passcode, isAutoCheck } = req.body;
  const correctPasscode = (process.env.ADMIN_PASSCODE || "waakili2026").trim();
  const cleanPasscode = (passcode || "").trim();
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";

  if (cleanPasscode === correctPasscode) {
    if (!isAutoCheck) {
      sendAdminLoginAlertEmail(clientIp, "success").catch(err => {
        console.error("❌ Background Error sending admin login alert email:", err.message);
      });
    }
    return res.json({ success: true });
  } else {
    sendAdminLoginAlertEmail(clientIp, "failed", cleanPasscode).catch(err => {
      console.error("❌ Background Error sending admin login alert email:", err.message);
    });
    return res.status(401).json({ error: "Invalid passcode." });
  }
});

// Admin: Fetch all bookings (sorted by created_at DESC)
app.get("/api/admin/bookings", verifyAdmin, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.json(data.map(d => ({
        txnId: d.txn_id,
        qty: d.qty,
        names: d.names,
        email: d.email,
        phone: d.phone,
        grand: d.grand,
        utr: d.utr,
        status: d.status,
        createdAt: d.created_at
      })));
    } else {
      // Map in-memory local bookings
      const bookingsArray = Object.keys(localBookings).map(key => ({
        txnId: key,
        ...localBookings[key]
      }));
      // Sort newest first
      bookingsArray.sort((a, b) => b.createdAt - a.createdAt);
      return res.json(bookingsArray);
    }
  } catch (error) {
    console.error("Admin Bookings Fetch Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch bookings list." });
  }
});

// Admin: Approve or Reject a booking
app.post("/api/admin/action", verifyAdmin, async (req, res) => {
  try {
    const { txnId, action } = req.body;
    if (!txnId || !action) {
      return res.status(400).json({ error: "Missing txnId or action parameter." });
    }

    let booking;
    if (supabase) {
      const { data, error } = await supabase.from("bookings").select("*").eq("txn_id", txnId).single();
      if (error || !data) return res.status(404).json({ error: "Booking not found." });
      booking = {
        qty: data.qty,
        names: data.names,
        email: data.email,
        phone: data.phone,
        grand: data.grand,
        utr: data.utr,
        status: data.status
      };
    } else {
      if (!localBookings[txnId]) return res.status(404).json({ error: "Booking not found." });
      booking = localBookings[txnId];
    }

    if (action === "approve") {
      booking.status = "success";
      if (supabase) {
        await supabase.from("bookings").update({ status: "success" }).eq("txn_id", txnId);
      } else {
        localBookings[txnId].status = "success";
      }
      sendEmailConfirmation(booking, txnId).catch(err => {
        console.error("❌ Background Error sending confirmation email:", err.message);
      });
      return res.json({ success: true, status: "success" });
    } else if (action === "reject") {
      booking.status = "rejected";
      if (supabase) {
        await supabase.from("bookings").update({ status: "rejected" }).eq("txn_id", txnId);
      } else {
        localBookings[txnId].status = "rejected";
      }
      sendEmailRejection(booking, txnId).catch(err => {
        console.error("❌ Background Error sending rejection email:", err.message);
      });
      return res.json({ success: true, status: "rejected" });
    } else {
      return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'reject'." });
    }
  } catch (error) {
    console.error("Admin Action API Error:", error.message);
    return res.status(500).json({ error: "Internal server error performing action." });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n======================================================================`);
  console.log(`🌐 Waakili Proxy Server Running Securely on: http://localhost:${PORT}`);
  console.log(`======================================================================\n`);
});
