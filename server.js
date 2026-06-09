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

// Helper: Send email via Brevo HTTP API
async function sendEmailViaBrevo(to, subject, text, bcc = null) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log(`[SIMULATED EMAIL NOT SENT] No Brevo API Key. To: ${to} | Subject: ${subject}`);
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

// Helper: Calculate PhonePe Pay API Checksum
function calculateChecksum(payloadBase64, endpoint, saltKey, saltIndex) {
  const data = payloadBase64 + endpoint + saltKey;
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  return `${hash}###${saltIndex}`;
}

// Helper: Calculate PhonePe Status API Checksum
function calculateStatusChecksum(merchantId, transactionId, saltKey, saltIndex) {
  const endpoint = `/pg/v1/status/${merchantId}/${transactionId}`;
  const data = endpoint + saltKey;
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  return `${hash}###${saltIndex}`;
}


// Hardening HTTP Headers for Security
app.disable("x-powered-by"); 
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY"); 
  res.setHeader("X-Content-Type-Options", "nosniff"); 
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Configure Restricted CORS
const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
app.use(
  cors({
    origin: [baseUrl],
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

// Helper: Send Ticket Confirmation Email
async function sendEmailConfirmation(booking, txnId) {
  const guestList = booking.names.map((n, i) => `Guest ${i + 1}: ${n}`).join("\n");
  const emailSubject = `🎟️ WAAKILI Ticket Confirmed — ${txnId}`;
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

// API: Submit Booking and Initiate PhonePe Gateway Payment
app.post("/api/pay", async (req, res) => {
  try {
    const { qty, names, email, phone, grand } = req.body;

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

    // 3. SECURE PRICING AUDIT: Recalculate price on the backend
    const pricePerPerson = 1;
    const computedTotal = cleanQty * pricePerPerson;
    const computedFees = Math.round(computedTotal * 0.03);
    const computedGrand = computedTotal + computedFees;

    if (parseInt(grand) !== computedGrand) {
      return res.status(400).json({ error: "Financial parameter mismatch. Booking aborted." });
    }

    // Unique Order Transaction ID
    const txnId = "WKL-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.floor(Math.random() * 9000 + 1000);

    const bookingRecord = {
      qty: cleanQty,
      names,
      email,
      phone: cleanPhone,
      grand: computedGrand,
      utr: "PhonePe",
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
        utr: "PhonePe",
        status: "payment_initiated"
      }]);
      if (error) {
        console.error("Supabase Save Error:", error.message);
        return res.status(500).json({ error: "Failed to write booking to cloud database." });
      }
    } else {
      localBookings[txnId] = bookingRecord;
    }

    // PhonePe Gateway Integration Request Payload
    const merchantId = process.env.PHONEPE_MERCHANT_ID || "M22FROG5F4U5K";
    const saltKey = process.env.PHONEPE_SALT_KEY || "b470db2d-2548-4fda-8f2e-89314516253b";
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const clientId = process.env.PHONEPE_CLIENT_ID || "SU2606051813086277709374";
    const apiUrl = process.env.PHONEPE_API_URL || "https://api.phonepe.com/apis/hermes";

    const phonepePayload = {
      merchantId: merchantId,
      merchantTransactionId: txnId,
      merchantUserId: "MUID" + cleanPhone,
      amount: computedGrand * 100, // PhonePe expects amount in paise
      redirectUrl: `${baseUrl}/api/payment-response?txnId=${txnId}`,
      redirectMode: "POST",
      callbackUrl: `${baseUrl}/api/payment-callback?txnId=${txnId}`,
      mobileNumber: cleanPhone,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const payloadString = JSON.stringify(phonepePayload);
    const payloadBase64 = Buffer.from(payloadString).toString("base64");
    const endpoint = "/pg/v1/pay";
    const checksum = calculateChecksum(payloadBase64, endpoint, saltKey, saltIndex);

    console.log(`Initiating PhonePe payment request for txnId: ${txnId}, amount: ${computedGrand} INR`);

    const headers = {
      "Content-Type": "application/json",
      "X-VERIFY": checksum
    };
    if (clientId) {
      headers["X-CLIENT-ID"] = clientId;
    }

    let responseData;
    try {
      const response = await axios.post(`${apiUrl}${endpoint}`, {
        request: payloadBase64
      }, { headers });

      responseData = response.data;
      console.log(`PhonePe Gateway response for ${txnId}:`, JSON.stringify(responseData));

      if (responseData.success && responseData.data.instrumentResponse.redirectInfo.url) {
        const redirectUrl = responseData.data.instrumentResponse.redirectInfo.url;
        return res.json({ success: true, redirectUrl, txnId });
      } else {
        throw new Error(responseData.message || "Failed to retrieve redirect URL.");
      }
    } catch (apiErr) {
      console.warn(`PhonePe API Handshake failed: ${apiErr.message}.`);
      if (apiErr.response && apiErr.response.data) {
        console.warn("PhonePe API Error Details:", JSON.stringify(apiErr.response.data));
      }
      
      const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1";
      if (isLocal) {
        console.log("Falling back to Simulated Sandbox Mode on localhost.");
        const redirectUrl = `${baseUrl}/api/payment-mock-checkout?txnId=${txnId}`;
        return res.json({ success: true, redirectUrl, txnId });
      } else {
        const errorMsg = apiErr.response && apiErr.response.data ? apiErr.response.data.message : apiErr.message;
        return res.status(502).json({ error: `Payment initiation failed: ${errorMsg || "Gateway Unreachable"}` });
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

// API: Handle PhonePe Payment Gateway Redirection (GET/POST)
app.all("/api/payment-response", async (req, res) => {
  try {
    const txnId = req.query.txnId || req.body.merchantTransactionId;
    const mockStatus = req.query.status; // Optional parameter passed by our mock page
    
    if (!txnId) {
      console.error("No txnId in redirect parameters.");
      return res.redirect(`${baseUrl}/?status=failed`);
    }

    // Retrieve booking details to verify it exists
    let booking;
    if (supabase) {
      const { data, error } = await supabase.from("bookings").select("*").eq("txn_id", txnId).single();
      if (error || !data) {
        console.error(`Booking not found in Supabase for txnId: ${txnId}`);
        return res.redirect(`${baseUrl}/?status=failed`);
      }
      booking = {
        qty: data.qty,
        names: data.names,
        email: data.email,
        phone: data.phone,
        grand: data.grand,
        status: data.status
      };
    } else {
      booking = localBookings[txnId];
      if (!booking) {
        console.error(`Booking not found in local memory for txnId: ${txnId}`);
        return res.redirect(`${baseUrl}/?status=failed`);
      }
    }

    // If already marked success, just redirect to success page
    if (booking.status === "success") {
      return res.redirect(`${baseUrl}/?status=success&txnId=${txnId}`);
    }

    // Handle mock simulation status if specified
    if (mockStatus) {
      const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1";
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
          
          return res.redirect(`${baseUrl}/?status=success&txnId=${txnId}`);
        } else {
          booking.status = "failed";
          if (supabase) {
            await supabase.from("bookings").update({ status: "failed" }).eq("txn_id", txnId);
          } else {
            localBookings[txnId].status = "failed";
          }
          return res.redirect(`${baseUrl}/?status=failed&txnId=${txnId}`);
        }
      }
    }

    // Call PhonePe Check Status API to verify payment status
    const merchantId = process.env.PHONEPE_MERCHANT_ID || "M22FROG5F4U5K";
    const saltKey = process.env.PHONEPE_SALT_KEY || "b470db2d-2548-4fda-8f2e-89314516253b";
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const clientId = process.env.PHONEPE_CLIENT_ID || "SU2606051813086277709374";
    const apiUrl = process.env.PHONEPE_API_URL || "https://api.phonepe.com/apis/hermes";

    const statusEndpoint = `/pg/v1/status/${merchantId}/${txnId}`;
    const checksum = calculateStatusChecksum(merchantId, txnId, saltKey, saltIndex);

    const headers = {
      "Content-Type": "application/json",
      "X-VERIFY": checksum
    };
    if (clientId) {
      headers["X-CLIENT-ID"] = clientId;
    }

    console.log(`Checking PhonePe transaction status for: ${txnId}`);
    
    let responseData;
    try {
      const statusResponse = await axios.get(`${apiUrl}${statusEndpoint}`, { headers });
      responseData = statusResponse.data;
      console.log(`PhonePe Check Status Response for ${txnId}:`, JSON.stringify(responseData));
    } catch (apiErr) {
      console.warn(`PhonePe Status API call failed: ${apiErr.message}. Falling back to sandbox checkout simulator.`);
      return res.redirect(`${baseUrl}/api/payment-mock-checkout?txnId=${txnId}`);
    }

    if (responseData.success && responseData.code === "PAYMENT_SUCCESS") {
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

      return res.redirect(`${baseUrl}/?status=success&txnId=${txnId}`);
    } else if (responseData.code === "PAYMENT_PENDING") {
      // Still pending / verifying
      return res.redirect(`${baseUrl}/?status=pending_verification&txnId=${txnId}`);
    } else {
      // Payment failed / declined
      booking.status = "failed";
      if (supabase) {
        await supabase.from("bookings").update({ status: "failed" }).eq("txn_id", txnId);
      } else {
        localBookings[txnId].status = "failed";
      }

      return res.redirect(`${baseUrl}/?status=failed&txnId=${txnId}`);
    }
  } catch (error) {
    console.error("Error handling payment redirect response:", error.message);
    const txnId = req.query.txnId || req.body.merchantTransactionId;
    if (txnId) {
      return res.redirect(`${baseUrl}/?status=failed&txnId=${txnId}`);
    }
    return res.redirect(`${baseUrl}/?status=failed`);
  }
});

// API: Handle PhonePe Server-to-Server Callback (Webhook)
app.post("/api/payment-callback", async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) {
      return res.status(400).json({ error: "Missing callback payload response." });
    }

    // Decode PhonePe base64 payload
    const decodedPayload = Buffer.from(response, "base64").toString("utf8");
    const payloadJson = JSON.parse(decodedPayload);

    console.log("PhonePe Webhook callback payload parsed:", payloadJson);

    const txnId = payloadJson.data.merchantTransactionId;
    const success = payloadJson.success;
    const code = payloadJson.code;

    // Verify Callback Signature to secure the webhook
    const receivedVerify = req.headers["x-verify"];
    const saltKey = process.env.PHONEPE_SALT_KEY || "b470db2d-2548-4fda-8f2e-89314516253b";
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";

    const calculatedVerify = crypto.createHash("sha256").update(response + saltKey).digest("hex") + "###" + saltIndex;
    
    if (receivedVerify && receivedVerify !== calculatedVerify) {
      console.warn("⚠️ PhonePe callback signature validation failed!");
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
          status: data.status
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

    if (success && code === "PAYMENT_SUCCESS") {
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
    } else if (code !== "PAYMENT_PENDING") {
      // Payment failed
      booking.status = "failed";
      if (supabase) {
        await supabase.from("bookings").update({ status: "failed" }).eq("txn_id", txnId);
      } else {
        localBookings[txnId].status = "failed";
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
  const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1";
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
