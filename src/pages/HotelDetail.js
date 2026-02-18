import { db } from "../firebaseConfig";
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

const HotelDetailWeb = () => {
  const { id } = useParams(); // hotel ID from URL
  const navigate = useNavigate();

  const [hotelData, setHotelData] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch hotel
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const hotelRef = doc(db, "hotels", id);
        const docSnap = await getDoc(hotelRef);
        if (docSnap.exists()) {
          const hotel = { id: docSnap.id, ...docSnap.data() };
          setHotelData(hotel);

          // Fetch provider immediately after hotel fetch
          if (hotel.providerId) {
            const providerRef = doc(db, "users", hotel.providerId);
            const providerSnap = await getDoc(providerRef);
            if (providerSnap.exists()) {
              setProviderData({ id: providerSnap.id, ...providerSnap.data() });
            } else {
              console.warn("Provider not found!");
            }
          }
        } else {
          alert("Hotel not found!");
          navigate("/"); // go back if hotel not found
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching hotel or provider data");
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id, navigate]);

  // Update Approved Status
  const handleStatusUpdate = async (status) => {
    if (!hotelData) return;
    setUpdating(true);
    try {
      const hotelRef = doc(db, "hotels", hotelData.id);
      await updateDoc(hotelRef, { approved: status });
      alert(`Hotel ${status ? "Approved" : "Dismissed"} Successfully`);
      navigate("/"); // go back to dashboard
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
    setUpdating(false);
  };

  if (loading) return <div>Loading hotel details...</div>;
  if (!hotelData) return null;

  return (
    <div style={styles.container}>
      {/* TOP NAVIGATION / ACTIONS */}
      <header style={styles.header}>
        <button onClick={() => navigate("/")} style={styles.dismissBtn}>← Back to Dashboard</button>
        {hotelData?.approved ? ("") :(
        <div style={styles.actionGroup}>
          <button 
            disabled={updating} 
            onClick={() => handleStatusUpdate(false)} 
            style={styles.dismissBtn}
          >
            Dismiss
          </button>
          <button 
            disabled={updating} 
            onClick={() => handleStatusUpdate(true)} 
            style={styles.approveBtn}
          >
            {updating ? "Processing..." : "Approve Listing"}
          </button>
        </div>
        )}
      </header>

      {/* HERO SECTION: IMAGE GALLERY */}
      <section style={styles.heroSection}>
        <div style={styles.mainImageContainer}>
          <img 
            src={hotelData.coverImages?.[0] || "https://via.placeholder.com/800x400"} 
            style={styles.mainImg} 
            alt="Main" 
          />
        </div>
        <div style={styles.sideImages}>
          {hotelData.coverImages?.slice(1, 3).map((img, i) => (
            <img key={i} src={img} style={styles.subImg} alt="Thumbnail" />
          ))}
          <div style={styles.morePhotosBadge}>
            +{hotelData.coverImages?.length > 3 ? hotelData.coverImages.length - 3 : 0} Photos
          </div>
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <div style={styles.contentGrid}>
        {/* Left Column: Hotel Info */}
        <div style={styles.leftCol}>
          <div style={styles.titleCard}>
            <span style={styles.typeBadge}>Luxury Hotel</span>
            <h1 style={styles.hotelName}>{hotelData.name}</h1>
            <p style={styles.locationText}>📍 {hotelData.address?.city}, {hotelData.address?.street}</p>
            
            <div style={styles.tagsRow}>
              {hotelData.amenitiesTags?.map((tag, i) => (
                <span key={i} style={styles.tagPill}>{tag}</span>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h3>Hotel description</h3>
            <p style={styles.description}>{hotelData.description}</p>
          </div>

          <div style={styles.card}>
            <h3>✨ Highlights</h3>
            <ul style={styles.highlightsList}>
              {hotelData.highlights?.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>

          {/* PROVIDER INFO */}
          {providerData && (
            <div style={styles.card}>
              <h3>🧑 Provider Information</h3>
              <p><strong>Name:</strong> {providerData.name}</p>
              <p><strong>Email:</strong> {providerData.email}</p>
              <p><strong>Phone:</strong> {providerData.phoneNumber}</p>
              <p><strong>NRC Number:</strong> {providerData.nrcNumber}</p>
              <p><strong>Verified:</strong> {providerData.verified ? "✅" : "❌"}</p>
              <p><strong>Address:</strong> {providerData.address}</p>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Policies */}
        <div style={styles.rightCol}>
          <div style={styles.priceCard}>
            <p style={styles.label}>Starting Price</p>
            <h2 style={styles.priceValue}>${hotelData.startingPrice} <small>/ night</small></h2>
            <hr style={styles.divider} />
            <p style={styles.label}>Room Types Available</p>
            {hotelData.roomTypes?.map((room, i) => (
              <div key={i} style={styles.roomRow}>
                <span>{room.name}</span>
                <strong>${room.price}</strong>
              </div>
            ))}
          </div>

          <div style={styles.card}>
            <h3>🏨 Facilities</h3>
            <div style={styles.facilityGrid}>
              {hotelData.facilities?.map((f, i) => (
                <div key={i} style={styles.facilityItem}>{f}</div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h3>📜 Policies</h3>
            <div style={styles.policyItem}>
              <strong>Check-in:</strong> {hotelData.policies?.checkIn}
            </div>
            <div style={styles.policyItem}>
              <strong>Check-out:</strong> {hotelData.policies?.checkOut}
            </div>
            {hotelData.policies?.predefined?.map((f,i)=>(
              <div style={styles.policyItem} key={i}>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// export default HotelDetailWeb;


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
  card: { backgroundColor: "#fff", padding: "24px", borderRadius: "16px", marginBottom: "25px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
  titleCard: { marginBottom: "30px" },
  typeBadge: { color: "#16a34a", fontWeight: "700", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" },
  hotelName: { fontSize: "36px", fontWeight: "800", margin: "10px 0" },
  locationText: { color: "#64748b", fontSize: "18px" },
  
  tagsRow: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" },
  tagPill: { backgroundColor: "#f1f5f9", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", color: "#475569" },
  
  description: { lineHeight: "1.7", color: "#475569", fontSize: "16px" },
  highlightsList: { paddingLeft: "20px", color: "#475569", lineHeight: "2" },
  
  rightCol: { position: "sticky", top: "20px", height: "fit-content" },
  priceCard: { backgroundColor: "#1e293b", color: "#fff", padding: "30px", borderRadius: "20px", marginBottom: "25px" },
  priceValue: { fontSize: "32px", margin: "10px 0" },
  label: { fontSize: "13px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600" },
  divider: { border: "none", borderTop: "1px solid #334155", margin: "20px 0" },
  roomRow: { display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" },
  
  facilityGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  facilityItem: { padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "13px", fontWeight: "600", textAlign: "center" },
  policyItem: { marginBottom: "10px", fontSize: "15px" }
};

export default HotelDetailWeb;