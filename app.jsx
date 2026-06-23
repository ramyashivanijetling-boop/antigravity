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

      <div className="opening-corner tl opening-logo">
        <img src="/waakili.png" alt="Waakili Logo" />
      </div>
      <div className="opening-corner tr opening-logo">
        <img src="/AG.png" alt="Antigravityy Logo" />
      </div>
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

// ---------- Experience ----------
const Experience = () => (
  <section className="experience" id="experience" data-screen-label="03 Experience">
    <div className="section-label">
      <Diamond size={6} color="var(--terracotta)" /> The Waakili Experience <Diamond size={6} color="var(--terracotta)" />
    </div>
    <h2 className="section-title">What awaits you inside.</h2>
    
    <div className="experience-grid">
      <div className="experience-card">
        <h3 className="experience-card-title">
          <Diamond size={6} color="var(--terracotta)" /> Perini Performance
        </h3>
        <p className="experience-card-desc">
          Witness the ancient, high-energy warrior dance form born in Telangana during the Kakatiya Dynasty. 
          Performed to invoke Lord Shiva, it resonates with powerful rhythms, vigorous movements, and majestic cultural pride.
        </p>
      </div>

      <div className="experience-card">
        <h3 className="experience-card-title">
          <Diamond size={6} color="var(--terracotta)" /> Dappu Performance
        </h3>
        <p className="experience-card-desc">
          Feel the soul of Telangana's folk music through the iconic beats of the Dappu instrument. 
          This energetic dance performance combines resonant, foot-tapping rhythms with lively movements representing folk celebrations.
        </p>
      </div>

      <div className="experience-card">
        <h3 className="experience-card-title">
          <Diamond size={6} color="var(--terracotta)" /> Burrakatha
        </h3>
        <p className="experience-card-desc">
          Experience the captivating art of theatrical storytelling originating in Telangana. 
          Using music, dialogue, and traditional folk instruments, performers bring ancient tales of historical heroes and cultural folklore to life.
        </p>
      </div>

      <div className="experience-card">
        <h3 className="experience-card-title">
          <Diamond size={6} color="var(--terracotta)" /> Panel Discussion
        </h3>
        <p className="experience-card-desc">
          Engage in an insightful, thought-provoking dialogue with prominent personalities, historians, and cultural voices of the state. 
          The discussion will cover the hardships, historical welfare, and future of Telangana's heritage.
        </p>
      </div>

      <div className="experience-card">
        <h3 className="experience-card-title">
          <Diamond size={6} color="var(--terracotta)" /> Folk Singing
        </h3>
        <p className="experience-card-desc">
          Let's groove and celebrate with foot-tapping Telangana folk songs. 
          The performance features soulful rhythms and traditional melodies of the soil that will keep you connected to the roots and humming along.
        </p>
      </div>

      <div className="experience-card">
        <h3 className="experience-card-title">
          <Diamond size={6} color="var(--terracotta)" /> Traditional Dinner
        </h3>
        <p className="experience-card-desc">
          Your ticket includes a full traditional dinner, curated to bring you the rich spices and authentic taste of Telangana's local cuisine. 
          Savor heritage recipes prepared by traditional cooks of the region.
        </p>
      </div>

      <div className="experience-card full-width">
        <h3 className="experience-card-title">
          <Diamond size={6} color="var(--terracotta)" /> Hands-on Workshops (with Kalakriti)
        </h3>
        <p className="experience-card-desc" style={{ marginBottom: "16px" }}>
          Kalakriti, our workshop partner, brings you three immersive, hands-on masterclasses to learn, create, and take home a piece of Telangana's art legacy:
        </p>
        <div className="experience-sub-grid">
          <div className="experience-sub-item">
            <strong>Cheriyal Painting</strong>
            <div style={{ marginTop: "4px", fontSize: "13px", color: "var(--ink-2)" }}>
              Originating in Cheriyal village (Siddipet district), learn the art of using natural colors to paint traditional characters on canvas scrolls.
            </div>
          </div>
          <div className="experience-sub-item">
            <strong>Clay Pottery</strong>
            <div style={{ marginTop: "4px", fontSize: "13px", color: "var(--ink-2)" }}>
              Discover the meditative art of throwing clay on the potter's wheel, a craft practiced for generations across Telangana, notably in Adilabad and Nizamabad.
            </div>
          </div>
          <div className="experience-sub-item">
            <strong>Lac Bangles</strong>
            <div style={{ marginTop: "4px", fontSize: "13px", color: "var(--ink-2)" }}>
              Create your own customized bangles set with natural lacquer and stones, a heritage craft originating from the historic bazaar lanes of Hyderabad.
            </div>
          </div>
        </div>
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

  // Addons states
  const [potteryQty, setPotteryQty] = useState(0);
  const [cheriyalQty, setCheriyalQty] = useState(0);
  const [banglesQty, setBanglesQty] = useState(0);
  const [comboQty, setComboQty] = useState(0);

  // Coupon states
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // format: { code: '...', type: 'flat'|'percentage', value: number }
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

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

            // Parse addons from UTR if present
            if (data.utr && data.utr.includes('|')) {
              const [_, addonsPart] = data.utr.split('|');
              const pairs = addonsPart.split(';');
              pairs.forEach(pair => {
                const [key, val] = pair.split(':');
                const v = parseInt(val) || 0;
                if (key === 'pottery') setPotteryQty(v);
                if (key === 'cheriyal') setCheriyalQty(v);
                if (key === 'bangles') setBanglesQty(v);
                if (key === 'combo') setComboQty(v);
              });
            } else {
              setPotteryQty(0);
              setCheriyalQty(0);
              setBanglesQty(0);
              setComboQty(0);
            }

            if (paymentResult.status === "success" || data.status === "pending_verification") {
              setStep(5);
            } else {
              setStep(4);
              setPaymentError("Verification failed or transaction declined. Please try again.");
            }
            setPayLoading(false);
          })
          .catch(err => {
            console.error("Error loading booking details:", err);
            setPaymentError("Failed to fetch transaction status from server.");
            setStep(4);
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
        setPotteryQty(0);
        setCheriyalQty(0);
        setBanglesQty(0);
        setComboQty(0);
        setCouponInput("");
        setAppliedCoupon(null);
        setCouponError("");
        setCouponSuccess("");
        setCouponLoading(false);
      }
    }
  }, [open, paymentResult]);

  const step1Total = qty * 499;
  const step1Fees = Math.round(step1Total * 0.03);
  const step1Grand = step1Total + step1Fees;

  const ticketsTotal = qty * 499;
  const addonsTotal = (potteryQty * 199) + (cheriyalQty * 249) + (banglesQty * 249) + (comboQty * 399);
  const gstTotal = Math.round(addonsTotal * 0.18);
  const total = ticketsTotal; // keeps backward-compatibility

  // Calculate discount based on subtotal (ticketsTotal + addonsTotal)
  const subtotal = ticketsTotal + addonsTotal;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "flat") {
      discount = appliedCoupon.value;
    } else if (appliedCoupon.type === "percentage") {
      discount = Math.round(subtotal * (appliedCoupon.value / 100));
    }
  }
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);

  const fees = Math.round((subtotalAfterDiscount + gstTotal) * 0.03);
  const grand = subtotalAfterDiscount + gstTotal + fees;

  const canNext1 = qty >= 1 && qty <= 8;
  const canNext2 = names.every(n => n.trim() !== "") && /^\S+@\S+\.\S+$/.test(form.email) && form.phone.replace(/\D/g, "").length >= 10;
  const canPayUPI = /^\d{12}$/.test(utr.trim());

  // Redirect to PhonePe Payment Gateway
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput,
          qty,
          addons: {
            pottery: potteryQty,
            bangles: banglesQty,
            combo: comboQty
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          type: data.type,
          value: data.value
        });
        setCouponSuccess(`Coupon "${data.code}" applied successfully! You got ₹${data.discount} off.`);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || "Invalid coupon code.");
      }
    } catch (err) {
      console.error(err);
      setAppliedCoupon(null);
      setCouponError("Failed to validate coupon code. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponSuccess("");
    setCouponError("");
  };

  const handlePayPhonePe = () => {
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
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        addons: {
          pottery: potteryQty,
          cheriyal: cheriyalQty,
          bangles: banglesQty,
          combo: comboQty
        }
      })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => { throw new Error(data.error || "Payment initiation failed") });
      }
      return res.json();
    })
    .then(data => {
      if (data.success && data.redirectUrl) {
        // Redirect the user to PhonePe PG checkout page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("Invalid response from payment server");
      }
    })
    .catch(err => {
      console.error("PhonePe Pay Error:", err);
      setPaymentError(err.message || "Could not initiate payment. Please try again.");
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
          {["Tickets", "Guest", "Add-ons", "Payment", "Confirmed"].map((label, i) => (
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
                <div className="sum-row"><span>{qty} × General Entry</span><span>₹{step1Total.toLocaleString("en-IN")}</span></div>
                <div className="sum-row muted"><span>Booking fee (3%)</span><span>₹{step1Fees.toLocaleString("en-IN")}</span></div>
                <div className="sum-row total"><span>Total</span><span>₹{step1Grand.toLocaleString("en-IN")}</span></div>
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
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-pane">
              <h3 className="step-title">Enhance your experience (Optional)</h3>
              <p className="step-subtitle" style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px", marginTop: "-12px" }}>
                Participate in live cultural workshops and take home your creations. Tax will be calculated at checkout.
              </p>
              
              <div className="addons-scroll" style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "360px", overflowY: "auto", paddingRight: "4px" }}>
                
                {/* Pottery */}
                <div className="addon-card" style={{ border: "1px solid oklch(0.82 0.02 75)", borderRadius: "6px", padding: "12px 16px", background: "var(--paper)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ paddingRight: "12px", textAlign: "left" }}>
                    <h4 style={{ margin: "0 0 2px 0", color: "var(--ink)", fontFamily: "var(--serif)", fontSize: "17px", fontWeight: "600" }}>Pottery Workshop</h4>
                    <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "var(--muted)", lineHeight: "1.3" }}>Includes a takeaway of one clay piece you make yourself.</p>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--terracotta)", display: "inline-block" }}>₹199 / guest</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button 
                      onClick={() => setPotteryQty(Math.max(0, potteryQty - 1))} 
                      style={{ 
                        width: "28px", 
                        height: "28px", 
                        borderRadius: "50%", 
                        border: "1px solid var(--ink)", 
                        background: "var(--paper)", 
                        color: "var(--ink)", 
                        fontSize: "14px", 
                        fontWeight: "bold",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--cream)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.color = "var(--ink)"; }}
                    >
                      −
                    </button>
                    <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--ink)", minWidth: "18px", textAlign: "center" }}>{potteryQty}</div>
                    <button 
                      onClick={() => setPotteryQty(Math.min(qty, potteryQty + 1))} 
                      style={{ 
                        width: "28px", 
                        height: "28px", 
                        borderRadius: "50%", 
                        border: "1px solid var(--ink)", 
                        background: "var(--paper)", 
                        color: "var(--ink)", 
                        fontSize: "14px", 
                        fontWeight: "bold",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--cream)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.color = "var(--ink)"; }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Lac Bangles */}
                <div className="addon-card" style={{ border: "1px solid oklch(0.82 0.02 75)", borderRadius: "6px", padding: "12px 16px", background: "var(--paper)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ paddingRight: "12px", textAlign: "left" }}>
                    <h4 style={{ margin: "0 0 2px 0", color: "var(--ink)", fontFamily: "var(--serif)", fontSize: "17px", fontWeight: "600" }}>Lac Bangles</h4>
                    <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "var(--muted)", lineHeight: "1.3" }}>Includes a pair of customized bangles styled live.</p>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--terracotta)", display: "inline-block" }}>₹249 / guest</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button 
                      onClick={() => setBanglesQty(Math.max(0, banglesQty - 1))} 
                      style={{ 
                        width: "28px", 
                        height: "28px", 
                        borderRadius: "50%", 
                        border: "1px solid var(--ink)", 
                        background: "var(--paper)", 
                        color: "var(--ink)", 
                        fontSize: "14px", 
                        fontWeight: "bold",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--cream)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.color = "var(--ink)"; }}
                    >
                      −
                    </button>
                    <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--ink)", minWidth: "18px", textAlign: "center" }}>{banglesQty}</div>
                    <button 
                      onClick={() => setBanglesQty(Math.min(qty, banglesQty + 1))} 
                      style={{ 
                        width: "28px", 
                        height: "28px", 
                        borderRadius: "50%", 
                        border: "1px solid var(--ink)", 
                        background: "var(--paper)", 
                        color: "var(--ink)", 
                        fontSize: "14px", 
                        fontWeight: "bold",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--cream)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.color = "var(--ink)"; }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Combo Pack */}
                <div className="addon-card" style={{ border: "1.5px solid var(--terracotta)", borderRadius: "6px", padding: "12px 16px", background: "rgba(166, 78, 56, 0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ paddingRight: "12px", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <h4 style={{ margin: 0, color: "var(--terracotta)", fontFamily: "var(--serif)", fontSize: "17px", fontWeight: "600" }}>All 2 Workshops Combo</h4>
                      <span style={{ background: "var(--terracotta)", color: "white", fontSize: "9px", padding: "2px 6px", borderRadius: "3px", textTransform: "uppercase", fontWeight: "bold" }}>Best Value</span>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "var(--muted)", lineHeight: "1.3" }}>Includes takeaways from both workshops.</p>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--terracotta)", display: "inline-block" }}>₹399 / guest</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button 
                      onClick={() => setComboQty(Math.max(0, comboQty - 1))} 
                      style={{ 
                        width: "28px", 
                        height: "28px", 
                        borderRadius: "50%", 
                        border: "1px solid var(--ink)", 
                        background: "var(--paper)", 
                        color: "var(--ink)", 
                        fontSize: "14px", 
                        fontWeight: "bold",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--cream)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.color = "var(--ink)"; }}
                    >
                      −
                    </button>
                    <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--ink)", minWidth: "18px", textAlign: "center" }}>{comboQty}</div>
                    <button 
                      onClick={() => setComboQty(Math.min(qty, comboQty + 1))} 
                      style={{ 
                        width: "28px", 
                        height: "28px", 
                        borderRadius: "50%", 
                        border: "1px solid var(--ink)", 
                        background: "var(--paper)", 
                        color: "var(--ink)", 
                        fontSize: "14px", 
                        fontWeight: "bold",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--cream)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.color = "var(--ink)"; }}
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              <div className="modal-actions" style={{ marginTop: "24px" }}>
                <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(4)}>
                  {addonsTotal > 0 ? "Continue with Add-ons →" : "Skip Add-ons →"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-pane">
              <h3 className="step-title">Waakili Secure Checkout</h3>
              
              {paymentError && <div className="payment-error-alert">{paymentError}</div>}

              <div className="phonepe-option-pane" style={{ border: "1px solid var(--terracotta)", padding: "24px" }}>
                <div className="phonepe-header" style={{ marginBottom: "20px" }}>
                  <span className="phonepe-logo-text" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "20px" }}>Order Summary</span>
                  <span className="phonepe-badge" style={{ background: "var(--green)", color: "white" }}>Secure Gateway</span>
                </div>

                <div className="summary-list" style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", fontSize: "14px", marginBottom: "24px", color: "var(--ink-2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Waakili Ticket x{qty}</span>
                    <span style={{ fontWeight: "600" }}>₹{ticketsTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {potteryQty > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <span>Pottery Workshop x{potteryQty}</span>
                      <span style={{ fontWeight: "600" }}>₹{(potteryQty * 199).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {cheriyalQty > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <span>Cheriyal Arts Workshop x{cheriyalQty}</span>
                      <span style={{ fontWeight: "600" }}>₹{(cheriyalQty * 249).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {banglesQty > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <span>Lac Bangles Workshop x{banglesQty}</span>
                      <span style={{ fontWeight: "600" }}>₹{(banglesQty * 249).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {comboQty > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <span>All 2 Workshops Combo x{comboQty}</span>
                      <span style={{ fontWeight: "600" }}>₹{(comboQty * 399).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {addonsTotal > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <span>GST (18% on Add-ons)</span>
                      <span style={{ fontWeight: "600" }}>₹{gstTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", color: "var(--green)", fontWeight: "600" }}>
                      <span>Discount ({appliedCoupon ? appliedCoupon.code : ""})</span>
                      <span>-₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Booking Fees (3%)</span>
                    <span style={{ fontWeight: "600" }}>₹{fees.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <hr style={{ border: "none", borderTop: "1px dashed oklch(0.85 0.02 75)", margin: "4px 0" }} />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: "16px", color: "var(--ink)", fontWeight: "700" }}>
                    <span>Total Amount</span>
                    <span style={{ color: "var(--terracotta)" }}>₹{grand.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="field" style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Promo / Coupon Code</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code (e.g. WELCOME)"
                      disabled={appliedCoupon !== null}
                      style={{ 
                        textTransform: "uppercase", 
                        flex: 1, 
                        padding: "10px 14px", 
                        border: "1px solid oklch(0.85 0.02 75)", 
                        background: "var(--cream)",
                        fontSize: "14px"
                      }}
                    />
                    {appliedCoupon ? (
                      <button 
                        className="btn-primary" 
                        onClick={handleRemoveCoupon} 
                        style={{ 
                          width: "auto", 
                          margin: 0, 
                          padding: "10px 16px", 
                          background: "var(--terracotta)", 
                          borderColor: "var(--terracotta)",
                          fontSize: "12px"
                        }}
                      >
                        Remove
                      </button>
                    ) : (
                      <button 
                        className="btn-primary" 
                        onClick={handleApplyCoupon} 
                        disabled={couponLoading || !couponInput.trim()} 
                        style={{ 
                          width: "auto", 
                          margin: 0, 
                          padding: "10px 16px",
                          fontSize: "12px"
                        }}
                      >
                        {couponLoading ? "Applying..." : "Apply"}
                      </button>
                    )}
                  </div>
                  {couponError && <div style={{ color: "var(--terracotta)", fontSize: "12px", marginTop: "6px", fontStyle: "italic" }}>{couponError}</div>}
                  {couponSuccess && <div style={{ color: "var(--green)", fontSize: "12px", marginTop: "6px", fontWeight: "500" }}>{couponSuccess}</div>}
                </div>

                <button 
                  className="btn-phonepe" 
                  onClick={handlePayPhonePe} 
                  disabled={payLoading}
                  style={{ 
                    background: "oklch(0.38 0.17 300)", // PhonePe Purple
                    borderColor: "oklch(0.38 0.17 300)", 
                    cursor: payLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    color: "white",
                    fontWeight: "600"
                  }}
                >
                  {payLoading ? (
                    "Initiating Payment..."
                  ) : (
                    <>
                      <span>Pay Securely with PhonePe</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="modal-actions" style={{ marginTop: "12px" }}>
                <button className="btn-ghost" onClick={() => setStep(3)}>← Back</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="step-pane confirm">
              {ticketStatus === "pending_verification" ? (
                <>
                  <div className="confirm-mark" style={{ animation: "bob 2s ease infinite", display: "flex", justifyContent: "center" }}>
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
                  <div className="confirm-mark" style={{ display: "flex", justifyContent: "center" }}>
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
                  <div className="stub-qty" style={{ marginTop: "4px", fontSize: "11px", opacity: 0.8 }}>₹{grand} Paid</div>
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
                  {potteryQty + cheriyalQty + banglesQty + comboQty > 0 && (
                    <div style={{ marginTop: "14px", borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "8px", fontSize: "12px", textAlign: "left" }}>
                      <span style={{ fontWeight: "600", textTransform: "uppercase", fontSize: "9px", color: "var(--muted)", display: "block", letterSpacing: "0.5px", marginBottom: "2px" }}>Add-ons (Workshops)</span>
                      <span style={{ color: "var(--ink)" }}>
                        {[
                          potteryQty > 0 && `Pottery x${potteryQty}`,
                          cheriyalQty > 0 && `Cheriyal x${cheriyalQty}`,
                          banglesQty > 0 && `Lac Bangles x${banglesQty}`,
                          comboQty > 0 && `Combo Pack x${comboQty}`
                        ].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
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

// ---------- Policy / Info Modal ----------
const PolicyModal = ({ policyType, onClose }) => {
  if (!policyType) return null;

  let title = "";
  let content = null;

  if (policyType === "terms") {
    title = "Terms & Conditions";
    content = (
      <div className="policy-content">
        <h4>Eligibility</h4>
        <p>By using this website, you confirm that:</p>
        <ul>
          <li>You are at least 18 years of age, or</li>
          <li>You are using the website under the supervision of a parent or legal guardian.</li>
          <li>The information provided by you is accurate and complete.</li>
        </ul>

        <h4>Pricing & Payments</h4>
        <ul>
          <li>All prices displayed on the website are in Indian Rupees (INR).</li>
          <li>Prices are subject to change without prior notice.</li>
          <li>Payments are processed through secure third-party payment gateways.</li>
          <li>Waakili is not responsible for payment failures caused by banks, payment gateways, or technical issues.</li>
        </ul>

        <h4>Intellectual Property</h4>
        <p>All content on this website, including:</p>
        <ul>
          <li>Logos</li>
          <li>Product Images</li>
          <li>Graphics</li>
          <li>Text</li>
          <li>Website Design</li>
        </ul>
        <p>is the property of Waakili and is protected by applicable intellectual property laws. Unauthorized copying, reproduction, or distribution is strictly prohibited.</p>

        <h4>User Conduct</h4>
        <p>Users agree not to:</p>
        <ul>
          <li>Use the website for unlawful activities.</li>
          <li>Attempt unauthorized access to website systems.</li>
          <li>Upload malicious software or harmful content.</li>
          <li>Misrepresent personal information.</li>
        </ul>
        <p>Violation of these terms may result in termination of access.</p>

        <h4>Limitation of Liability</h4>
        <p>Waakili shall not be liable for:</p>
        <ul>
          <li>Indirect or consequential damages.</li>
          <li>Loss of profits or business opportunities.</li>
          <li>Delays caused by third-party service providers.</li>
          <li>Technical interruptions beyond our control.</li>
        </ul>

        <h4>Privacy</h4>
        <p>Customer information is collected and handled according to our Privacy Policy available on the website.</p>

        <h4>Governing Law</h4>
        <p>These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India. Any disputes arising from the use of this website shall be subject to the jurisdiction of the competent courts in India.</p>
      </div>
    );
  } else if (policyType === "refund") {
    title = "Refund Policy";
    content = (
      <div className="policy-content">
        <p><strong>We don't offer any refunds.</strong> All ticket purchases and seat bookings are final and non-refundable.</p>
      </div>
    );
  } else if (policyType === "privacy") {
    title = "Privacy Policy";
    content = (
      <div className="policy-content">
        <h4>1. Introduction</h4>
        <p>WAAKILI (“we”, “our”, “us”) respects your privacy and is committed to protecting your personal information when you visit our website, purchase our products, or interact with us.</p>

        <h4>2. Information We Collect</h4>
        <p>We may collect the following information:</p>
        <ul>
          <li>Name</li>
          <li>Mobile number</li>
          <li>Email address</li>
          <li>Billing address</li>
          <li>Payment details (processed via secure payment gateways)</li>
          <li>Order history</li>
          <li>Device and browsing data (IP address, cookies, etc.)</li>
        </ul>

        <h4>3. How We Use Your Information</h4>
        <p>We use your data to:</p>
        <ul>
          <li>Provide customer support</li>
          <li>Improve our services</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>We do not sell or rent your personal information to third parties.</p>

        <h4>4. Payment Security</h4>
        <p>All payments are processed through secure third-party payment gateways. We do not store your card, UPI, or banking details.</p>

        <h4>5. Cookies</h4>
        <p>We may use cookies to enhance user experience and analyze website performance.</p>

        <h4>6. Data Protection</h4>
        <p>We implement reasonable security measures to protect your data from unauthorized access or misuse.</p>
      </div>
    );
  } else if (policyType === "contact") {
    title = "Contact Us";
    content = (
      <div className="policy-content">
        <p style={{ marginBottom: "20px" }}>Feel free to reach out to us for any queries or support regarding WAAKILI bookings.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <strong style={{ display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted)", marginBottom: "4px" }}>Business Name</strong>
            <span style={{ color: "var(--ink)", fontWeight: "500" }}>Siri Collections</span>
          </div>
          <div>
            <strong style={{ display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted)", marginBottom: "4px" }}>Phone Number</strong>
            <a href="tel:+919059268558" style={{ color: "var(--terracotta)", textDecoration: "none", fontWeight: "500" }}>+91 90592 68558</a>
          </div>
          <div>
            <strong style={{ display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted)", marginBottom: "4px" }}>Email ID</strong>
            <a href="mailto:rashmithasainath@gmail.com" style={{ color: "var(--terracotta)", textDecoration: "none", fontWeight: "500" }}>rashmithasainath@gmail.com</a>
          </div>
          <div>
            <strong style={{ display: "block", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted)", marginBottom: "4px" }}>Address</strong>
            <span style={{ color: "var(--ink)" }}>Hyderabad, 500039</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
        <div className="modal-head">
          <div className="modal-eyebrow">
            <Diamond size={6} color="var(--terracotta)" />
            <span>{title}</span>
          </div>
          <button className="modal-close btn-reset" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ padding: "28px" }}>
          {content}
          <div className="modal-actions center" style={{ marginTop: "28px" }}>
            <button className="btn-primary" onClick={onClose}>Understood</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Partners ----------
const Partners = () => (
  <section className="partners" data-screen-label="05 Partners">
    <div className="partners-inner">
      <div className="partner-col">
        <h3 className="partner-heading">In Association With</h3>
        <div className="partner-card">
          <img src="/Kalakriti.live.png" alt="Kalakriti Live Logo" className="logo-association" />
        </div>
      </div>
      <div className="partner-divider" />
      <div className="partner-col">
        <h3 className="partner-heading">Venue Partner</h3>
        <div className="partner-card">
          <img src="/phoenix.png" alt="Phoenix Arena Logo" />
        </div>
      </div>
    </div>
  </section>
);

// ---------- Footer ----------
const Footer = ({ onBook, onOpenPolicy }) => (
  <footer className="footer" data-screen-label="05 Footer">
    <div className="footer-inner">
      <div className="footer-left">
        <div className="footer-kicker">Antigravityy presents</div>
        <div className="footer-title">WAAKILI</div>
        <div className="footer-sub">A Walk into Timeless Heritage of Telangana · 28 June 2026</div>
      </div>
      <div className="footer-right">
        <div className="footer-meta">
          <a href="#about">About</a>
          <a href="#experience">Highlights</a>
          <a href="#details">Details</a>
          <button onClick={() => onOpenPolicy("contact")}>Contact</button>
        </div>
      </div>
    </div>
    <div className="footer-fine">
      <div>© 2026 Antigravityy · Hyderabad · All rights reserved</div>
      <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "16px", textTransform: "none", letterSpacing: "normal" }}>
        <button onClick={() => onOpenPolicy("terms")} style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "var(--muted)", cursor: "pointer", textDecoration: "underline" }}>Terms & Conditions</button>
        <button onClick={() => onOpenPolicy("privacy")} style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "var(--muted)", cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</button>
        <button onClick={() => onOpenPolicy("refund")} style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "var(--muted)", cursor: "pointer", textDecoration: "underline" }}>Refund Policy</button>
      </div>
    </div>
  </footer>
);

// ---------- App ----------
const App = () => {
  const [bookOpen, setBookOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [policyOpen, setPolicyOpen] = useState(null); // 'terms', 'privacy', 'refund', 'contact', or null

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
    document.body.style.overflow = (bookOpen || policyOpen) ? "hidden" : "";
  }, [bookOpen, policyOpen]);

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
          <a href="#experience">Highlights</a>
          <a href="#details">Details</a>
          <button className="btn-primary small" onClick={() => setBookOpen(true)}>Book ₹499</button>
        </div>
      </nav>

      <Opening onBook={() => setBookOpen(true)} />
      <Border />
      <About />
      <Border />
      <Experience />
      <Border />
      <Details onBook={() => setBookOpen(true)} />
      <Border />
      <Partners />
      <Footer onBook={() => setBookOpen(true)} onOpenPolicy={setPolicyOpen} />

      <BookingFlow 
        open={bookOpen} 
        onClose={handleCloseModal} 
        paymentResult={paymentResult}
      />

      <PolicyModal 
        policyType={policyOpen} 
        onClose={() => setPolicyOpen(null)} 
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
