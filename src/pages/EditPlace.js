import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents,useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

import MarkerClusterGroup from "react-leaflet-cluster";
import { 
    MapPin, Clock, ShieldCheck, Image as ImageIcon, 
    Save, Plus, X, Globe, Phone, Layers, Info, 
    CheckCircle2, Loader2, ChevronRight
  } from "lucide-react";
  

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet icon setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const EditPlaceWeb = () => {
  const { id } = useParams(); // Get document ID from URL /edit/:id
  const navigate = useNavigate();

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
  function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => {
      if (coords) {
        map.setView([coords.lat, coords.lng], 15);
      }
    }, [coords, map]);
    return null;
  }
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [coverImages, setCoverImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "", category: "pagoda", description: "", address: "", city: "",
    openingHours: "", entranceFee: "", bestTime: "morning", 
    dressCode: "modest", contactPhone: "", website: "", 
    facilities: [], tags: []
  });

  // PREDEFINED OPTIONS
  const categories = ["pagoda", "attraction", "park", "museum", "nature", "playground"];
  const bestTimeOptions = ["Sunrise", "Morning", "Afternoon", "Sunset", "Evening"];
  const dressCodeOptions = ["Casual", "Modest Required", "No Shoes", "Formal"];
  const facilityOptions = ["Parking", "WiFi", "Restrooms", "Cafeteria", "Wheelchair Access","Food stalls"];
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        const docRef = doc(db, "Places", id);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // 1. Set the form data
          setFormData(prev => ({ ...prev, ...data }));
          
          // 2. Map the separate lat/long fields into the location state
          if (data.latitude && data.longitude) {
            setLocation({ 
              lat: data.latitude, 
              lng: data.longitude 
            });
          }
          
          setCoverImages(data.coverImages || []);
        } else {
          alert("No such document!");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchPlaceData();
  }, [id, navigate]);

  // Map Click logic
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return location ? <Marker position={[location.lat, location.lng]} /> : null;
  }
  const tagOptions = [
    "Historic",
    "Family Friendly",
    "Romantic",
    "Scenic",
    "Cultural",
    "Adventure",
    "Photography",
    "Peaceful",
    "religious"
  ];
  const [step, setStep] = useState(0);


  const pickCoverImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImages([...coverImages, reader.result]);
      reader.readAsDataURL(file);
    }
  };

  const handleToggle = (listName, item) => {
    const currentList = formData[listName] || [];
    const newList = currentList.includes(item) 
      ? currentList.filter(i => i !== item) 
      : [...currentList, item];
    setFormData({ ...formData, [listName]: newList });
  };

  // 2. Update Data
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "Places", id);
      await updateDoc(docRef, {
        ...formData,
        coverImages,
        // Save back as separate fields to match your DB structure
        latitude: location.lat,
        longitude: location.lng,
        updatedAt: serverTimestamp()
      });
      alert("Place updated successfully!");
      navigate("/");
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView([center.lat, center.lng], 15);
      }
    }, [center, map]);
    return null;
  }
  
  if (fetching) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={48} color="#16a34a" />
        <p>Loading place data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <span style={styles.typeBadge}>{step === 0 ? "Initial Step" : `Step ${step +1} of 4`}</span>
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
<button onClick={handleUpdate} disabled={loading} style={styles.approveBtn}>

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
                <input style={styles.input} name="name" placeholder="Name of the pagoda, park or attraction" value={formData.p_name} onChange={handleChange} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea style={{...styles.input, height: '120px'}} name="description" placeholder="Describe what makes this place special..." value={formData.detail} onChange={handleChange} />
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
    <ChangeView center={location} /> {/* This will move the camera when data loads */}
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

// Styles (Matching your previous UI)
const styles = {
  container: { padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif", color: "#1e293b" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", gap: "20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  typeBadge: { color: "#16a34a", fontWeight: "700", textTransform: "uppercase", fontSize: "12px" },
  hotelName: { fontSize: "32px", fontWeight: "800", margin: "5px 0" },
  actionGroup: { display: "flex", gap: "12px" },
  approveBtn: { backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
  dismissBtn: { backgroundColor: "#fff", color: "#64748b", border: "1px solid #e2e8f0", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
  
  stepTabs: { display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" },
  tab: { padding: "10px 20px", border: "none", background: "none", color: "#64748b", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  activeTab: { padding: "10px 20px", border: "none", background: "none", color: "#16a34a", cursor: "pointer", fontSize: "14px", fontWeight: "800", borderBottom: "2px solid #16a34a" },

  contentGrid: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "40px" },
  card: { backgroundColor: "#fff", padding: "24px", borderRadius: "16px", marginBottom: "25px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
  cardTitle: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", fontSize: "18px", fontWeight: "700" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "15px", flex: 1 },
  label: { fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" },
  input: { padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "15px", outline: "none", width: '100%' },
  darkInput: { padding: "12px", backgroundColor: "#334155", border: "none", color: "white", borderRadius: "8px", fontSize: "15px", outline: "none", width: '100%' },
  row: { display: "flex", gap: "15px" },
  
  mapContainer: { height: "400px", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" },
  tagGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  tagPill: { padding: "8px 16px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: "12px" },
  tagPillActive: { padding: "8px 16px", borderRadius: "20px", border: "1px solid #16a34a", background: "#f0fdf4", color: "#16a34a", fontWeight: "600" },
  
  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  imagePreviewContainer: { position: "relative", height: "120px" },
  imagePreview: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" },
  removeBtn: { position: "absolute", top: "-5px", right: "-5px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", padding: "4px" },
  uploadBox: { border: "2px dashed #cbd5e1", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", height: "120px", cursor: "pointer" },
  
  rightCol: { position: "sticky", top: "20px", height: "fit-content" },
  priceCard: { backgroundColor: "#1e293b", color: "#fff", padding: "30px", borderRadius: "20px" },
  divider: { border: "none", borderTop: "1px solid #334155", margin: "20px 0" },
  infoBox: { display: 'flex', gap: '10px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }
};

export default EditPlaceWeb;