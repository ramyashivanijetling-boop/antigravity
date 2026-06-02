const { useState, useEffect, useRef, useMemo } = React;

// ---------- Block-print inspired motif ----------
const Motif = ({ size = 28, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" style={style} aria-hidden="true">
    <g fill="none" stroke={color} strokeWidth="1.1">
      <rect x="3" y="3" width="22" height="22" />
      <rect x="7" y="7" width="14" height="14" transform="rotate(45 14 14)" />
      <circle cx="14" cy="14" r="2" fill={color} stroke="none" />
    </g>
  </svg>
);

const Diamond = ({ size = 10, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" style={style} aria-hidden="true">
    <rect x="2.5" y="2.5" width="5" height="5" transform="rotate(45 5 5)" fill={color} />
  </svg>
);

const Border = () => (
  <div className="border-strip" aria-hidden="true">
    {Array.from({ length: 60 }).map((_, i) => (
      <Diamond key={i} size={6} color="var(--ochre)" />
    ))}
  </div>
);

// ---------- Opening cinematic ----------
const Opening = ({ onBook }) => {
  const [phase, setPhase] = useState(0); // 0: presents, 1: waakili
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    return () => clearTimeout(t1);
  }, []);

  return (
    <section className="opening" data-screen-label="01 Opening">
      <div className="opening-inner">
        <div className={`opening-presents ${phase >= 0 ? "in" : ""}`}>
          <div className="kicker">
            <Diamond size={5} color="var(--ink)" />
            <span>Antigravityy presents</span>
            <Diamond size={5} color="var(--ink)" />
          </div>
        </div>

        <div className={`opening-title ${phase >= 1 ? "in" : ""}`}>
          <div className="telugu">వాకిలి</div>
          <h1 className="waakili">WAAKILI</h1>
          <div className="tagline">A Walk into Timeless Heritage of Telangana</div>
        </div>

        <div className={`opening-meta ${phase >= 1 ? "in" : ""}`}>
          <div className="meta-row">
            <span>28 June 2026</span>
            <Diamond size={4} color="var(--terracotta)" />
            <span>4:00 PM — 9:00 PM</span>
            <Diamond size={4} color="var(--terracotta)" />
            <span>Phoenix Arena, Hyderabad</span>
          </div>
          <button className="btn-primary" onClick={onBook}>
            Book your seat — ₹499
          </button>
          <a href="#about" className="scroll-hint">
            Walk in ↓
          </a>
        </div>
      </div>

      <div className="opening-corner tl"><Motif size={42} color="var(--terracotta)" /></div>
      <div className="opening-corner tr"><Motif size={42} color="var(--terracotta)" /></div>
      <div className="opening-corner bl"><Motif size={42} color="var(--terracotta)" /></div>
      <div className="opening-corner br"><Motif size={42} color="var(--terracotta)" /></div>
    </section>
  );
};

// ---------- About ----------
const About = () => (
  <section className="about" id="about" data-screen-label="02 About">
    <div className="section-label">
      <Diamond size={6} color="var(--terracotta)" /> About <Diamond size={6} color="var(--terracotta)" />
    </div>
    <div className="about-grid">
      <div className="about-meaning">
        <div className="pull">"Waakili"</div>

        <ul className="about-points">
          {[
            "Folk dance & music performances",
            "Burra Katha & Natakam",
            "Dappu & Teenmaar performances",
            "Telangana-inspired food streets",
            "Live artisan experiences — block printing, pottery, handloom & Cheriyal art",
            "Folk-inspired ambience & cultural installations",
          ].map((p) => (
            <li key={p}>
              <Diamond size={7} color="var(--terracotta)" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="about-body">
        <p className="lead">
          <strong>WAAKILI</strong> is a cultural experience designed to celebrate the soul of
          Telangana through art, music, storytelling, food, performances, folk traditions, and
          community interaction.
        </p>
        <p>
          More than just an event, it is a living cultural atmosphere where people can walk
          through the spirit of Telangana — experiencing its heritage, flavours, sounds,
          dialects, crafts, and stories.
        </p>
      </div>
    </div>
  </section>
);

// ---------- Details ----------
const Details = ({ onBook }) => (
  <section className="details" id="details" data-screen-label="04 Details">
    <div className="details-card">
      <div className="details-head">
        <div className="section-label light">
          <Diamond size={6} color="var(--ochre)" /> The Invitation <Diamond size={6} color="var(--ochre)" />
        </div>
        <h2 className="details-title">An evening to walk into.</h2>
      </div>

      <div className="details-grid">
        <div className="detail">
          <div className="detail-key">Date & Time</div>
          <div className="detail-val">28 June 2026 · 4:00 – 9:00 PM</div>
        </div>
        <div className="detail">
          <div className="detail-key">Venue</div>
          <div className="detail-val">Phoenix Arena</div>
        </div>
        <div className="detail">
          <div className="detail-key">Ticket</div>
          <div className="detail-val">₹499 / person</div>
        </div>
        <div className="detail">
          <div className="detail-key">Instagram</div>
          <div className="detail-val">@anti.gravityy</div>
        </div>
        <div className="detail">
          <div className="detail-key">Email</div>
          <div className="detail-val">anti.gravityy24@gmail.com</div>
        </div>
        <div className="detail">
          <div className="detail-key">Phone</div>
          <div className="detail-val">9381370739 · 9059268558</div>
        </div>
      </div>

      <button className="btn-primary big" onClick={onBook}>
        Book Now
      </button>
    </div>
  </section>
);

// ---------- Booking flow ----------
const BookingFlow = ({ open, onClose, paymentResult }) => {
  const [step, setStep] = useState(1);
  const [qty, setQty] = useState(2);
  const [names, setNames] = useState(["", ""]);
  const [form, setForm] = useState({ email: "", phone: "" });
  const [utr, setUtr] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [ticketStatus, setTicketStatus] = useState("pending_verification");
  const [upiConfig, setUpiConfig] = useState({ upiId: "anti.gravityy24@okaxis", upiName: "Antigravityy" });
  const [payLoading, setPayLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [copied, setCopied] = useState(false);
  const [amountCopied, setAmountCopied] = useState(false);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiConfig.upiId)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error("Failed to copy UPI ID:", err));
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(grand.toString())
      .then(() => {
        setAmountCopied(true);
        setTimeout(() => setAmountCopied(false), 2000);
      })
      .catch(err => console.error("Failed to copy amount:", err));
  };

  // Adjust guest names length to match ticket quantity
  useEffect(() => {
    setNames(prev => {
      const next = [...prev];
      if (next.length < qty) {
        return [...next, ...Array(qty - next.length).fill("")];
      } else if (next.length > qty) {
        return next.slice(0, qty);
      }
      return next;
    });
  }, [qty]);

  // Fetch Payment Configuration (UPI ID & Name) on mount
  useEffect(() => {
    if (open) {
      fetch("/api/payment-config")
        .then(res => res.json())
        .then(data => {
          if (data.upiId) {
            setUpiConfig(data);
          }
        })
        .catch(err => console.error("Error loading payment configuration:", err));
    }
  }, [open]);

  // Handle modal open, data resets, and payment redirect callback
  useEffect(() => {
    if (open) {
      if (paymentResult) {
        setPayLoading(true);
        fetch(`/api/booking-details/${paymentResult.txnId}`)
          .then(res => {
            if (!res.ok) throw new Error("Booking not found");
            return res.json();
          })
          .then(data => {
            setQty(data.qty);
            setNames(data.names);
            setForm({ email: data.email, phone: data.phone });
            setTicketId(data.txnId);
            setUtr(data.utr || "");
            setTicketStatus(data.status);

            if (paymentResult.status === "success" || data.status === "pending_verification") {
              setStep(4);
            } else {
              setStep(3);
              setPaymentError("Verification failed or transaction declined. Please try again.");
            }
            setPayLoading(false);
          })
          .catch(err => {
            console.error("Error loading booking details:", err);
            setPaymentError("Failed to fetch transaction status from server.");
            setStep(3);
            setPayLoading(false);
          });
      } else {
        setStep(1);
        setQty(2);
        setNames(["", ""]);
        setForm({ email: "", phone: "" });
        setUtr("");
        setTicketId("");
        setTicketStatus("pending_verification");
        setPaymentError("");
        setPayLoading(false);
      }
    }
  }, [open, paymentResult]);

  const total = qty * 499;
  const fees = Math.round(total * 0.03);
  const grand = total + fees;

  const canNext1 = qty >= 1 && qty <= 8;
  const canNext2 = names.every(n => n.trim() !== "") && /^\S+@\S+\.\S+$/.test(form.email) && form.phone.replace(/\D/g, "").length >= 10;
  const canPayUPI = /^\d{12}$/.test(utr.trim());

  // Submit UTR to Express backend
  const handlePayUPI = () => {
    setPayLoading(true);
    setPaymentError("");

    fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qty,
        names,
        email: form.email,
        phone: form.phone,
        grand,
        utr: utr.trim()
      })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || "Payment submission failed") });
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        setTicketId(data.txnId);
        setTicketStatus("pending_verification");
        setStep(4);
      } else {
        throw new Error("Invalid response from server");
      }
      setPayLoading(false);
    })
    .catch(err => {
      console.error("UPI Pay Error:", err);
      setPaymentError(err.message || "Could not submit payment reference. Please try again.");
      setPayLoading(false);
    });
  };

  if (!open) return null;

  // Generate dynamic UPI QR Code URI using configured credentials
  const upiLink = `upi://pay?pa=${upiConfig.upiId}&pn=${encodeURIComponent(upiConfig.upiName)}&am=${grand}&cu=INR&tn=Waakili%20Ticket%20Booking`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=5f259f&data=${encodeURIComponent(upiLink)}`;

  return (
    <div className="modal-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="modal-eyebrow">
            <Diamond size={5} color="var(--terracotta)" /> Booking
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {["Tickets", "Guest", "Payment", "Confirmed"].map((label, i) => (
            <div key={label} className={`step ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}>
              <div className="step-num">{i + 1}</div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {payLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <div className="loading-text">Submitting reference...</div>
            </div>
          )}

          {step === 1 && (
            <div className="step-pane">
              <h3 className="step-title">How many will walk in?</h3>
              <div className="qty-row">
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <div className="qty-num">{qty}</div>
                <button className="qty-btn" onClick={() => setQty(Math.min(8, qty + 1))}>+</button>
              </div>
              <div className="qty-hint">Maximum 8 per booking. Children below 5 enter free.</div>

              <div className="summary">
                <div className="sum-row"><span>{qty} × General Entry</span><span>₹{total.toLocaleString("en-IN")}</span></div>
                <div className="sum-row muted"><span>Booking fee (3%)</span><span>₹{fees.toLocaleString("en-IN")}</span></div>
                <div className="sum-row total"><span>Total</span><span>₹{grand.toLocaleString("en-IN")}</span></div>
              </div>

              <div className="modal-actions">
                <button className="btn-ghost" onClick={onClose}>Cancel</button>
                <button className="btn-primary" disabled={!canNext1} onClick={() => setStep(2)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-pane">
              <h3 className="step-title">Tell us who's coming.</h3>
              
              <div className="guest-inputs-scroll">
                {names.map((name, idx) => (
                  <div className="field" key={idx} style={{ marginBottom: "12px" }}>
                    <label>{qty === 1 ? "Full name" : `Guest ${idx + 1} Full Name`}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const nextNames = [...names];
                        nextNames[idx] = e.target.value;
                        setNames(nextNames);
                      }}
                      placeholder="As on government ID"
                    />
                  </div>
                ))}
              </div>

              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="for your e-tickets"
                />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91"
                />
              </div>
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary" disabled={!canNext2} onClick={() => setStep(3)}>
                  To payment →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-pane">
              <h3 className="step-title">Pay ₹{grand.toLocaleString("en-IN")}</h3>
              
              {paymentError && <div className="payment-error-alert">{paymentError}</div>}

              <div className="phonepe-option-pane" style={{ border: "1px solid var(--terracotta)" }}>
                <div className="phonepe-header">
                  <span className="phonepe-logo-text" style={{ fontFamily: "var(--serif)", fontStyle: "italic" }}>Waakili UPI QR</span>
                  <span className="phonepe-badge">Scan & Pay</span>
                </div>

                <div className="phonepe-qr-section">
                  <div className="qr-container">
                    <img src={qrCodeUrl} alt="UPI QR Code" />
                    <div className="scanner-line"></div>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--ink-2)", margin: "4px 0 12px 0" }}>UPI ID: <strong>{upiConfig.upiId}</strong></p>
                  
                  <div className="mobile-pay-button-container" style={{ margin: "8px 0", display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                    <button 
                      onClick={handleCopyUPI} 
                      className="btn-phonepe"
                      style={{ 
                        background: copied ? "#2e7d32" : "#5f259f", 
                        borderColor: copied ? "#2e7d32" : "#5f259f",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        cursor: "pointer",
                        margin: 0
                      }}
                    >
                      {copied ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          UPI ID Copied!
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          Copy UPI ID
                        </>
                      )}
                    </button>

                    <button 
                      onClick={handleCopyAmount} 
                      className="btn-phonepe"
                      style={{ 
                        background: amountCopied ? "#2e7d32" : "var(--ink)", 
                        borderColor: amountCopied ? "#2e7d32" : "var(--ink)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        cursor: "pointer",
                        margin: 0
                      }}
                    >
                      {amountCopied ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Amount Copied!
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          Copy Amount (₹{grand})
                        </>
                      )}
                    </button>

                    <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", fontStyle: "italic" }}>
                      Tap both buttons, then paste the details in your UPI app to pay.
                    </div>
                  </div>
                </div>

                <div className="phonepe-divider"><span>VERIFICATION</span></div>

                <div className="field" style={{ width: "100%" }}>
                  <label style={{ textAlign: "center", marginBottom: "4px" }}>Enter 12-Digit UPI Transaction ID / UTR</label>
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                    placeholder="e.g. 615273829102"
                    maxLength="12"
                    style={{
                      textAlign: "center",
                      fontSize: "18px",
                      letterSpacing: "3px",
                      fontFamily: "var(--mono)",
                      fontWeight: "600",
                      background: "white"
                    }}
                  />
                  <div style={{ fontSize: "11px", color: "var(--muted)", fontStyle: "italic", textAlign: "center", marginTop: "4px" }}>
                    Find the 12-digit number (UTR / Ref No) in your payment receipt screen
                  </div>
                </div>

                <button 
                  className="btn-phonepe" 
                  onClick={handlePayUPI} 
                  disabled={!canPayUPI || payLoading}
                  style={{ background: "var(--ink)", borderColor: "var(--ink)", cursor: canPayUPI ? "pointer" : "not-allowed" }}
                >
                  Confirm Payment & Submit Reference
                </button>
              </div>

              <div className="modal-actions" style={{ marginTop: "12px" }}>
                <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-pane confirm">
              {ticketStatus === "pending_verification" ? (
                <>
                  <div class="confirm-mark" style={{ animation: "bob 2s ease infinite", display: "flex", justifyContent: "center" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ochre)" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <h3 className="step-title center">Booking Pending Verification</h3>
                  <p className="confirm-sub" style={{ fontSize: "13px" }}>
                    We have received your payment reference. Your UTR: <strong>{utr}</strong> is currently being verified against our bank statement.
                    <br /><br />
                    Once confirmed (usually within a few minutes), your active ticket containing the access QR code will be emailed immediately to <strong>{form.email}</strong>.
                  </p>
                </>
              ) : ticketStatus === "rejected" ? (
                <>
                  <div class="confirm-mark" style={{ display: "flex", justifyContent: "center" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--terracotta)" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <h3 className="step-title center" style={{ color: "var(--terracotta)" }}>Verification Declined</h3>
                  <p className="confirm-sub" style={{ fontSize: "13px" }}>
                    Your payment reference could not be verified. If this is an error, please contact support with a screenshot of the receipt.
                  </p>
                </>
              ) : (
                <>
                  <div className="confirm-mark"><Motif size={48} color="var(--terracotta)" /></div>
                  <h3 className="step-title center">You're in. The threshold awaits.</h3>
                  <p className="confirm-sub">Your payment was verified. A copy of your ticket has been sent to <strong>{form.email}</strong>.</p>
                </>
              )}

              <div className="ticket">
                <div className="ticket-stub" style={{ background: ticketStatus === "pending_verification" ? "var(--ochre)" : ticketStatus === "rejected" ? "var(--terracotta)" : "var(--terracotta)" }}>
                  <div className="stub-label">Antigravityy</div>
                  <div className="stub-id">{ticketId}</div>
                  <div className="stub-qty">{qty} {qty === 1 ? "guest" : "guests"}</div>
                  <div className="stub-motif">
                    <Motif size={26} color="var(--cream)" />
                  </div>
                </div>
                <div className="ticket-perf" />
                <div className="ticket-main">
                  <div className="t-presents">Antigravityy presents</div>
                  <div className="t-title">WAAKILI</div>
                  <div className="t-sub">A Walk into Timeless Heritage of Telangana</div>
                  <div className="t-grid">
                    <div>
                      <div className="t-k">{qty === 1 ? "Guest" : "Guests"}</div>
                      <div className="t-v" style={{ fontSize: names.length > 2 ? "12px" : "14px", lineHeight: 1.2 }}>
                        {names.join(", ")}
                      </div>
                    </div>
                    <div><div className="t-k">Date</div><div className="t-v">28 Jun 2026</div></div>
                    <div><div className="t-k">Time</div><div className="t-v">4 — 9 PM</div></div>
                    <div><div className="t-k">Venue</div><div className="t-v">Phoenix Arena</div></div>
                  </div>
                  <div className="t-foot">
                    {ticketStatus === "success" ? (
                      <div className="qr">
                        <div className="qr-grid">
                          {Array.from({ length: 49 }).map((_, i) => (
                            <div key={i} style={{ background: Math.random() > 0.5 ? "var(--ink)" : "transparent" }} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="qr-pending-placeholder">
                        <span style={{ textTransform: "uppercase", fontSize: "9px", letterSpacing: "1px", fontWeight: "600", color: "var(--muted)" }}>
                          {ticketStatus === "rejected" ? "DECLINED" : "VERIFYING"}
                        </span>
                      </div>
                    )}
                    <div className="t-id" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span>REF: {ticketId}</span>
                      <span style={{ fontSize: "9px", color: "var(--muted)", textTransform: "uppercase" }}>UTR: {utr}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions center">
                <button className="btn-ghost" onClick={onClose}>Close</button>
                {ticketStatus === "success" && (
                  <button className="btn-primary" onClick={() => window.print()}>Download ticket</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Footer ----------
const Footer = ({ onBook }) => (
  <footer className="footer" data-screen-label="05 Footer">
    <div className="footer-inner">
      <div className="footer-left">
        <div className="footer-kicker">Antigravityy presents</div>
        <div className="footer-title">WAAKILI</div>
        <div className="footer-sub">A Walk into Timeless Heritage of Telangana · 28 June 2026</div>
      </div>
      <div className="footer-right">
        <button className="btn-primary" onClick={onBook}>Book your seat</button>
        <div className="footer-meta">
          <a href="#about">About</a>
          <a href="#details">Details</a>
          <a href="mailto:anti.gravityy24@gmail.com">Contact</a>
        </div>
      </div>
    </div>
    <div className="footer-fine">© 2026 Antigravityy · Hyderabad · All rights reserved</div>
  </footer>
);

// ---------- App ----------
const App = () => {
  const [bookOpen, setBookOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // Check URL parameters for redirect confirmation on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const txnId = params.get("txnId");
    if (status && txnId) {
      setPaymentResult({ status, txnId });
      setBookOpen(true);
      // Clean query parameters from URL bar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = bookOpen ? "hidden" : "";
  }, [bookOpen]);

  const handleCloseModal = () => {
    setBookOpen(false);
    setPaymentResult(null);
  };

  return (
    <div className="page">
      <nav className={`nav ${scrolled ? "show" : ""}`}>
        <div className="nav-brand">
          <span className="nav-anti">Antigravityy</span>
          <span className="nav-dot"><Diamond size={4} color="var(--terracotta)" /></span>
          <span className="nav-event">WAAKILI</span>
        </div>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#details">Details</a>
          <button className="btn-primary small" onClick={() => setBookOpen(true)}>Book ₹499</button>
        </div>
      </nav>

      <Opening onBook={() => setBookOpen(true)} />
      <Border />
      <About />
      <Border />
      <Details onBook={() => setBookOpen(true)} />
      <Footer onBook={() => setBookOpen(true)} />

      <BookingFlow 
        open={bookOpen} 
        onClose={handleCloseModal} 
        paymentResult={paymentResult}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
