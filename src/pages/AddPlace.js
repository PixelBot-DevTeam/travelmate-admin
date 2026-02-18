import React, { useState,useEffect } from "react";
import { ChevronLeft, Save, Globe, Phone } from "lucide-react";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents,useMap } from "react-leaflet";
import { 
  MapPin, Clock, ShieldCheck, Image as ImageIcon, 
  ChevronRight, ChevronLeft, Save, Plus, X, Globe, Phone, Layers, Info, CheckCircle2
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
// Leaflet marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const AddPlaceWeb = () => {


// ... inside your AddPlaceWeb component ...

function SearchField() {
  const map = useMap(); // Access the Leaflet map instance

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search for a place (e.g. Shwedagon Pagoda)',
    });

    map.addControl(searchControl);

    // Listen for the result to update your 'location' state
    map.on('geosearch/showlocation', (result) => {
      setLocation({ lat: result.location.y, lng: result.location.x });
    });

    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
}
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // Start at 0 for Map Selection
  const [loading, setLoading] = useState(false);
  
  const [coverImages, setCoverImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "pagoda",
    description: "",
    address: "",
    city: "",
    openingHours: "9:00 AM - 5:00 PM",
    entranceFee: "Free",
    bestTime: "morning",
    dressCode: "modest",
    contactPhone: "",
    website: "",
    facilities: [],
    tags: []
  });

  // PREDEFINED DATA
  const categories = ["pagoda", "attraction", "park", "museum", "nature", "playground", "shopping", "historical", "zoo", "viewpoint"];
  const bestTimeOptions = ["sunrise", "morning", "afternoon", "sunset", "evening", "night"];
  const dressCodeOptions = ["any", "modest (shoulders covered)", "formal", "no footwear required", "traditional only"];
  const facilityOptions = ["Parking", "Public Restrooms", "Free WiFi", "Cafeteria", "Souvenir Shop", "Wheelchair Accessible", "Guide Service", "ATM", "Photography Allowed", "Security"];
  const tagOptions = ["Family Friendly", "Historical", "Photography Spot", "Quiet Area", "Crowded", "Hidden Gem", "Instagrammable", "Hiking", "Spiritual"];

  // Map Click Handler
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return location ? <Marker position={[location.lat, location.lng]} /> : null;
  }

  const pickCoverImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImages([...coverImages, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = (listName, item) => {
    const currentList = formData[listName];
    const newList = currentList.includes(item) 
      ? currentList.filter(i => i !== item) 
      : [...currentList, item];
    setFormData({ ...formData, [listName]: newList });
  };

  const handleSave = async () => {
    if (!location) return alert("Please select a location on the map first!");
    setLoading(true);
    try {
      const payload = {
        ...formData,
        coverImages,
        coordinates: { lat: location.lat, lng: location.lng },
        approved: false,
        rating: 0,
        createdAt: serverTimestamp(),
        providerId: auth.currentUser?.uid || "admin_web"
      };

      await addDoc(collection(db, "Places"), payload);
      alert("Destination added successfully!");
      navigate("/");
    } catch (err) {
      console.error("Firebase Error:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <span style={styles.typeBadge}>{step === 0 ? "Initial Step" : `Step ${step} of 3`}</span>
          <h1 style={styles.hotelName}>{step === 0 ? "Select Location" : formData.name || "New Destination"}</h1>
        </div>
        <div style={styles.actionGroup}>
          {step > 0 && <button onClick={() => setStep(step - 1)} style={styles.dismissBtn}>Back</button>}
          {step === 0 ? (
            <button onClick={() => location ? setStep(1) : alert("Click on map first")} style={styles.approveBtn} disabled={!location}>
              Confirm Location <ChevronRight size={18}/>
            </button>
          ) : step < 3 ? (
            <button onClick={() => setStep(step + 1)} style={styles.approveBtn}>Next Step <ChevronRight size={18}/></button>
          ) : (
            <button onClick={handleSave} disabled={loading} style={styles.approveBtn}>
              {loading ? "Saving..." : "Publish to App"}
            </button>
          )}
        </div>
      </header>

      <div style={styles.contentGrid}>
        <div style={styles.leftCol}>
          

          {/* STEP 1: IDENTITY */}
          {step === 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}><Layers size={18} color="#16a34a"/> Basic Information</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Category</label>
                <div style={styles.tagGrid}>
                  {categories.map(c => (
                    <button key={c} style={formData.category === c ? styles.tagPillActive : styles.tagPill} onClick={() => setFormData({...formData, category: c})}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Place Name</label>
                <input style={styles.input} name="name" placeholder="Name of the pagoda, park or attraction" value={formData.name} onChange={handleChange} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea style={{...styles.input, height: '120px'}} name="description" placeholder="Describe what makes this place special..." value={formData.description} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* STEP 2: LOGISTICS */}
          {step === 1 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}><Clock size={18} color="#16a34a"/> Travel Logistics</h3>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Best Time to Visit</label>
                  <select style={styles.input} name="bestTime" value={formData.bestTime} onChange={handleChange}>
                    {bestTimeOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Dress Code</label>
                  <select style={styles.input} name="dressCode" value={formData.dressCode} onChange={handleChange}>
                    {dressCodeOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Entrance Fee</label>
                  <input style={styles.input} name="entranceFee" placeholder="e.g. 10,000 MMK or Free" value={formData.entranceFee} onChange={handleChange} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Opening Hours</label>
                  <input style={styles.input} name="openingHours" value={formData.openingHours} onChange={handleChange} />
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.inputGroup}><label style={styles.label}>City</label>
                <input style={styles.input} name="city" placeholder="e.g. Yangon" value={formData.city} onChange={handleChange} /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Street Address</label>
                <input style={styles.input} name="address" placeholder="e.g. Bahan Township" value={formData.address} onChange={handleChange} /></div>
              </div>
            </div>
          )}

          {/* STEP 3: FEATURES */}
          {step === 2 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}><ShieldCheck size={18} color="#16a34a"/> Facilities & Tags</h3>
              <label style={styles.label}>Available Facilities</label>
              <div style={styles.tagGrid}>
                {facilityOptions.map(f => (
                  <button key={f} style={formData.facilities.includes(f) ? styles.tagPillActive : styles.tagPill} onClick={() => handleToggle('facilities', f)}>{f}</button>
                ))}
              </div>
              <label style={{...styles.label, marginTop: '20px'}}>Tags / Keywords</label>
              <div style={styles.tagGrid}>
                {tagOptions.map(t => (
                  <button key={t} style={formData.tags.includes(t) ? styles.tagPillActive : styles.tagPill} onClick={() => handleToggle('tags', t)}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: MEDIA */}
          {step === 3 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}><ImageIcon size={18} color="#16a34a"/> Gallery Upload</h3>
              <div style={styles.galleryGrid}>
                {coverImages.map((img, i) => (
                  <div key={i} style={styles.imagePreviewContainer}>
                    <img src={img} style={styles.imagePreview} alt="upload" />
                    <button onClick={() => setCoverImages(coverImages.filter((_, idx) => idx !== i))} style={styles.removeBtn}><X size={12}/></button>
                  </div>
                ))}
                <label style={styles.uploadBox}><Plus size={24} color="#64748b" /><input type="file" hidden onChange={pickCoverImage} /></label>
              </div>
            </div>
          )}
        </div>

        {/* STICKY RIGHT COLUMN */}
        <div style={styles.rightCol}>
          <div style={styles.card}>
              <h3 style={styles.cardTitle}><MapPin size={20} color="#16a34a"/> 1. Click on the map to drop a marker</h3>
              <div style={{...styles.mapContainer, height: '500px'}}>
                <MapContainer center={[16.8661, 96.1951]} zoom={12} style={{ height: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <SearchField />
                  <LocationMarker />
                </MapContainer>
              </div>
              {location && (
                <div style={styles.locationSuccess}>
                  <CheckCircle2 size={18} color="#16a34a" /> Location Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              )}
            </div>

            <hr style={styles.divider} />
            <div style={styles.infoBox}>
              <Info size={16} />
              <p>Your coordinates are locked. Move to next steps to describe the destination.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif", color: "#1e293b" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  actionGroup: { display: "flex", gap: "12px" },
  approveBtn: { backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", display: 'flex', alignItems: 'center', gap: '8px' },
  dismissBtn: { backgroundColor: "#fff", color: "#16a34a", border: "1px solid #16a34a", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
  
  contentGrid: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "40px" },
  card: { backgroundColor: "#fff", padding: "24px", borderRadius: "16px", marginBottom: "25px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
  cardTitle: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", fontSize: "18px", fontWeight: "700" },
  
  typeBadge: { color: "#16a34a", fontWeight: "700", textTransform: "uppercase", fontSize: "12px" },
  hotelName: { fontSize: "32px", fontWeight: "800", margin: "5px 0" },
  
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "15px", flex: 1 },
  label: { fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", display: 'flex', alignItems: 'center', gap: '6px' },
  input: { padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "15px", outline: "none", fontFamily: "inherit" },
  darkInput: { padding: "12px", backgroundColor: "#334155", border: "none", color: "white", borderRadius: "8px", fontSize: "15px", outline: "none" },
  row: { display: "flex", gap: "15px" },

  mapContainer: { borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" },
  locationSuccess: { marginTop: '10px', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#16a34a', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'},
  
  tagGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  tagPill: { padding: "8px 16px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: "13px", color: "#64748b", transition: '0.2s' },
  tagPillActive: { padding: "8px 16px", borderRadius: "20px", border: "1px solid #16a34a", background: "#f0fdf4", color: "#16a34a", fontWeight: "600" },

  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  imagePreviewContainer: { position: "relative", height: "120px" },
  imagePreview: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" },
  removeBtn: { position: "absolute", top: "-5px", right: "-5px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", padding: "4px", cursor: 'pointer' },
  uploadBox: { border: "2px dashed #cbd5e1", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", height: "120px", cursor: "pointer" },

  rightCol: { position: "sticky", top: "20px", height: "fit-content" },
  priceCard: { backgroundColor: "#1e293b", color: "#fff", padding: "30px", borderRadius: "20px" },
  divider: { border: "none", borderTop: "1px solid #334155", margin: "20px 0" },
  infoBox: { display: 'flex', gap: '10px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }
};

export default AddPlaceWeb;