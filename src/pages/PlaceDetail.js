import { db } from "../firebaseConfig";
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const PlaceDetailWeb = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const placeRef = doc(db, "Places", id);
        const docSnap = await getDoc(placeRef);
        if (docSnap.exists()) {
          setPlaceData({ id: docSnap.id, ...docSnap.data() });
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id, navigate]);

  if (loading) return <div style={styles.loader}>Exploring...</div>;
  if (!placeData) return null;

  return (
    <div style={styles.wrapper}>
      {/* 1. HERO HEADER */}
      <header style={styles.hero}>
        <img 
          src={placeData.coverImages?.[0] || "https://via.placeholder.com/1200x600"} 
          alt="cover" 
          style={styles.heroImg} 
        />
        <div style={styles.overlay} />
        <div style={styles.heroText}>
          <span style={styles.badge}>{placeData.category}</span>
          <h1 style={styles.title}>{placeData.name}</h1>
          <p style={styles.location}>📍 {placeData.city}, {placeData.address}</p>
        </div>
      </header>

      {/* 2. MAIN GRID */}
      <main style={styles.container}>
        <div style={styles.mainGrid}>
          
          {/* LEFT COLUMN: CONTENT */}
          <div style={styles.leftCol}>
            <section style={styles.section}>
              <h2 style={styles.secTitle}>About the Experience</h2>
              <p style={styles.description}>{placeData.description}</p>
            </section>

            <section style={styles.section}>
              <h2 style={styles.secTitle}>Amenities</h2>
              <div style={styles.tagGrid}>
                {placeData.facilities?.map((f, i) => (
                  <span key={i} style={styles.facilityTag}>✓ {f}</span>
                ))}
              </div>
            </section>

            {placeData.coverImages?.length > 1 && (
              <section style={styles.section}>
                <h2 style={styles.secTitle}>Gallery</h2>
                <div style={styles.gallery}>
                  {placeData.coverImages.slice(1).map((img, i) => (
                    <img key={i} src={img} style={styles.galleryImg} alt="Gallery" />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: QUICK INFO & MAP */}
          <aside style={styles.rightCol}>
            <div style={styles.stickyCard}>
              <div style={styles.priceRow}>
                <span style={styles.priceLabel}>Entrance Fee</span>
                <span style={styles.priceValue}>{placeData.entranceFee || "Free"}</span>
              </div>
              
              <hr style={styles.divider} />
              
              <div style={styles.infoRow}>
                <span style={styles.icon}>🕒</span>
                <div>
                  <div style={styles.infoLabel}>Opening Hours</div>
                  <div style={styles.infoValue}>{placeData.openingHours}</div>
                </div>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.icon}>✨</span>
                <div>
                  <div style={styles.infoLabel}>Best Time to Visit</div>
                  <div style={styles.infoValue}>{placeData.bestTime}</div>
                </div>
              </div>

              {placeData.latitude && (
                <div style={styles.mapWrap}>
                  <MapContainer 
                    center={[placeData.latitude, placeData.longitude]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[placeData.latitude, placeData.longitude]} />
                  </MapContainer>
                </div>
              )}

              <button style={styles.contactBtn} onClick={() => window.open(placeData.website)}>
                Visit Official Website
              </button>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};

const styles = {
  wrapper: { fontFamily: "Inter, system-ui, sans-serif", backgroundColor: "#fff", color: "#1a1a1a" },
  loader: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.2rem", color: "#666" },
  
  // Hero
  hero: { position: "relative", height: "60vh", minHeight: "400px" ,width:'100%',left:240},
  heroImg: { width: "70%", height: "100%", objectFit: "cover" },
  overlay: { width: "70%",position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))" },
  heroText: { position: "absolute", bottom: "10%", left: "5%", color: "#fff" },
  badge: { background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", padding: "5px 15px", borderRadius: "20px", fontSize: "0.9rem", textTransform: "uppercase" },
  title: { fontSize: "3.5rem", margin: "10px 0", fontWeight: "800" },
  location: { fontSize: "1.1rem", opacity: 0.9 },

  // Layout
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },
  mainGrid: { display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "60px", marginTop: "40px", alignItems: "start" },
  
  // Left Column
  section: { marginBottom: "40px" },
  secTitle: { fontSize: "1.5rem", marginBottom: "20px", borderLeft: "4px solid #000", paddingLeft: "15px" },
  description: { lineHeight: "1.8", color: "#444", fontSize: "1.1rem" },
  tagGrid: { display: "flex", flexWrap: "wrap", gap: "10px" },
  facilityTag: { padding: "8px 16px", background: "#f0f2f5", borderRadius: "8px", fontSize: "0.9rem", fontWeight: "500" },
  gallery: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
  galleryImg: { width: "100%", borderRadius: "12px", height: "200px", objectFit: "cover" },

  // Right Column (Sticky Card)
  stickyCard: { position: "sticky", top: "40px", padding: "30px", borderRadius: "24px", border: "1px solid #eee", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" },
  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  priceLabel: { color: "#666" },
  priceValue: { fontSize: "1.4rem", fontWeight: "700", color: "#22c55e" },
  divider: { border: "0", borderTop: "1px solid #eee", margin: "20px 0" },
  infoRow: { display: "flex", gap: "15px", marginBottom: "20px" },
  icon: { fontSize: "1.2rem" },
  infoLabel: { fontSize: "0.8rem", color: "#999", textTransform: "uppercase" },
  infoValue: { fontWeight: "600" },
  mapWrap: { height: "180px", borderRadius: "15px", overflow: "hidden", margin: "20px 0" },
  contactBtn: { width: "100%", padding: "15px", borderRadius: "12px", border: "none", background: "#000", color: "#fff", fontWeight: "600", cursor: "pointer" }
};

export default PlaceDetailWeb;