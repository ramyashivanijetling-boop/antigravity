const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

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

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `Security Alerts <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Sends alert to yourself
        subject: emailSubject,
        text: emailBody,
      });
      console.log(`✅ Security alert email dispatched to ${process.env.SMTP_USER}`);
    } catch (err) {
      console.error("❌ Error sending security alert email:", err.message);
    }
  }
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

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `Waakili Heritage <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: booking.email,
        subject: emailSubject,
        text: emailBody,
      });
      console.log(`✅ Success: Pending email sent to ${booking.email}`);
    } catch (err) {
      console.error("❌ Error sending pending email via SMTP:", err.message);
    }
  }
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

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `Waakili Heritage <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: booking.email,
        bcc: process.env.SMTP_USER, // Send a copy to yourself
        subject: emailSubject,
        text: emailBody,
      });
      console.log(`✅ Success: Real confirmation email successfully dispatched to ${booking.email}`);
    } catch (err) {
      console.error("❌ Error sending real email via SMTP:", err.message);
    }
  }
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

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `Waakili Heritage <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: booking.email,
        subject: emailSubject,
        text: emailBody,
      });
      console.log(`✅ Success: Rejection email sent to ${booking.email}`);
    } catch (err) {
      console.error("❌ Error sending rejection email via SMTP:", err.message);
    }
  }
}

// API: Config endpoint (Provides UPI ID and Name to the frontend QR generator dynamically)
app.get("/api/payment-config", (req, res) => {
  res.json({
    upiId: process.env.UPI_ID || "anti.gravityy24@okaxis",
    upiName: process.env.UPI_NAME || "Antigravityy",
  });
});

// API: Submit Booking with UTR
app.post("/api/pay", async (req, res) => {
  try {
    const { qty, names, email, phone, grand, utr } = req.body;

    // 1. Structural Validation
    if (!qty || !names || !email || !phone || !grand || !utr) {
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

    // UTR must be exactly 12 digits
    const cleanUtr = utr.trim().replace(/\s/g, "");
    if (!/^\d{12}$/.test(cleanUtr)) {
      return res.status(400).json({ error: "UTR / UPI Reference Number must be exactly 12 digits." });
    }

    // 3. SECURE PRICING AUDIT: Recalculate price on the backend
    const pricePerPerson = 499;
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
      utr: cleanUtr,
      status: "pending_verification",
      createdAt: new Date(),
    };

    // Save booking state
    if (supabase) {
      const { error } = await supabase.from("bookings").insert([{
        txn_id: txnId,
        qty: cleanQty,
        names,
        email,
        phone: cleanPhone,
        grand: computedGrand,
        utr: cleanUtr,
        status: "pending_verification"
      }]);
      if (error) {
        console.error("Supabase Save Error:", error.message);
        return res.status(500).json({ error: "Failed to write booking to cloud database." });
      }
    } else {
      localBookings[txnId] = bookingRecord;
    }

    // Trigger Pending Email
    await sendEmailPendingVerification(bookingRecord, txnId);

    return res.json({ success: true, txnId, status: "pending_verification" });
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
      await sendAdminLoginAlertEmail(clientIp, "success");
    }
    return res.json({ success: true });
  } else {
    await sendAdminLoginAlertEmail(clientIp, "failed", cleanPasscode);
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
      await sendEmailConfirmation(booking, txnId);
      return res.json({ success: true, status: "success" });
    } else if (action === "reject") {
      booking.status = "rejected";
      if (supabase) {
        await supabase.from("bookings").update({ status: "rejected" }).eq("txn_id", txnId);
      } else {
        localBookings[txnId].status = "rejected";
      }
      await sendEmailRejection(booking, txnId);
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
