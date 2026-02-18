import { db } from "../firebaseConfig";
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

const RestaurantDetailWeb = () => {
  const { id } = useParams(); // restaurant ID from URL
  const navigate = useNavigate();

  const [restaurantData, setRestaurantData] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch restaurant & provider
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const restaurantRef = doc(db, "restaurants", id);
        const docSnap = await getDoc(restaurantRef);
        if (docSnap.exists()) {
          const restaurant = { id: docSnap.id, ...docSnap.data() };
          setRestaurantData(restaurant);

          if (restaurant.providerId) {
            const providerRef = doc(db, "users", restaurant.providerId);
            const providerSnap = await getDoc(providerRef);
            if (providerSnap.exists()) {
              setProviderData({ id: providerSnap.id, ...providerSnap.data() });
            } else {
              console.warn("Provider not found!");
            }
          }
        } else {
          alert("Restaurant not found!");
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching restaurant or provider data");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, navigate]);

  // Approve/Dismiss
  const handleStatusUpdate = async (status) => {
    if (!restaurantData) return;
    setUpdating(true);
    try {
      const restaurantRef = doc(db, "restaurants", restaurantData.id);
      await updateDoc(restaurantRef, { approved: status });
      alert(`Restaurant ${status ? "Approved" : "Dismissed"} Successfully`);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
    setUpdating(false);
  };

  if (loading) return <div>Loading restaurant details...</div>;
  if (!restaurantData) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => navigate("/")} style={styles.dismissBtn}>← Back to Dashboard</button>
        {!restaurantData.approved && (
          <div style={styles.actionGroup}>
            <button disabled={updating} onClick={() => handleStatusUpdate(false)} style={styles.dismissBtn}>Dismiss</button>
            <button disabled={updating} onClick={() => handleStatusUpdate(true)} style={styles.approveBtn}>
              {updating ? "Processing..." : "Approve Listing"}
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.mainImageContainer}>
          <img 
            src={restaurantData.coverImages?.[0] || "https://via.placeholder.com/800x400"} 
            style={styles.mainImg} 
            alt="Main" 
          />
        </div>
        <div style={styles.sideImages}>
          {restaurantData.coverImages?.slice(1, 3).map((img, i) => (
            <img key={i} src={img} style={styles.subImg} alt="Thumbnail" />
          ))}
          <div style={styles.morePhotosBadge}>
            +{restaurantData.coverImages?.length > 3 ? restaurantData.coverImages.length - 3 : 0} Photos
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div style={styles.contentGrid}>
        {/* Left Column */}
        

        <div style={styles.leftCol}>
    <div style={styles.titleCard}>
      <span style={styles.typeBadge}>Restaurant</span>
      <h1 style={styles.hotelName}>{restaurantData.name}</h1>
      <p style={styles.locationText}>
        📍 {restaurantData?.address}, <strong>{restaurantData?.city}</strong>
      </p>

      {/* Tags */}
      <div style={styles.tagsRow}>
        {restaurantData.features?.map((tag, i) => (
          <span key={i} style={styles.tagPill}>{tag}</span>
        ))}
      </div>
    </div>

    {/* Description */}
    <div style={styles.card}>
      <h3>Restaurant Description</h3>
      <p style={styles.description}>{restaurantData.description}</p>
    </div>

    {/* Cuisine */}
    <div style={styles.card}>
      <h3>🍽 Cuisine</h3>
      <div style={styles.tagsRow}>
        {restaurantData.cuisine?.map((c, i) => (
          <span key={i} style={styles.tagPill}>{c}</span>
        ))}
      </div>
    </div>

    {/* Popular Dishes with Image */}
    <div style={styles.card}>
      <h3>🔥 Popular Dishes</h3>
      <div style={styles.dishGrid}>
        {restaurantData.popularDishes?.map((dish, i) => (
          <div key={i} style={styles.dishCard}>
            <img
              src={dish.image || "https://via.placeholder.com/150"}
              alt={dish.name}
              style={styles.dishImage}
            />
            <div style={styles.dishInfo}>
              <strong>{dish.name}</strong>
              <p>{dish.price} MMK</p>
              <p>🌶 {dish.spicy || "Not specified"}</p>
              <p>❤️ {dish.likes || 0}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Provider Info */}
    {providerData && (
      <div style={styles.card}>
        <h3>🧑 Provider Information</h3>
        <p><strong>Name:</strong> {providerData.name}</p>
        <p><strong>Email:</strong> {providerData.email}</p>
        <p><strong>Phone:</strong> {providerData.phoneNumber}</p>
        <p><strong>NRC:</strong> {providerData.nrcNumber}</p>
        <p><strong>Verified:</strong> {providerData.verified ? "✅" : "❌"}</p>
      </div>
    )}
  </div>

  {/* Right Column */}
  <div style={styles.rightCol}>
    {/* Pricing Card */}
    <div style={styles.priceCard}>
      <p style={styles.label}>Price Range</p>
      <h2 style={styles.priceValue}>{restaurantData.priceRange}</h2>
      <hr style={styles.divider} />
      <p style={styles.label}>Average Cost Per Person</p>
      <h3>{restaurantData.averageCostPerPerson} MMK</h3>
    </div>

    {/* Opening Hours */}
    <div style={styles.card}>
      <h3>🕒 Opening Hours</h3>
      <p>{restaurantData.openingHours || "Not Available"}</p>
    </div>

    {/* Payment Methods */}
    <div style={styles.card}>
      <h3>💳 Payment Methods</h3>
      <div style={styles.tagsRow}>
        {restaurantData.paymentMethods?.map((method, i) => (
          <span key={i} style={styles.tagPill}>{method}</span>
        ))}
      </div>
    </div>

    {/* Features */}
    <div style={styles.card}>
      <h3>✅ Features</h3>
      <div style={styles.facilityGrid}>
        {restaurantData.features?.map((f, i) => (
          <div key={i} style={styles.facilityItem}>{f}</div>
        ))}
      </div>
    </div>

    {/* Contact */}
    <div style={styles.card}>
      <h3>📞 Contact</h3>
      <p>{restaurantData.phone || "+959 403719053"}</p>
      <p>{restaurantData.email || "mingyikyite1@gmail.com"}</p>
    </div>
  </div>
</div>
    </div>
  );
};

const styles = {
  container: { padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif", color: "#1e293b" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  backBtn: { background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "16px", fontWeight: "600" },
  actionGroup: { display: "flex", gap: "12px" },
  approveBtn: { backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
  dismissBtn: { backgroundColor: "#fff", color: "green", border: "1px solid green", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },

  heroSection: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", height: "450px", borderRadius: "20px", overflow: "hidden", marginBottom: "40px" },
  mainImageContainer: { width: "100%", height: "100%" },
  mainImg: { width: "100%", height: "100%", objectFit: "cover" },
  sideImages: { display: "flex", flexDirection: "column", gap: "10px", position: "relative" },
  subImg: { width: "100%", height: "calc(50% - 5px)", objectFit: "cover" },
  morePhotosBadge: { position: "absolute", bottom: "20px", right: "20px", backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", padding: "8px 15px", borderRadius: "8px", fontSize: "14px" },

  contentGrid: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "40px" },
  leftCol: {},
  rightCol: { position: "sticky", top: "20px", height: "fit-content" },
  card: { backgroundColor: "#fff", padding: "24px", borderRadius: "16px", marginBottom: "25px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
  titleCard: { marginBottom: "30px" },
  typeBadge: { color: "#16a34a", fontWeight: "700", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" },
  hotelName: { fontSize: "36px", fontWeight: "800", margin: "10px 0" },
  locationText: { color: "#64748b", fontSize: "18px" },
  tagsRow: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" },
  tagPill: { backgroundColor: "#f1f5f9", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", color: "#475569" },
  description: { lineHeight: "1.7", color: "#475569", fontSize: "16px" },
  facilityGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  facilityItem: { padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "13px", fontWeight: "600", textAlign: "center" },
  priceCard: { backgroundColor: "#1e293b", color: "#fff", padding: "30px", borderRadius: "20px", marginBottom: "25px" },
  priceValue: { fontSize: "32px", margin: "10px 0" },
  label: { fontSize: "13px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600" },
  divider: { border: "none", borderTop: "1px solid #334155", margin: "20px 0" },
  roomRow: { display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" },
  dishGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px"
  },
  dishCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  dishImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover"
  },
  dishInfo: {
    padding: "10px",
    fontSize: "14px"
  },
  
};

export default RestaurantDetailWeb;
