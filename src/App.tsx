import { useState, useEffect } from "react";
import { useIntersectionObserver } from "./hooks/useIntersectionObserver";
import "./App.css";

// Slides data for Hero Carousel
const HERO_SLIDES = [
  {
    image: "/assets/main.jpg",
    title: "Escape to Space,\nSerenity & Scenic Views",
    description: "Nestled amidst lush greenery near Adibatla, Parthos Chalet is a private luxury villa designed for those seeking peace, privacy, and unforgettable moments."
  },
  {
    image: "/assets/swimming.jpg",
    title: "Relax By The\nInfinity Swimming Pool",
    description: "Take a refreshing dip while enjoying uninterrupted views of nature, open skies, and peaceful countryside surroundings."
  },
  {
    image: "/assets/1bhk_balcony.jpg",
    title: "Unwind on Expansive\nLush Green Lawns",
    description: "Enjoy absolute privacy and space designed for family gatherings, celebrations, reunions, and outdoor staycation comfort."
  }
];

// Room data for STAY page
const VILLA_ROOMS = [
  {
    id: "one-bhk-villa",
    name: "Canadian Wooden Villa",
    image: "/assets/main.jpg",
    description: "Our premium private sanctuary crafted with elegant Canadian wood and high rustic beams. Features a spacious living area, king-size bed, private terrace, and floor-to-ceiling glass windows offering panoramic garden views.",
    price: 18000,
    priceLabel: "₹18,000 / night",
    guests: "Ideal for 1-4 Guests",
    size: "1,200 sq ft",
    amenities: ["King Bed", "Private Terrace", "Living Room", "Infinity Pool Access", "Dedicated Service", "Premium Linens"]
  },
  {
    id: "outside-rooms",
    name: "Stone Elevated / Lawn Facing Studios",
    image: "/assets/new_rooms.jpg",
    description: "Two independent, elegantly styled elevated stone studios with spectacular lawn facing views. Perfect for larger families or groups, offering direct garden access, premium modern comforts, and privacy.",
    price: 12000,
    priceLabel: "₹12,000 / night (as addition to Villa)",
    guests: "Ideal for 5-8 Guests (Villa + Studios)",
    size: "800 sq ft",
    amenities: ["Queen Beds", "Garden Walkway", "Air Conditioned", "Private Entrances", "Smart TV", "Wifi Enabled"]
  }
];

// Testimonials data
const TESTIMONIALS = [
  {
    name: "The Rao Family",
    location: "Hyderabad / Adibatla Getaway",
    text: "The perfect combination of privacy, comfort, and nature. The lawn and infinity pool made our family gathering truly memorable.",
    rating: 5
  },
  {
    name: "Vikram Reddy",
    location: "Gachibowli, Hyderabad",
    text: "A peaceful getaway near Hyderabad. Spacious villa, beautiful views, and an incredibly relaxing atmosphere.",
    rating: 5
  }
];

// Experiences data
const EXPERIENCES_LIST = [
  {
    title: "Family Getaways",
    image: "/assets/kitty.jpg",
    desc: "Create precious family memories in spacious lounges and private yards. Ideal for bonding, indoor games, and sharing meals together away from the rush."
  },
  {
    title: "Poolside Celebrations",
    image: "/assets/swimming.jpg",
    desc: "Host anniversaries, birthdays, or close social milestones. Custom pool lights, high-end barbecue grates, and catering options make events unforgettable."
  },
  {
    title: "Weekend Staycations",
    image: "/assets/candle.jpg",
    desc: "The perfect country road trip. Reach Kongara Kalan in less than an hour from the city and sink into instant countryside peace."
  },
  {
    title: "Private Gatherings",
    image: "/assets/haldi.jpg",
    desc: "Secluded executive team meets or private celebrations. Benefit from high-speed internet, dedicated service, and spacious breakout lawns."
  }
];

// Gallery images mapping
const GALLERY_IMAGES = [
  { src: "/assets/main.jpg", tag: "Villa" },
  { src: "/assets/swimming.jpg", tag: "Pool" },
  { src: "/assets/1bhk_balcony.jpg", tag: "Villa" },
  { src: "/assets/new_rooms.jpg", tag: "Suites" },
  { src: "/assets/haldi.jpg", tag: "Celebrations" },
  { src: "/assets/haldi_2.jpg", tag: "Celebrations" },
  { src: "/assets/candle.jpg", tag: "Experiences" },
  { src: "/assets/kitty.jpg", tag: "Gatherings" },
  { src: "/assets/about.png", tag: "Interiors" },
  { src: "/assets/fine_dining.png", tag: "Experiences" }
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

  // Helper to get today's date in YYYY-MM-DD for date-picker restrictions
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  
  // Resolve page view from current path for true URL routing and SEO
  const getPageFromPath = (path: string) => {
    if (path === "/about") return "about";
    if (path === "/stay" || path === "/rooms") return "rooms";
    if (path === "/experiences") return "experiences";
    if (path === "/gallery") return "gallery";
    if (path === "/contact") return "contact";
    if (path === "/admin") return "admin";
    return "home";
  };
  const currentPage = getPageFromPath(currentPath);
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
    guests: "1-4 Guests",
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

  // Dynamic Page Title & Meta Description update for One-Page SEO
  useEffect(() => {
    let title = "Parthos Chalet Villa | Luxury Private Farm Villa near Hyderabad";
    let description = "Escape to Parthos Chalet Villa near Hyderabad (Kongara Kalan). Enjoy a premium private countryside getaway with a private infinity pool, luxury suites, and staycation amenities.";

    switch (currentPage) {
      case "home":
        title = "Parthos Chalet Villa | Luxury Private Farm Villa near Hyderabad";
        description = "Escape to Parthos Chalet Villa near Hyderabad (Kongara Kalan). Enjoy a premium private countryside getaway with a private infinity pool, luxury suites, and staycation amenities.";
        break;
      case "about":
        title = "About Us | Parthos Chalet Villa Hyderabad";
        description = "Discover our story. Parthos Chalet is an eco-friendly luxury private villa in Kongara Kalan, Hyderabad, blending nature with absolute comfort.";
        break;
      case "rooms":
        title = "Stay & Luxury Suites | Parthos Chalet Villa";
        description = "Explore our premium Canadian Wooden Villa and Stone Elevated / Lawn Facing Studios. Book your private sanctuary with luxury amenities near Hyderabad.";
        break;
      case "experiences":
        title = "Experiences & Private Events | Parthos Chalet Villa";
        description = "Host poolside celebrations, family getaways, and weekend staycations at Parthos Chalet. Enjoy custom setups and personalized countryside hospitality.";
        break;
      case "gallery":
        title = "Gallery | Photo Tour of Parthos Chalet Villa";
        description = "View real pictures of our luxury infinity pool, farm rooms, premium interiors, and celebrations at Parthos Chalet Villa.";
        break;
      case "contact":
        title = "Contact Us & Book | Parthos Chalet Villa";
        description = "Get in touch with Parthos Chalet Villa. Plan your custom countryside getaway and reserve your dates today.";
        break;
      case "admin":
        title = "Admin Dashboard | Parthos Chalet";
        description = "Secure portal for booking log and reservation management.";
        break;
    }

    document.title = title;
    
    // Dynamic on-page SEO meta tag manager
    const updateMetaTag = (attrType: "name" | "property", attrVal: string, contentVal: string) => {
      const selector = `meta[${attrType}="${attrVal}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attrType, attrVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", contentVal);
    };

    updateMetaTag("name", "description", description);
    
    // Open Graph (Facebook / WhatsApp / LinkedIn previews)
    updateMetaTag("property", "og:title", title);
    updateMetaTag("property", "og:description", description);
    updateMetaTag("property", "og:type", "website");
    updateMetaTag("property", "og:url", window.location.href);
    updateMetaTag("property", "og:image", `${window.location.origin}/assets/main.jpg`);

    // Twitter Card previews
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", title);
    updateMetaTag("name", "twitter:description", description);
    updateMetaTag("name", "twitter:image", `${window.location.origin}/assets/main.jpg`);
  }, [currentPage]);

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
    }, 60000); // 1 minute
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
    const targetPath = pageName === "home" ? "/" : (pageName === "rooms" ? "/stay" : `/${pageName}`);
    navigateToPath(targetPath);
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
    setBookingForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "guests") {
        if (value === "1-4 Guests") {
          updated.roomPreference = "one-bhk-villa";
        } else {
          updated.roomPreference = "outside-rooms";
        }
      }
      return updated;
    });
  };

  const handleClosePopup = () => {
    setShowBookingPopup(false);
    setTimeout(() => {
      if (window.location.pathname !== "/admin") {
        setShowBookingPopup(true);
        trackClick("Modal Displayed", "Landing Booking Form Popup (Re-show)");
      }
    }, 120000); // 2 minutes
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

  // Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbiyPFevM5cV8SZDlf-Vbf3fL2SPlqoBCsyOdcx2zrmhkK7LMtCdYG-x63ISdT9g_8O/exec";

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

    // Trigger Google Apps Script email notifications
    try {
      const emailParams = {
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: bookingForm.guests,
        roomPreference: VILLA_ROOMS.find(r => r.id === bookingForm.roomPreference)?.name || bookingForm.roomPreference,
        submittedAt: newBooking.submittedAt,
        page: activePage
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Required to allow silent redirection of Apps Script response
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailParams)
      });
      
      console.log("Booking email request sent to Google Apps Script.");
    } catch (error) {
      console.error("Failed to send booking emails:", error);
    }

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
        guests: "1-4 Guests",
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

    // Trigger Google Apps Script email notifications
    try {
      const emailParams = {
        name: contactForm.name,
        email: contactForm.email,
        phone: "-",
        checkIn: "-",
        checkOut: "-",
        guests: "-",
        roomPreference: `Message: ${contactForm.message}`,
        submittedAt: newInquiry.submittedAt,
        page: activePage
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailParams)
      });

      console.log("Contact email request sent to Google Apps Script.");
    } catch (error) {
      console.error("Failed to send contact emails:", error);
    }

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
                <button className="modal-close" onClick={handleClosePopup}>&times;</button>
                
                {!bookingConfirmed ? (
                  <form onSubmit={handleBookingSubmit} className="booking-modal-form">
                    <h3 className="modal-title">Book Your Escape</h3>
                    <p className="modal-subtitle">Reserve your luxury countryside experience near Hyderabad.</p>
                    
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input type="text" id="name" name="name" required value={bookingForm.name} onChange={handleBookingChange} placeholder="Enter your name" autoComplete="name" />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" required value={bookingForm.email} onChange={handleBookingChange} placeholder="Enter email" autoComplete="email" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" required value={bookingForm.phone} onChange={handleBookingChange} placeholder="Phone number" autoComplete="tel" />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="checkIn">Check-In</label>
                        <input type="date" id="checkIn" name="checkIn" required value={bookingForm.checkIn} onChange={handleBookingChange} min={getTodayDateString()} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="checkOut">Check-Out</label>
                        <input type="date" id="checkOut" name="checkOut" required value={bookingForm.checkOut} onChange={handleBookingChange} min={bookingForm.checkIn || getTodayDateString()} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="guests">Number of Guests</label>
                      <select id="guests" name="guests" value={bookingForm.guests} onChange={handleBookingChange}>
                        <option value="1-4 Guests">1-4 Guests</option>
                        <option value="5-8 Guests">5-8 Guests</option>
                        <option value="9-12 Guests">9-12 Guests</option>
                        <option value="12+ Guests">12+ Guests</option>
                      </select>
                    </div>

                    <button type="submit" className="btn-gold modal-submit-btn">Reserve Now</button>
                  </form>
                ) : (
                  <div className="booking-success-message">
                    <div className="success-icon">✓</div>
                    <h3>Reservation Requested!</h3>
                    <p>Thank you, {bookingForm.name}. We will review your booking request for <strong>{bookingForm.guests}</strong> and contact you within 2 hours to confirm availability.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Header Navigation */}
          <header className={`header-nav ${isScrolled || currentPage !== "home" ? "scrolled" : ""}`}>
            <a className="logo-container" onClick={() => { navigateToPage("home"); setIsMobileMenuOpen(false); }}>
              <img src="/assets/Logo.svg" alt="Parthos Chalet Logo" className="logo-image" />
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
                <img src="/assets/Logo.svg" alt="Parthos Chalet Logo" className="logo-image-mobile" />
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
                      <img 
                        src={slide.image} 
                        alt="Chalet Villa View" 
                        className="hero-image" 
                        fetchPriority={index === 0 ? "high" : "low"}
                        loading={index === 0 ? "eager" : "lazy"} 
                      />
                      <div className="hero-overlay" />
                      <div className="hero-content">
                        {index === 0 && (
                          <span className="hero-eyebrow" style={{ display: "block", color: "var(--primary-gold)", letterSpacing: "3px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
                            Luxury Farm Stay Near Hyderabad
                          </span>
                        )}
                        <h1 className="hero-title">
                          {slide.title.split("\n").map((line, i) => (
                            <span key={i} style={{ display: "block" }}>
                              {line}
                            </span>
                          ))}
                        </h1>
                        <p className="hero-desc">{slide.description}</p>
                        <div className="hero-ctas">
                          <button className="btn-gold hero-btn" onClick={() => { setShowBookingPopup(true); trackClick("Hero Button Click", "Book Your Stay Clicked"); }}>Book Your Stay</button>
                          <button className="btn-gold hero-btn outline" onClick={() => navigateToPage("rooms")} style={{ background: "transparent", border: "1px solid white", marginLeft: "15px" }}>Explore The Villa</button>
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

              {/* Features/Highlights Strip */}
              <section
                ref={featuresRef as any}
                className={`features-section reveal-element ${featuresVisible ? "revealed" : ""}`}
              >
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <span style={{ fontSize: "28px" }}>🌿</span>
                  </div>
                  <h3 className="feature-title">Expansive Private Lawn</h3>
                  <p className="feature-body">Perfect for family gatherings, celebrations, outdoor games, and memorable evenings.</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <span style={{ fontSize: "28px" }}>🏊</span>
                  </div>
                  <h3 className="feature-title">Infinity Pool Experience</h3>
                  <p className="feature-body">Take a refreshing dip while enjoying uninterrupted views of nature.</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <span style={{ fontSize: "28px" }}>🏡</span>
                  </div>
                  <h3 className="feature-title">Exclusive Private Villa</h3>
                  <p className="feature-body">Spacious interiors thoughtfully designed for comfort, relaxation, and togetherness.</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <span style={{ fontSize: "28px" }}>🌅</span>
                  </div>
                  <h3 className="feature-title">Peaceful Countryside Escape</h3>
                  <p className="feature-body">A calm retreat away from the city's noise, traffic, and daily routine.</p>
                </div>
              </section>

              <div className="section-divider" />

              {/* About Section Summary */}
              <section
                ref={aboutRef as any}
                className={`about-section reveal-element ${aboutVisible ? "revealed" : ""}`}
              >
                <div className="about-image-container">
                  <img src="/assets/about.png" alt="Living Room" className="about-image" loading="lazy" />
                </div>
                <div className="about-content">
                  <span className="eyebrow">ABOUT PARTHOS CHALET</span>
                  <h2 className="section-headline">Where Luxury Meets Nature</h2>
                  <p className="about-text">
                    Surrounded by open landscapes and serene greenery, Parthos Chalet offers the perfect balance of modern comfort and natural beauty. Whether you're planning a weekend getaway, family celebration, friends reunion, or simply a quiet escape, every corner is designed to help you slow down and reconnect.
                  </p>
                  <p className="about-text" style={{ marginTop: "-12px", fontSize: "14px", color: "var(--text-gray)" }}>
                    With a spacious private villa, beautifully maintained lawns, and a stunning infinity pool, Parthos Chalet creates experiences that stay with you long after your visit.
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
                  <span className="eyebrow">STAY EXPERIENCE</span>
                  <h2 className="stay-headline">More Than Just A Stay</h2>
                  <p className="stay-text" style={{ marginBottom: "25px" }}>
                    Experience the comfort of a thoughtfully designed private villa where every space invites relaxation.
                  </p>

                  <div className="stay-features-list" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "35px", textAlign: "left" }}>
                    <div className="stay-feat-item">
                      <h4 style={{ fontFamily: "var(--font-sans)", color: "var(--primary-gold)", fontWeight: 700, margin: "0 0 5px 0", fontSize: "14px" }}>🏡 Private Villa</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-gray)", margin: 0, lineHeight: 1.4 }}>Spacious bedrooms, comfortable living areas, and modern amenities designed for a relaxing stay.</p>
                    </div>
                    <div className="stay-feat-item">
                      <h4 style={{ fontFamily: "var(--font-sans)", color: "var(--primary-gold)", fontWeight: 700, margin: "0 0 5px 0", fontSize: "14px" }}>🏊 Infinity Pool</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-gray)", margin: 0, lineHeight: 1.4 }}>A beautiful pool experience surrounded by greenery and open skies.</p>
                    </div>
                    <div className="stay-feat-item">
                      <h4 style={{ fontFamily: "var(--font-sans)", color: "var(--primary-gold)", fontWeight: 700, margin: "0 0 5px 0", fontSize: "14px" }}>🌿 Outdoor Spaces</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-gray)", margin: 0, lineHeight: 1.4 }}>Large lawns and open seating areas ideal for gatherings, celebrations, and peaceful evenings.</p>
                    </div>
                    <div className="stay-feat-item">
                      <h4 style={{ fontFamily: "var(--font-sans)", color: "var(--primary-gold)", fontWeight: 700, margin: "0 0 5px 0", fontSize: "14px" }}>🌅 Nature Views</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-gray)", margin: 0, lineHeight: 1.4 }}>Wake up to fresh air, birdsong, and scenic countryside surroundings.</p>
                    </div>
                  </div>

                  <button className="btn-gold btn-rooms" onClick={() => navigateToPage("rooms")}>Explore The Villa</button>
                </div>

                <div className="experience-grid">
                  <div className="experience-card" onClick={() => navigateToPage("rooms")}>
                    <div className="card-img-wrapper">
                      <img src="/assets/main.jpg" alt="Canadian Wooden Villa" className="experience-img" loading="lazy" />
                      <div className="card-overlay">
                        <h3 className="card-title">Canadian Wooden Villa</h3>
                      </div>
                    </div>
                  </div>

                  <div className="experience-card" onClick={() => navigateToPage("rooms")}>
                    <div className="card-img-wrapper">
                      <img src="/assets/new_rooms.jpg" alt="Stone Elevated / Lawn Facing Studios" className="experience-img" loading="lazy" />
                      <div className="card-overlay">
                        <h3 className="card-title">Stone Elevated / Lawn Facing Studios</h3>
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
                <div className="events-content" style={{ maxWidth: "550px" }}>
                  <span className="eyebrow">EXPERIENCES</span>
                  <h2 className="section-headline">Create Moments Worth Remembering</h2>
                  <p className="events-text">
                    Whether you're celebrating a special occasion or simply escaping the city, Parthos Chalet offers the perfect setting.
                  </p>

                  <div className="events-list" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "20px" }}>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Family Getaways</span>
                    </div>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Weekend Staycations</span>
                    </div>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Birthday Celebrations</span>
                    </div>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Friends Reunions</span>
                    </div>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Pre-Wedding Shoots</span>
                    </div>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Corporate Outings</span>
                    </div>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Anniversaries</span>
                    </div>
                    <div className="event-bullet-item">
                      <span className="gold-bullet" />
                      <span className="bullet-label">Poolside Evenings</span>
                    </div>
                  </div>

                  <button className="btn-gold btn-event" style={{ marginTop: "30px" }} onClick={() => navigateToPage("experiences")}>Plan Your Visit</button>
                </div>

                <div className="events-grid">
                  <div className="event-card" onClick={() => navigateToPage("experiences")}>
                    <div className="event-img-wrapper">
                      <img src="/assets/kitty.jpg" alt="Family Getaways" className="event-img" loading="lazy" />
                    </div>
                    <div className="event-card-body">
                      <h3 className="event-card-title">Family Getaways</h3>
                      <p className="event-card-desc">Create precious family memories in spacious lounges and private yards.</p>
                    </div>
                  </div>

                  <div className="event-card" onClick={() => navigateToPage("experiences")}>
                    <div className="event-img-wrapper">
                      <img src="/assets/swimming.jpg" alt="Poolside Celebrations" className="event-img" loading="lazy" />
                    </div>
                    <div className="event-card-body">
                      <h3 className="event-card-title">Poolside Celebrations</h3>
                      <p className="event-card-desc">Take a refreshing dip while enjoying custom pool lights and barbecue setups.</p>
                    </div>
                  </div>

                  <div className="event-card" onClick={() => navigateToPage("experiences")}>
                    <div className="event-img-wrapper">
                      <img src="/assets/candle.jpg" alt="Weekend Staycations" className="event-img" loading="lazy" />
                    </div>
                    <div className="event-card-body">
                      <h3 className="event-card-title">Weekend Staycations</h3>
                      <p className="event-card-desc">The perfect weekend luxury countryside escape just a short drive from Hyderabad.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Why Choose Parthos Chalet Section */}
              <section className="why-choose-section" style={{ padding: "80px 8%", backgroundColor: "#f9fcfb", textAlign: "center", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
                <span className="eyebrow" style={{ display: "block", marginBottom: "10px" }}>WHY GUESTS LOVE STAYING HERE</span>
                <h2 className="section-headline" style={{ marginBottom: "50px", textAlign: "center" }}>Why Choose Parthos Chalet</h2>
                <div className="why-choose-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "25px" }}>
                  <div className="why-item" style={{ background: "white", padding: "24px", borderRadius: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "flex-start", gap: "15px", textAlign: "left" }}>
                    <div style={{ flexShrink: 0, marginTop: "2px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: 700 }}>Private Villa Experience</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-gray)" }}>Complete absolute privacy for your group with exclusive farm stay access.</p>
                    </div>
                  </div>
                  <div className="why-item" style={{ background: "white", padding: "24px", borderRadius: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "flex-start", gap: "15px", textAlign: "left" }}>
                    <div style={{ flexShrink: 0, marginTop: "2px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a15 15 0 0 0-8.197 2.372c-.417.276-.233.923.272.935A15.002 15.002 0 0 1 12 18a15.002 15.002 0 0 1 7.925-12.693c.505-.012.69.659.272.935A15 15 0 0 0 12 2Z"/><path d="M12 18v4"/></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: 700 }}>Large Landscaped Lawn</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-gray)" }}>Spacious manicured gardens for games, activities, and hosting celebrations.</p>
                    </div>
                  </div>
                  <div className="why-item" style={{ background: "white", padding: "24px", borderRadius: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "flex-start", gap: "15px", textAlign: "left" }}>
                    <div style={{ flexShrink: 0, marginTop: "2px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C6 7 7 6 8.5 6c1.5 0 2.5 1 4 1 1.3 0 1.9-.5 2.5-1"/><path d="M2 12c.6.5 1.2 1 2.5 1 1.5 0 2.5-1 4-1 1.5 0 2.5 1 4 1 1.3 0 1.9-.5 2.5-1"/><path d="M2 18c.6.5 1.2 1 2.5 1 1.5 0 2.5-1 4-1 1.5 0 2.5 1 4 1 1.3 0 1.9-.5 2.5-1"/></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: 700 }}>Infinity Swimming Pool</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-gray)" }}>A clean, beautifully designed private pool overlooking natural green views.</p>
                    </div>
                  </div>
                  <div className="why-item" style={{ background: "white", padding: "24px", borderRadius: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "flex-start", gap: "15px", textAlign: "left" }}>
                    <div style={{ flexShrink: 0, marginTop: "2px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M2 12h20"/><path d="M12 2v20"/></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: 700 }}>Peaceful Surroundings</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-gray)" }}>Surrounded by nature and serene agricultural landscapes.</p>
                    </div>
                  </div>
                  <div className="why-item" style={{ background: "white", padding: "24px", borderRadius: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "flex-start", gap: "15px", textAlign: "left" }}>
                    <div style={{ flexShrink: 0, marginTop: "2px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: 700 }}>Ideal for Families</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-gray)" }}>The perfect setup to enjoy peaceful weekends with relatives and kids.</p>
                    </div>
                  </div>
                  <div className="why-item" style={{ background: "white", padding: "24px", borderRadius: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "flex-start", gap: "15px", textAlign: "left" }}>
                    <div style={{ flexShrink: 0, marginTop: "2px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: 700 }}>Hyderabad Weekend Escape</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-gray)" }}>Convenient drive from ORR, Adibatla, and the main city areas.</p>
                    </div>
                  </div>
                  <div className="why-item" style={{ background: "white", padding: "24px", borderRadius: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "flex-start", gap: "15px", textAlign: "left" }}>
                    <div style={{ flexShrink: 0, marginTop: "2px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 10H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"/><path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M12 10v10"/></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: 700 }}>Outdoor Seating Areas</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-gray)" }}>Cosy garden setups and terraces for relaxing and stargazing.</p>
                    </div>
                  </div>
                  <div className="why-item" style={{ background: "white", padding: "24px", borderRadius: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", display: "flex", alignItems: "flex-start", gap: "15px", textAlign: "left" }}>
                    <div style={{ flexShrink: 0, marginTop: "2px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: 700 }}>Sunset Views</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-gray)" }}>Stunning unobstructed twilight skyline views over the private property.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Nearby Section */}
              <section className="nearby-section" style={{ padding: "80px 8% 100px", background: "linear-gradient(rgba(15,26,25,0.95), rgba(15,26,25,0.95)), url('/assets/hero_bg.png') no-repeat center/cover", color: "white", textAlign: "center" }}>
                <span className="eyebrow" style={{ display: "block", marginBottom: "10px", color: "var(--primary-gold)" }}>CONVENIENTLY LOCATED</span>
                <h2 className="section-headline" style={{ color: "white", textAlign: "center", marginBottom: "20px" }}>Close To The City. Far From The Noise.</h2>
                <p style={{ maxWidth: "700px", margin: "0 auto 15px", lineHeight: "1.7", color: "rgba(255,255,255,0.85)" }}>
                  Parthos Chalet offers the perfect countryside escape while remaining easily accessible from Hyderabad, Adibatla, and the airport corridor.
                </p>
                <p style={{ maxWidth: "700px", margin: "0 auto", lineHeight: "1.7", color: "rgba(255,255,255,0.8)" }}>
                  Enjoy the tranquility of nature without spending hours travelling.
                </p>
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
              <section className="subpage-hero" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/assets/about.png')" }}>
                <h1>OUR STORY</h1>
                <p>Where wilderness meets absolute private luxury.</p>
              </section>

              <section className="about-section" style={{ padding: "80px 8% 40px" }}>
                <div className="about-image-container">
                  <img src="/assets/about.png" alt="Living Room" className="about-image" loading="lazy" />
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
                  <img src="/assets/wellness_spa.png" alt="Villa Estate View" className="about-image" loading="lazy" />
                </div>
              </section>
            </div>
          )}

          {/* DEDICATED STAY (ROOMS) PAGE */}
          {currentPage === "rooms" && (
            <div className="subpage-wrapper">
              <section className="subpage-hero" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/assets/suite_royal.png')" }}>
                <h1>ESTATE ACCOMMODATION</h1>
                <p>Private luxury countryside living, booked as a complete estate package tailored to your group size.</p>
              </section>

              <section className="rooms-list-section" style={{ padding: "80px 8%" }}>
                <div style={{ textAlign: "center", marginBottom: "50px", color: "var(--text-gray)" }}>
                  <p style={{ fontSize: "16px", maxWidth: "700px", margin: "0 auto" }}>
                    To ensure absolute privacy, we host only one group at a time. The entire estate or villa sections are automatically reserved for you based on the number of guests.
                  </p>
                </div>
                {VILLA_ROOMS.map((room, idx) => (
                  <div key={room.id} className="room-detail-card" style={{ direction: idx % 2 === 1 ? "rtl" : "ltr" }}>
                    <div className="room-card-image">
                      <img src={room.image} alt={room.name} loading="lazy" />
                    </div>
                    <div className="room-card-info" style={{ direction: "ltr" }}>
                      <h3 className="room-name">{room.name}</h3>
                      <p className="room-desc-detail">{room.description}</p>
                      
                      <div className="room-features-badges">
                        {room.amenities.map((item, i) => (
                          <span key={i} className="amenity-badge">{item}</span>
                        ))}
                      </div>

                      <button className="btn-gold" style={{ padding: "12px 28px", marginTop: "15px" }} onClick={() => {
                        setBookingForm(prev => ({
                          ...prev,
                          roomPreference: room.id,
                          guests: room.id === "one-bhk-villa" ? "1-4 Guests" : "5-8 Guests"
                        }));
                        setShowBookingPopup(true);
                        trackClick("Room Select Click", `Selected Room: ${room.name}`);
                      }}>Book Your Stay</button>
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
                <h1>VILLA EXPERIENCES</h1>
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
                <h1>VILLA GALLERY</h1>
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
                <h1>GET IN TOUCH</h1>
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
                      <span className="contact-val" style={{ fontSize: "18px", fontWeight: 600 }}><a href="tel:+917569287138" style={{ color: "inherit", textDecoration: "none" }}>+91 75692 87138</a></span>
                    </div>
                    <div className="contact-item-block">
                      <span className="contact-key" style={{ fontSize: "12px" }}>Email</span>
                      <span className="contact-val" style={{ fontSize: "18px", fontWeight: 600 }}><a href="mailto:stay@parthoschalet.com" style={{ color: "inherit", textDecoration: "none" }}>stay@parthoschalet.com</a></span>
                    </div>
                    <div className="contact-item-block">
                      <span className="contact-key" style={{ fontSize: "12px" }}>Location</span>
                      <span className="contact-val" style={{ fontSize: "18px", fontWeight: 600 }}>
                        <a href="https://share.google/OuLXJAMqjIjKYH5Gk" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                          Parthos Chalet Villa 📍
                          <span style={{ display: "block", fontSize: "13px", color: "var(--primary-gold)", fontWeight: 500, marginTop: "4px", textDecoration: "underline" }}>Get Directions ➔</span>
                        </a>
                      </span>
                    </div>
                  </div>

                  <div className="mini-map-container" style={{ width: "100%", height: "220px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "0 4px 15px rgba(0,0,0,0.06)", marginTop: "10px" }}>
                    <iframe
                      title="Parthos Chalet Location Map"
                      src="https://maps.google.com/maps?q=Parthos%20Chalet%20Villa%2C%20Kongara%20Kalan%2C%20Hyderabad&t=&z=14&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>

                <div className="contact-form-col">
                  {!contactSubmitted ? (
                    <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px" }}>Send A Message</h3>
                      
                      <div className="form-group">
                        <label htmlFor="c-name">Full Name</label>
                        <input type="text" id="c-name" required value={contactForm.name} onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Your name" autoComplete="name" style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="c-email">Email Address</label>
                        <input type="email" id="c-email" required value={contactForm.email} onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))} placeholder="Your email" autoComplete="email" style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
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
            <h2 className="stay-headline" style={{ fontSize: "38px", marginBottom: "0" }}>Ready For Your Next Escape?</h2>
            <p className="stay-text" style={{ maxWidth: "600px", margin: "0 auto", opacity: "0.8" }}>
              Experience private luxury, open spaces, and unforgettable moments at Parthos Chalet.
            </p>
            <button className="btn-gold btn-rooms" style={{ minWidth: "180px", height: "46px" }} onClick={() => { setShowBookingPopup(true); trackClick("Footer Booking Click", "Reserve Now clicked"); }}>Reserve Your Stay Today</button>
          </section>

          {/* Footer Section */}
          <footer className="footer-section">
            <div className="footer-top">
              <div className="footer-brand">
                <div className="logo-container" onClick={() => { navigateToPage("home"); }} style={{ marginBottom: "15px", display: "inline-block" }}>
                  <img src="/assets/Logo.svg" alt="Parthos Chalet Logo" className="logo-image-footer" />
                </div>
                <p className="footer-desc">
                  Parthos Chalet is a luxury farm stay near Hyderabad offering a private villa, infinity pool, expansive lawns, and peaceful countryside experiences for families, friends, and celebrations.
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
                    <a onClick={() => navigateToPage("experiences")}>Private Events</a>
                  </li>
                </ul>
              </div>

              <div className="footer-contact-info">
                <h4 className="footer-col-title">Get in Touch</h4>
                <div className="contact-item-block">
                  <span className="contact-key">Phone</span>
                  <span className="contact-val"><a href="tel:+917569287138" style={{ color: "inherit", textDecoration: "none" }}>+91 75692 87138</a></span>
                </div>
                <div className="contact-item-block">
                  <span className="contact-key">Email</span>
                  <span className="contact-val"><a href="mailto:stay@parthoschalet.com" style={{ color: "inherit", textDecoration: "none" }}>stay@parthoschalet.com</a></span>
                </div>
                <div className="contact-item-block">
                  <span className="contact-key">Location</span>
                  <span className="contact-val">
                    <a href="https://share.google/OuLXJAMqjIjKYH5Gk" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                      Parthos Chalet Villa 📍
                      <span style={{ display: "block", fontSize: "11px", color: "var(--primary-gold)", marginTop: "2px", textDecoration: "underline" }}>Get Directions ➔</span>
                    </a>
                  </span>
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
