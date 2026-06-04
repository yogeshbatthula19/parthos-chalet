import { useState, useEffect } from "react";
import { useIntersectionObserver } from "./hooks/useIntersectionObserver";
import "./App.css";

// Slides data for Hero Carousel
const HERO_SLIDES = [
  {
    image: "/assets/hero_bg.png",
    title: "Escape to Your Private\nLuxury Retreat",
    description: "Experience peaceful countryside living, a private infinity pool, lush green surroundings, and unforgettable moments with family and friends."
  },
  {
    image: "/assets/wellness_spa.png",
    title: "Serenity & Space\nto Reconnect",
    description: "Nestled in Kongara Kalan, our countryside villa offers absolute privacy and luxury amenities for a premium escape."
  },
  {
    image: "/assets/about_living_room.png",
    title: "Uncompromising Design\n& Scenic Views",
    description: "Indulge in modern architectural comfort, premium private spaces, and dedicated personal hospitality."
  }
];

// Room data for STAY page
const VILLA_ROOMS = [
  {
    id: "one-bhk-villa",
    name: "1 BHK Luxury Villa",
    image: "/assets/suite_royal.png",
    description: "Our premium 1 BHK private sanctuary featuring high wooden beams, elegant living room space, king-size bed, private terrace, and floor-to-ceiling glass windows offering beautiful garden and countryside views.",
    price: 18000,
    priceLabel: "₹18,000 / night",
    guests: "2 Adults + 2 Children",
    size: "1,200 sq ft",
    amenities: ["King Bed", "Private Terrace", "Living Room", "Infinity Pool Access", "Dedicated Service", "Premium Linens"]
  },
  {
    id: "outside-rooms",
    name: "Independent Outside Rooms",
    image: "/assets/suite_pool.png",
    description: "Two comfortable independent rooms located right outside the main villa. Perfect for larger groups or extra guests wanting privacy, featuring premium comfort, direct garden access, and cozy layouts.",
    price: 12000,
    priceLabel: "₹12,000 / night",
    guests: "4 Adults (2 per room)",
    size: "800 sq ft",
    amenities: ["Queen Beds", "Garden Walkway", "Air Conditioned", "Private Entrances", "Smart TV", "Wifi Enabled"]
  }
];

// Testimonials data
const TESTIMONIALS = [
  {
    name: "Ananya Rao",
    location: "Gachibowli, Hyderabad",
    text: "Parthos Chalet Villa is a hidden gem near Hyderabad. The private infinity pool is absolutely magical, and the level of privacy we experienced was unmatched. Will definitely visit again!",
    rating: 5
  },
  {
    name: "Vikram Reddy",
    location: "Jubilee Hills, Hyderabad",
    text: "The perfect weekend staycation with family. The spacious living areas, lush green gardens, and excellent hospitality made our stay memorable. The children loved the open outdoor spaces.",
    rating: 5
  },
  {
    name: "Siddharth Sen",
    location: "Begumpet, Hyderabad",
    text: "Hosted a poolside celebration for my 30th birthday. The custom lighting, catering setups, and personalized hospitality were exceptional. All our guests were completely wowed by the villa.",
    rating: 5
  }
];

// Experiences data
const EXPERIENCES_LIST = [
  {
    title: "Family Getaways",
    image: "/assets/luxury_rooms.png",
    desc: "Create precious family memories in spacious lounges and private yards. Ideal for bonding, indoor games, and dining together away from the rush."
  },
  {
    title: "Poolside Celebrations",
    image: "/assets/event_winter_ceremony.png",
    desc: "Host anniversaries, birthdays, or close social milestones. Custom pool lights, high-end barbecue grates, and catering options make events unforgettable."
  },
  {
    title: "Weekend Staycations",
    image: "/assets/event_chef_table.png",
    desc: "The perfect country road trip. Reach Kongara Kalan in less than an hour from the city and sink into instant countryside peace."
  },
  {
    title: "Private Gatherings",
    image: "/assets/event_private_retreat.png",
    desc: "Secluded executive team meets or private celebrations. Benefit from high-speed internet, dedicated service, and spacious breakout lawns."
  }
];

// Gallery images mapping
const GALLERY_IMAGES = [
  { src: "/assets/hero_bg.png", tag: "Pool" },
  { src: "/assets/suite_royal.png", tag: "Suites" },
  { src: "/assets/suite_pool.png", tag: "Pool" },
  { src: "/assets/about_living_room.png", tag: "Interiors" },
  { src: "/assets/luxury_rooms.png", tag: "Suites" },
  { src: "/assets/fine_dining.png", tag: "Dining" },
  { src: "/assets/wellness_spa.png", tag: "Wellness" },
  { src: "/assets/event_winter_ceremony.png", tag: "Celebrations" },
  { src: "/assets/event_chef_table.png", tag: "Dining" },
  { src: "/assets/event_private_retreat.png", tag: "Gatherings" }
];

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  roomPreference: string;
  submittedAt: string;
  page?: string;
}

interface Inquiry {
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  page?: string;
}

interface ClickEvent {
  action: string;
  label: string;
  page: string;
  timestamp: string;
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentPage, setCurrentPage] = useState("home");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Form states
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "2 Guests",
    roomPreference: "one-bhk-villa"
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // URL listener to support multi-page history navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Sync state with storage & track page view count
  useEffect(() => {
    const savedBookings = localStorage.getItem("parthos_bookings");
    if (savedBookings) setBookings(JSON.parse(savedBookings));

    const savedInquiries = localStorage.getItem("parthos_inquiries");
    if (savedInquiries) setInquiries(JSON.parse(savedInquiries));



    const savedAuth = sessionStorage.getItem("parthos_admin_logged_in");
    if (savedAuth === "true") setIsAdminLoggedIn(true);
  }, []);

  // Popup immediately landing the website
  useEffect(() => {
    if (currentPath === "/admin") return;
    const timer = setTimeout(() => {
      setShowBookingPopup(true);
      trackClick("Modal Displayed", "Landing Booking Form Popup");
    }, 1500);
    return () => clearTimeout(timer);
  }, [currentPath]);

  // Scroll header visibility
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Carousel timer
  useEffect(() => {
    if (currentPage !== "home" || currentPath === "/admin") return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [currentPage, currentPath]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
    trackClick("Carousel Navigation", "Previous Slide");
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    trackClick("Carousel Navigation", "Next Slide");
  };

  // Custom SPA Navigate function
  const navigateToPath = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    trackClick("Navigation", `Navigated to path: ${path}`);
  };

  const navigateToPage = (pageName: string) => {
    navigateToPath("/");
    setCurrentPage(pageName);
    trackClick("Navigation", `Swapped tab: ${pageName}`);
  };

  // Track customer interactions
  const trackClick = (action: string, label: string) => {
    const pageVal = currentPath === "/admin" ? "/admin" : (currentPage === "home" ? "/" : `/${currentPage}`);
    const newClick: ClickEvent = {
      action,
      label,
      page: pageVal,
      timestamp: new Date().toLocaleString()
    };
    const saved = localStorage.getItem("parthos_clicks");
    const list = saved ? JSON.parse(saved) : [];
    const updated = [newClick, ...list].slice(0, 100); // Keep last 100 clicks
    localStorage.setItem("parthos_clicks", JSON.stringify(updated));
  };

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // FIREBASE CONNECTOR TEMPLATE (FOR FUTURE USE)
  // ==========================================
  const saveToFirebase = async (collectionName: string, data: any) => {
    console.log(`[Firebase Placeholder] Writing to collection '${collectionName}':`, data);
    /*
      INSTRUCTIONS TO CONNECT REAL FIREBASE:
      1. Run command in your workspace terminal: npm install firebase
      2. Set up a file: src/firebase.ts with your web config details:
         import { initializeApp } from "firebase/app";
         import { getFirestore } from "firebase/firestore";
         const firebaseConfig = {
           apiKey: "YOUR_API_KEY",
           authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
           projectId: "YOUR_PROJECT_ID",
           storageBucket: "YOUR_PROJECT_ID.appspot.com",
           messagingSenderId: "SENDER_ID",
           appId: "APP_ID"
         };
         const app = initializeApp(firebaseConfig);
         export const db = getFirestore(app);
         
      3. Import db into App.tsx:
         import { db } from "./firebase";
         import { collection, addDoc } from "firebase/firestore";
         
      4. Replace the content of this function with:
         try {
           const docRef = await addDoc(collection(db, collectionName), data);
           console.log("Document written to Firebase with ID: ", docRef.id);
         } catch (e) {
           console.error("Error adding document: ", e);
         }
    */
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activePage = currentPage === "home" ? "/" : `/${currentPage}`;
    const newBooking: Booking = {
      id: Math.random().toString(36).substring(2, 9),
      ...bookingForm,
      submittedAt: new Date().toLocaleString(),
      page: activePage
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem("parthos_bookings", JSON.stringify(updatedBookings));
    
    trackClick("Booking Request", `Booked: ${bookingForm.roomPreference} (${bookingForm.name})`);

    // Call placeholder for Firebase
    await saveToFirebase("bookings", newBooking);

    setBookingConfirmed(true);
    setTimeout(() => {
      setShowBookingPopup(false);
      setBookingConfirmed(false);
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        checkIn: "",
        checkOut: "",
        guests: "2 Guests",
        roomPreference: "one-bhk-villa"
      });
    }, 3000);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activePage = currentPage === "home" ? "/" : `/${currentPage}`;
    const newInquiry: Inquiry = {
      ...contactForm,
      submittedAt: new Date().toLocaleString(),
      page: activePage
    };

    const updatedInquiries = [newInquiry, ...inquiries];
    setInquiries(updatedInquiries);
    localStorage.setItem("parthos_inquiries", JSON.stringify(updatedInquiries));

    trackClick("Contact Inquiry", `Sent contact form: ${contactForm.name}`);

    // Call placeholder for Firebase
    await saveToFirebase("inquiries", newInquiry);

    setContactSubmitted(true);
    setContactForm({ name: "", email: "", message: "" });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "parthosadmin123") {
      setIsAdminLoggedIn(true);
      setLoginError("");
      setAdminPassword("");
      sessionStorage.setItem("parthos_admin_logged_in", "true");
      trackClick("Admin Login", "Access Successful");
    } else {
      setLoginError("Incorrect password. Please try again.");
      trackClick("Admin Login", "Access Denied (Wrong PW)");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem("parthos_admin_logged_in");
    trackClick("Admin Logout", "Signed out");
    navigateToPath("/");
  };

  const deleteBooking = (id: string) => {
    const updated = bookings.filter(b => b.id !== id);
    setBookings(updated);
    localStorage.setItem("parthos_bookings", JSON.stringify(updated));
    trackClick("Admin Management", `Deleted booking ID: ${id}`);
  };

  const deleteInquiry = (index: number) => {
    const updated = inquiries.filter((_, i) => i !== index);
    setInquiries(updated);
    localStorage.setItem("parthos_inquiries", JSON.stringify(updated));
    trackClick("Admin Management", `Deleted contact index: ${index}`);
  };



  // Intersection Observers for entry animations
  const [featuresRef, featuresVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [aboutRef, aboutVisible] = useIntersectionObserver({ threshold: 0.15 });
  const [stayRef, stayVisible] = useIntersectionObserver({ threshold: 0.15 });
  const [experiencesRef, experiencesVisible] = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div className="app-container">
      {/* RENDER ADMIN SYSTEM IF PATH IS /admin */}
      {currentPath === "/admin" ? (
        <div className="admin-page-root">
          {!isAdminLoggedIn ? (
            /* ADMIN LOGIN CARD */
            <div className="admin-login-wrapper">
              <div className="admin-login-card">
                <h3 className="admin-login-title">PARTHOS ADMIN</h3>
                <p className="admin-login-subtitle">Sign in to manage bookings and view real-time metrics.</p>
                
                <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="admin-pw">Admin Password</label>
                    <input
                      type="password"
                      id="admin-pw"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      placeholder="Enter password (parthosadmin123)"
                    />
                  </div>
                  {loginError && <p className="login-error-text">{loginError}</p>}
                  <button type="submit" className="btn-gold admin-login-btn">Secure Log In</button>
                </form>
                
                <button className="back-to-site-btn" onClick={() => navigateToPath("/")}>&larr; Back to Website</button>
              </div>
            </div>
          ) : (
            /* SIMPLE ADMIN DASHBOARD */
            <div className="admin-dashboard-container" style={{ maxWidth: "1000px" }}>
              {/* Dashboard Header */}
              <header className="admin-dash-header" style={{ marginBottom: "30px" }}>
                <div>
                  <h2 className="admin-dash-brand">PARTHOS</h2>
                  <span className="admin-dash-tag">Inquiry Logs</span>
                </div>
                <div className="admin-header-actions">
                  <button className="btn-gold admin-action-btn" onClick={() => navigateToPath("/")}>
                    View Site
                  </button>
                  <button className="btn-gold admin-action-btn logout-btn" onClick={handleAdminLogout}>
                    Sign Out
                  </button>
                </div>
              </header>

              <div className="dashboard-content-layout" style={{ gridTemplateColumns: "1fr" }}>
                {/* Bookings Section */}
                <div className="dashboard-section-card" style={{ marginBottom: "30px" }}>
                  <h3 className="section-card-title">Recent Reservations</h3>
                  {bookings.length === 0 ? (
                    <p className="no-data-text">No booking requests logged yet.</p>
                  ) : (
                    <div className="bookings-list-scroll" style={{ maxHeight: "none" }}>
                      {bookings.map((b) => {
                        const room = VILLA_ROOMS.find(r => r.id === b.roomPreference);
                        return (
                          <div key={b.id} className="admin-booking-log-item">
                            <div className="admin-room-thumb" style={{ width: "80px", height: "80px" }}>
                              <img src={room?.image || "/assets/luxury_rooms.png"} alt="Room" />
                            </div>
                            <div className="admin-booking-details">
                              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <h4 className="guest-name">{b.name}</h4>
                                  {b.page && <span className="click-page-badge" style={{ verticalAlign: "middle" }}>{b.page}</span>}
                                </div>
                                <span className="admin-room-name-badge">{room?.name || b.roomPreference}</span>
                              </div>
                              <p className="guest-contact">{b.email} | {b.phone}</p>
                              <div className="booking-meta-row" style={{ marginBottom: "4px" }}>
                                <span>📅 {b.checkIn} to {b.checkOut}</span>
                                <span>👥 {b.guests}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                                <span className="submitted-time-stamp">Logged: {b.submittedAt}</span>
                                <button className="delete-log-btn" onClick={() => deleteBooking(b.id)}>Delete</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Contact Messages Section */}
                <div className="dashboard-section-card">
                  <h3 className="section-card-title">Contact Inquiries</h3>
                  {inquiries.length === 0 ? (
                    <p className="no-data-text">No messages logged yet.</p>
                  ) : (
                    <div className="inquiries-list-scroll" style={{ maxHeight: "none" }}>
                      {inquiries.map((inq, index) => (
                        <div key={index} className="admin-inquiry-item">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <strong style={{ color: "#ffffff", fontSize: "16px" }}>{inq.name}</strong>
                              {inq.page && <span className="click-page-badge">{inq.page}</span>}
                            </div>
                            <span style={{ fontSize: "11px", color: "var(--text-gray)" }}>{inq.submittedAt}</span>
                          </div>
                          <span style={{ fontSize: "12px", color: "#8c9b98", display: "block", marginBottom: "10px", textAlign: "left" }}>
                            {inq.email}
                          </span>
                          <p className="inquiry-message-body">{inq.message}</p>
                          <button className="delete-log-btn" style={{ marginTop: "12px", alignSelf: "flex-end" }} onClick={() => deleteInquiry(index)}>Delete</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* RENDER CUSTOMER-FACING CHALET WEBSITE */
        <>
          {/* POPUP LANDING BOOKING FORM */}
          {showBookingPopup && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <button className="modal-close" onClick={() => setShowBookingPopup(false)}>&times;</button>
                
                {!bookingConfirmed ? (
                  <form onSubmit={handleBookingSubmit} className="booking-modal-form">
                    <h3 className="modal-title">Book Your Escape</h3>
                    <p className="modal-subtitle">Reserve your luxury countryside experience near Hyderabad.</p>
                    
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input type="text" id="name" name="name" required value={bookingForm.name} onChange={handleBookingChange} placeholder="Enter your name" />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" required value={bookingForm.email} onChange={handleBookingChange} placeholder="Enter email" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" required value={bookingForm.phone} onChange={handleBookingChange} placeholder="Phone number" />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="checkIn">Check-In</label>
                        <input type="date" id="checkIn" name="checkIn" required value={bookingForm.checkIn} onChange={handleBookingChange} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="checkOut">Check-Out</label>
                        <input type="date" id="checkOut" name="checkOut" required value={bookingForm.checkOut} onChange={handleBookingChange} />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="guests">Number of Guests</label>
                        <select id="guests" name="guests" value={bookingForm.guests} onChange={handleBookingChange}>
                          <option>2 Guests</option>
                          <option>4 Guests</option>
                          <option>6 Guests</option>
                          <option>8+ Guests</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="roomPreference">Suite Preference</label>
                        <select id="roomPreference" name="roomPreference" value={bookingForm.roomPreference} onChange={handleBookingChange}>
                          <option value="one-bhk-villa">1 BHK Luxury Villa</option>
                          <option value="outside-rooms">Independent Outside Rooms</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn-gold modal-submit-btn">Reserve Now</button>
                  </form>
                ) : (
                  <div className="booking-success-message">
                    <div className="success-icon">✓</div>
                    <h3>Reservation Requested!</h3>
                    <p>Thank you, {bookingForm.name}. We will review your preference for the <strong>{VILLA_ROOMS.find(r => r.id === bookingForm.roomPreference)?.name}</strong> and contact you within 2 hours to confirm availability.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Header Navigation */}
          <header className={`header-nav ${isScrolled || currentPage !== "home" ? "scrolled" : ""}`}>
            <a className="logo-container" onClick={() => { navigateToPage("home"); setIsMobileMenuOpen(false); }}>
              <h1 className="logo-main">PARTHOS</h1>
              <span className="logo-sub">CHALET VILLA</span>
            </a>

            <nav className="nav-links">
              <a className={`nav-link ${currentPage === "home" ? "active" : ""}`} onClick={() => navigateToPage("home")}>
                HOME
              </a>
              <a className={`nav-link ${currentPage === "about" ? "active" : ""}`} onClick={() => navigateToPage("about")}>
                ABOUT
              </a>
              <a className={`nav-link ${currentPage === "rooms" ? "active" : ""}`} onClick={() => navigateToPage("rooms")}>
                STAY
              </a>
              <a className={`nav-link ${currentPage === "experiences" ? "active" : ""}`} onClick={() => navigateToPage("experiences")}>
                EXPERIENCES
              </a>
              <a className={`nav-link ${currentPage === "gallery" ? "active" : ""}`} onClick={() => navigateToPage("gallery")}>
                GALLERY
              </a>
              <a className={`nav-link ${currentPage === "contact" ? "active" : ""}`} onClick={() => navigateToPage("contact")}>
                CONTACT
              </a>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button className="btn-gold header-booking-btn" onClick={() => { setShowBookingPopup(true); trackClick("Header Button Click", "Book Now Clicked"); }}>
                BOOK NOW
              </button>
              
              <button className="mobile-menu-toggle" aria-label="Toggle Menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <span className={`burger-bar ${isMobileMenuOpen ? "open" : ""}`} />
              </button>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          <div className={`mobile-nav-drawer ${isMobileMenuOpen ? "open" : ""}`}>
            <div className="drawer-header">
              <a className="logo-container" onClick={() => { navigateToPage("home"); setIsMobileMenuOpen(false); }}>
                <span className="logo-main" style={{ fontSize: "24px" }}>PARTHOS</span>
                <span className="logo-sub" style={{ fontSize: "8px" }}>CHALET VILLA</span>
              </a>
              <button className="drawer-close" onClick={() => setIsMobileMenuOpen(false)}>&times;</button>
            </div>
            
            <nav className="drawer-links">
              <a className={`drawer-link ${currentPage === "home" ? "active" : ""}`} onClick={() => { navigateToPage("home"); setIsMobileMenuOpen(false); }}>
                HOME
              </a>
              <a className={`drawer-link ${currentPage === "about" ? "active" : ""}`} onClick={() => { navigateToPage("about"); setIsMobileMenuOpen(false); }}>
                ABOUT
              </a>
              <a className={`drawer-link ${currentPage === "rooms" ? "active" : ""}`} onClick={() => { navigateToPage("rooms"); setIsMobileMenuOpen(false); }}>
                STAY
              </a>
              <a className={`drawer-link ${currentPage === "experiences" ? "active" : ""}`} onClick={() => { navigateToPage("experiences"); setIsMobileMenuOpen(false); }}>
                EXPERIENCES
              </a>
              <a className={`drawer-link ${currentPage === "gallery" ? "active" : ""}`} onClick={() => { navigateToPage("gallery"); setIsMobileMenuOpen(false); }}>
                GALLERY
              </a>
              <a className={`drawer-link ${currentPage === "contact" ? "active" : ""}`} onClick={() => { navigateToPage("contact"); setIsMobileMenuOpen(false); }}>
                CONTACT
              </a>
            </nav>
            
            <div className="drawer-footer">
              <button className="btn-gold" style={{ width: "100%", height: "46px" }} onClick={() => { setIsMobileMenuOpen(false); setShowBookingPopup(true); trackClick("Mobile Drawer CTA", "Book Now Clicked"); }}>
                BOOK NOW
              </button>
            </div>
          </div>

          {/* Conditional Subpages */}
          {currentPage === "home" && (
            <>
              {/* Hero Section */}
              <section className="hero-section">
                <div className="hero-slider">
                  {HERO_SLIDES.map((slide, index) => (
                    <div key={index} className={`hero-slide ${index === activeSlide ? "active" : ""}`}>
                      <img src={slide.image} alt="Chalet Villa View" className="hero-image" />
                      <div className="hero-overlay" />
                      <div className="hero-content">
                        <h2 className="hero-title">
                          {slide.title.split("\n").map((line, i) => (
                            <span key={i} style={{ display: "block" }}>
                              {line}
                            </span>
                          ))}
                        </h2>
                        <p className="hero-desc">{slide.description}</p>
                        <div className="hero-ctas">
                          <button className="btn-gold hero-btn" onClick={() => { setShowBookingPopup(true); trackClick("Hero Button Click", "Book Your Stay Clicked"); }}>Book Your Stay</button>
                          <button className="watch-intro" onClick={() => { navigateToPage("gallery"); trackClick("Hero CTA Click", "Watch Villa Tour Clicked"); }}>
                            <img src="/assets/play.svg" alt="Play Button" />
                            Watch Villa Tour
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="slider-controls">
                  <span className="slider-counter">
                    0{activeSlide + 1} / 0{HERO_SLIDES.length}
                  </span>
                  <button className="slider-arrow" onClick={handlePrevSlide}>
                    &lt;
                  </button>
                  <button className="slider-arrow" onClick={handleNextSlide}>
                    &gt;
                  </button>
                </div>
              </section>

              {/* Features Strip */}
              <section
                ref={featuresRef as any}
                className={`features-section reveal-element ${featuresVisible ? "revealed" : ""}`}
              >
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <img src="/assets/location.svg" className="feature-icon" alt="Pool Icon" />
                  </div>
                  <h3 className="feature-title">Private Infinity Pool</h3>
                  <p className="feature-body">Relax and unwind in your exclusive pool surrounded by nature.</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <img src="/assets/amenities.svg" className="feature-icon" alt="Amenities Icon" />
                  </div>
                  <h3 className="feature-title">Luxury Amenities</h3>
                  <p className="feature-body">Modern comforts designed for a seamless stay.</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <img src="/assets/peaceful.svg" className="feature-icon" alt="Peaceful Icon" />
                  </div>
                  <h3 className="feature-title">Peaceful Getaway</h3>
                  <p className="feature-body">A serene escape away from the city's noise.</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <img src="/assets/service.svg" className="feature-icon" alt="Service Icon" />
                  </div>
                  <h3 className="feature-title">Personalized Hospitality</h3>
                  <p className="feature-body">Exceptional service for memorable experiences.</p>
                </div>
              </section>

              <div className="section-divider" />

              {/* About Section Summary */}
              <section
                ref={aboutRef as any}
                className={`about-section reveal-element ${aboutVisible ? "revealed" : ""}`}
              >
                <div className="about-image-container">
                  <img src="/assets/about_living_room.png" alt="Living Room" className="about-image" />
                </div>
                <div className="about-content">
                  <span className="eyebrow">ABOUT PARTHOS</span>
                  <h2 className="section-headline">Where Luxury Meets Nature</h2>
                  <p className="about-text">
                    Nestled amidst lush greenery, Parthos Chalet Villa offers the perfect balance of comfort, privacy, and natural beauty.
                    Whether you're planning a weekend escape, family gathering, celebration, or staycation, every corner is designed to
                    help you relax and reconnect.
                  </p>
                  <button className="btn-gold btn-discover" onClick={() => navigateToPage("about")}>Discover More</button>
                </div>
              </section>

              {/* Stay Section Summary */}
              <section
                ref={stayRef as any}
                className={`stay-section reveal-element ${stayVisible ? "revealed" : ""}`}
              >
                <div className="stay-content">
                  <h2 className="stay-headline">A Stay Beyond Expectations</h2>
                  <p className="stay-text">
                    From elegant interiors and spacious living areas to scenic outdoor spaces and premium amenities, every detail is thoughtfully curated to create unforgettable experiences.
                  </p>
                  <button className="btn-gold btn-rooms" onClick={() => navigateToPage("rooms")}>Explore Rooms</button>
                </div>

                <div className="experience-grid">
                  <div className="experience-card" onClick={() => navigateToPage("rooms")}>
                    <div className="card-img-wrapper">
                      <img src="/assets/suite_royal.png" alt="Royal Suite" className="experience-img" />
                      <div className="card-overlay">
                        <h3 className="card-title">Royal Master Suite</h3>
                      </div>
                    </div>
                  </div>

                  <div className="experience-card" onClick={() => navigateToPage("rooms")}>
                    <div className="card-img-wrapper">
                      <img src="/assets/suite_pool.png" alt="Poolside Suite" className="experience-img" />
                      <div className="card-overlay">
                        <h3 className="card-title">Poolside Suite</h3>
                      </div>
                    </div>
                  </div>

                  <div className="experience-card" onClick={() => navigateToPage("rooms")}>
                    <div className="card-img-wrapper">
                      <img src="/assets/wellness_spa.png" alt="Wellness and Spa" className="experience-img" />
                      <div className="card-overlay">
                        <h3 className="card-title">Wellness &amp; Spa</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Experiences Summary */}
              <section
                ref={experiencesRef as any}
                className={`events-section reveal-element ${experiencesVisible ? "revealed" : ""}`}
              >
                <div className="events-content">
                  <span className="eyebrow">EXPERIENCES</span>
                  <h2 className="section-headline">Create Memories That Last</h2>
                  <p className="events-text">
                    Celebrate life's special moments in a setting designed for comfort, connection, and relaxation.
                  </p>

                  <div className="events-list">
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Family Getaways</span>
                    </div>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Poolside Celebrations</span>
                    </div>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Weekend Staycations</span>
                    </div>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Private Gatherings</span>
                    </div>
                  </div>

                  <button className="btn-gold btn-event" onClick={() => navigateToPage("experiences")}>Plan Your Visit</button>
                </div>

                <div className="events-grid">
                  <div className="event-card" onClick={() => navigateToPage("experiences")}>
                    <div className="event-img-wrapper">
                      <img src="/assets/event_winter_ceremony.png" alt="Poolside Celebrations" className="event-img" />
                    </div>
                    <div className="event-card-body">
                      <h3 className="event-card-title">Poolside Celebrations</h3>
                      <p className="event-card-desc">Experience unique dinner setups, custom pool lighting, and stellar celebrations.</p>
                    </div>
                  </div>

                  <div className="event-card" onClick={() => navigateToPage("experiences")}>
                    <div className="event-img-wrapper">
                      <img src="/assets/event_private_retreat.png" alt="Private Gatherings" className="event-img" />
                    </div>
                    <div className="event-card-body">
                      <h3 className="event-card-title">Private Gatherings</h3>
                      <p className="event-card-desc">Cherish intimate moments with close family and friends in complete privacy.</p>
                    </div>
                  </div>

                  <div className="event-card" onClick={() => navigateToPage("experiences")}>
                    <div className="event-img-wrapper">
                      <img src="/assets/event_chef_table.png" alt="Staycations" className="event-img" />
                    </div>
                    <div className="event-card-body">
                      <h3 className="event-card-title">Weekend Staycations</h3>
                      <p className="event-card-desc">The perfect weekend luxury countryside escape just a short drive from Hyderabad.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonials Slider */}
              <section className="testimonials-section">
                <span className="eyebrow" style={{ display: "block", textAlign: "center", marginBottom: "15px" }}>REVIEWS</span>
                <h2 className="section-headline" style={{ textAlign: "center", marginBottom: "50px" }}>What Our Guests Say</h2>
                
                <div className="testimonial-slider-container">
                  <div className="testimonial-card">
                    <div className="stars-rating">
                      {Array.from({ length: TESTIMONIALS[activeTestimonial].rating }).map((_, i) => (
                        <span key={i} className="star-icon">★</span>
                      ))}
                    </div>
                    <p className="testimonial-text">"{TESTIMONIALS[activeTestimonial].text}"</p>
                    <div className="testimonial-author">
                      <span className="author-name">{TESTIMONIALS[activeTestimonial].name}</span>
                      <span className="author-location">{TESTIMONIALS[activeTestimonial].location}</span>
                    </div>
                  </div>

                  <div className="testimonial-dots">
                    {TESTIMONIALS.map((_, index) => (
                      <button
                        key={index}
                        className={`dot-btn ${index === activeTestimonial ? "active" : ""}`}
                        onClick={() => { setActiveTestimonial(index); trackClick("Testimonial Dots Click", `Slide index ${index}`); }}
                      />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* DEDICATED ABOUT PAGE */}
          {currentPage === "about" && (
            <div className="subpage-wrapper">
              <section className="subpage-hero" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/assets/about_living_room.png')" }}>
                <h2>OUR STORY</h2>
                <p>Where wilderness meets absolute private luxury.</p>
              </section>

              <section className="about-section" style={{ padding: "80px 8% 40px" }}>
                <div className="about-image-container">
                  <img src="/assets/about_living_room.png" alt="Living Room" className="about-image" />
                </div>
                <div className="about-content">
                  <span className="eyebrow">ABOUT PARTHOS</span>
                  <h2 className="section-headline">Where Luxury Meets Nature</h2>
                  <p className="about-text">
                    Nestled amidst lush greenery, Parthos Chalet Villa offers the perfect balance of comfort, privacy, and natural beauty.
                    Whether you're planning a weekend escape, family gathering, celebration, or staycation, every corner is designed to
                    help you relax and reconnect.
                  </p>
                  <p className="about-text" style={{ marginTop: "-16px" }}>
                    Our architecture blends high-end organic materials with modern comforts. We represent a bespoke space where guests can find absolute countryside tranquility without leaving Hyderabad.
                  </p>
                </div>
              </section>

              <section className="about-section about-reverse">
                <div className="about-content">
                  <span className="eyebrow">THE COUNTRY GETAWAY</span>
                  <h2 className="section-headline">Escape the City Noise</h2>
                  <p className="about-text">
                    Kongara Kalan offers beautiful landscapes and clean fresh air. Located less than 45 minutes from Hyderabad's tech hub, it is a convenient escape for weekends, social events, and relaxing staycations.
                  </p>
                  <div className="feature-item" style={{ flexDirection: "row", alignItems: "center", gap: "15px", textAlign: "left", marginBottom: "20px" }}>
                    <div className="feature-icon-wrapper" style={{ marginBottom: 0, width: "36px", height: "36px" }}>
                      <img src="/assets/peaceful.svg" className="feature-icon" style={{ width: "24px" }} alt="Eco" />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 700 }}>Eco-friendly luxury</h4>
                      <p className="feature-body" style={{ fontSize: "12px" }}>Built to complement the lush surrounding farm trees.</p>
                    </div>
                  </div>
                </div>
                <div className="about-image-container">
                  <img src="/assets/wellness_spa.png" alt="Villa Estate View" className="about-image" />
                </div>
              </section>
            </div>
          )}

          {/* DEDICATED STAY (ROOMS) PAGE */}
          {currentPage === "rooms" && (
            <div className="subpage-wrapper">
              <section className="subpage-hero" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/assets/suite_royal.png')" }}>
                <h2>LUXURY SUITES</h2>
                <p>Thoughtfully curated spaces built for absolute comfort.</p>
              </section>

              <section className="rooms-list-section" style={{ padding: "80px 8%" }}>
                {VILLA_ROOMS.map((room, idx) => (
                  <div key={room.id} className="room-detail-card" style={{ direction: idx % 2 === 1 ? "rtl" : "ltr" }}>
                    <div className="room-card-image">
                      <img src={room.image} alt={room.name} />
                    </div>
                    <div className="room-card-info" style={{ direction: "ltr" }}>
                      <h3 className="room-name">{room.name}</h3>
                      <p className="room-desc-detail">{room.description}</p>
                      
                      <div className="room-specs">
                        <span><strong>Guests:</strong> {room.guests}</span>
                        <span><strong>Size:</strong> {room.size}</span>
                        <span><strong>Rate:</strong> {room.priceLabel}</span>
                      </div>

                      <div className="room-features-badges">
                        {room.amenities.map((item, i) => (
                          <span key={i} className="amenity-badge">{item}</span>
                        ))}
                      </div>

                      <button className="btn-gold" style={{ padding: "12px 28px", marginTop: "15px" }} onClick={() => {
                        setBookingForm(prev => ({ ...prev, roomPreference: room.id }));
                        setShowBookingPopup(true);
                        trackClick("Room Select Click", `Selected Room: ${room.name}`);
                      }}>Book This Room</button>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          )}

          {/* DEDICATED EXPERIENCES PAGE */}
          {currentPage === "experiences" && (
            <div className="subpage-wrapper">
              <section className="subpage-hero" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/assets/event_winter_ceremony.png')" }}>
                <h2>VILLA EXPERIENCES</h2>
                <p>Tailored moments to relax, connect, and celebrate.</p>
              </section>

              <section className="experiences-page-grid">
                {EXPERIENCES_LIST.map((exp, idx) => (
                  <div key={idx} className="experience-detail-block" style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "4px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: "240px", overflow: "hidden" }}>
                      <img src={exp.image} alt={exp.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "var(--transition-smooth)" }} className="zoom-image-hover" />
                    </div>
                    <div style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px" }}>{exp.title}</h3>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--text-gray)", lineHeight: 1.6 }}>{exp.desc}</p>
                      <button className="btn-gold" style={{ alignSelf: "flex-start", marginTop: "10px", padding: "0 22px", height: "38px", fontSize: "11px" }} onClick={() => { setShowBookingPopup(true); trackClick("Experience Inquire Click", `Inquired: ${exp.title}`); }}>Inquire Now</button>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          )}

          {/* DEDICATED GALLERY PAGE */}
          {currentPage === "gallery" && (
            <div className="subpage-wrapper">
              <section className="subpage-hero" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/assets/event_chef_table.png')" }}>
                <h2>VILLA GALLERY</h2>
                <p>Take a visual journey through Parthos Chalet Villa.</p>
              </section>

              <section className="gallery-grid-section" style={{ padding: "80px 8%" }}>
                <div className="gallery-masonry">
                  {GALLERY_IMAGES.map((img, idx) => (
                    <div key={idx} className="gallery-item-card" onClick={() => trackClick("Gallery View", `Inspected asset ${idx}`)}>
                      <img src={img.src} alt={`Parthos View ${idx}`} />
                      <div className="gallery-item-tag">{img.tag}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* DEDICATED CONTACT PAGE */}
          {currentPage === "contact" && (
            <div className="subpage-wrapper">
              <section className="subpage-hero" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/assets/hero_bg.png')" }}>
                <h2>GET IN TOUCH</h2>
                <p>Plan your custom countryside escape with us today.</p>
              </section>

              <section className="contact-page-layout">
                <div className="contact-info-col" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "36px" }}>Connect With Us</h2>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", color: "var(--text-gray)", lineHeight: 1.6 }}>
                    Have questions about our rates, custom celebration catering, check-in options, or booking the entire estate? Fill out the form or reach us via phone or email.
                  </p>

                  <div className="footer-contact-info" style={{ gap: "24px" }}>
                    <div className="contact-item-block">
                      <span className="contact-key" style={{ fontSize: "12px" }}>Phone</span>
                      <span className="contact-val" style={{ fontSize: "18px", fontWeight: 600 }}>+91 XXXXX XXXXX</span>
                    </div>
                    <div className="contact-item-block">
                      <span className="contact-key" style={{ fontSize: "12px" }}>Email</span>
                      <span className="contact-val" style={{ fontSize: "18px", fontWeight: 600 }}>stay@parthoschaletvilla.com</span>
                    </div>
                    <div className="contact-item-block">
                      <span className="contact-key" style={{ fontSize: "12px" }}>Location</span>
                      <span className="contact-val" style={{ fontSize: "18px", fontWeight: 600 }}>Kongara Kalan, Hyderabad</span>
                    </div>
                  </div>
                </div>

                <div className="contact-form-col">
                  {!contactSubmitted ? (
                    <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px" }}>Send A Message</h3>
                      
                      <div className="form-group">
                        <label htmlFor="c-name">Full Name</label>
                        <input type="text" id="c-name" required value={contactForm.name} onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Your name" style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="c-email">Email Address</label>
                        <input type="email" id="c-email" required value={contactForm.email} onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))} placeholder="Your email" style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
                      </div>

                      <div className="form-group">
                        <label htmlFor="c-message">How can we help you?</label>
                        <textarea id="c-message" rows={4} required value={contactForm.message} onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))} placeholder="Message details (dates, events, specific details)" style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px", fontFamily: "var(--font-sans)" }}></textarea>
                      </div>

                      <button type="submit" className="btn-gold" style={{ padding: "12px 30px", height: "46px" }}>Submit Message</button>
                    </form>
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <div className="success-icon" style={{ margin: "0 auto 20px" }}>✓</div>
                      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", marginBottom: "10px" }}>Message Sent!</h3>
                      <p style={{ fontFamily: "var(--font-sans)", color: "var(--text-gray)" }}>Thank you for reaching out. A Parthos representative will contact you shortly.</p>
                      <button className="btn-gold" style={{ marginTop: "15px", padding: "0 20px", height: "36px" }} onClick={() => setContactSubmitted(false)}>Send Another Message</button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Booking CTA Section */}
          <section
            className="stay-section"
            style={{ background: "linear-gradient(to right, #0f1a19, #132221)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "280px", gap: "20px", marginTop: currentPage !== "home" && currentPage !== "admin" ? "60px" : 0 }}
          >
            <h2 className="stay-headline" style={{ fontSize: "38px", marginBottom: "0" }}>Ready for Your Perfect Escape?</h2>
            <p className="stay-text" style={{ maxWidth: "600px", margin: "0 auto", opacity: "0.8" }}>
              Book your stay today and experience luxury, privacy, and comfort in the heart of nature.
            </p>
            <button className="btn-gold btn-rooms" style={{ minWidth: "180px", height: "46px" }} onClick={() => { setShowBookingPopup(true); trackClick("Footer Booking Click", "Reserve Now clicked"); }}>Reserve Now</button>
          </section>

          {/* Footer Section */}
          <footer className="footer-section">
            <div className="footer-top">
              <div className="footer-brand">
                <h2 className="footer-logo">PARTHOS</h2>
                <span className="footer-tagline">Chalet Villa</span>
                <p className="footer-desc">
                  Parthos Chalet Villa is a premium private retreat near Hyderabad, offering luxury accommodations, peaceful surroundings, and memorable experiences for families, couples, and groups.
                </p>
                <div className="social-links">
                  <a href="#" className="social-link" aria-label="Instagram">
                    <img src="/assets/instagram.svg" alt="Instagram" />
                  </a>
                  <a href="#" className="social-link" aria-label="Facebook">
                    <img src="/assets/facebook.svg" alt="Facebook" />
                  </a>
                  <a href="#" className="social-link" aria-label="X">
                    <img src="/assets/twitter_x.svg" alt="X" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="footer-col-title">EXPLORE</h4>
                <ul className="footer-links-list">
                  <li className="footer-link-item">
                    <a onClick={() => navigateToPage("home")}>Home</a>
                  </li>
                  <li className="footer-link-item">
                    <a onClick={() => navigateToPage("about")}>About</a>
                  </li>
                  <li className="footer-link-item">
                    <a onClick={() => navigateToPage("rooms")}>Stay</a>
                  </li>
                  <li className="footer-link-item">
                    <a onClick={() => navigateToPage("experiences")}>Experiences</a>
                  </li>
                  <li className="footer-link-item">
                    <a onClick={() => navigateToPage("gallery")}>Gallery</a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="footer-col-title">STAY</h4>
                <ul className="footer-links-list">
                  <li className="footer-link-item">
                    <a onClick={() => navigateToPage("rooms")}>Luxury Rooms</a>
                  </li>
                  <li className="footer-link-item">
                    <a onClick={() => navigateToPage("rooms")}>Fine Dining</a>
                  </li>
                  <li className="footer-link-item">
                    <a onClick={() => navigateToPage("rooms")}>Wellness &amp; Spa</a>
                  </li>
                  <li className="footer-link-item">
                    <a onClick={() => navigateToPage("experiences")}>Private Events</a>
                  </li>
                </ul>
              </div>

              <div className="footer-contact-info">
                <h4 className="footer-col-title">Get in Touch</h4>
                <div className="contact-item-block">
                  <span className="contact-key">Phone</span>
                  <span className="contact-val">+91 XXXXX XXXXX</span>
                </div>
                <div className="contact-item-block">
                  <span className="contact-key">Email</span>
                  <span className="contact-val">stay@parthoschaletvilla.com</span>
                </div>
                <div className="contact-item-block">
                  <span className="contact-key">Location</span>
                  <span className="contact-val">Kongara Kalan, Hyderabad</span>
                </div>
              </div>
            </div>

            <img src="/assets/footer_divider.svg" alt="Footer Divider" className="footer-divider-img" />

            <div className="footer-bottom">
              <p className="copyright" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", width: "100%" }}>
                &copy; 2026 Parthos Chalet Villa. All rights reserved. 
                <span style={{ fontSize: "14px", color: "var(--primary-gold)", fontWeight: 500, marginLeft: "10px" }}>
                  Private. Peaceful. Unforgettable. ✨
                </span>
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
