import React, { useEffect, useState } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const collectionsList = ["Places", "hotels", "restaurants", "travelServices", "transportation"];







export default function AdminDashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const navigate = useNavigate();

  const handleDetails = (item, type) => {
    switch (type.toLowerCase()) {
      case "restaurants":
        navigate(`/RestaurantDetail/${item.id}`);
        break;
      case "hotels":
        navigate(`/HotelDetail/${item.id}`);
        break;
      case "places":
        navigate(`/PlaceDetail/${item.id}`);
        break;
      // case "travelservices":
      //   navigate(`/services/${item.id}`);
      //   break;
      // case "transportation":
      //   navigate(`/transportation/${item.id}`);
      //   break;
      default:
        console.warn("Unknown type:", type);
    }
  };
  
  const handleEdit = (item, type) => {
    switch (type.toLowerCase()) {
      case "restaurants":
        navigate(`/restaurants/edit/${item.id}`);
        break;
      case "hotels":
        navigate(`/hotels/edit/${item.id}`);
        break;
      case "places":
        navigate(`/EditPlace/${item.id}`);
        break;
      // case "travelservices":
      //   navigate(`/services/edit/${item.id}`);
      //   break;
      // case "transportation":
      //   navigate(`/transportation/edit/${item.id}`);
      //   break;
      default:
        console.warn("Unknown type:", type);
    }
  };
  
  // State for Add Place Form
  // const [newPlace, setNewPlace] = useState({
  //   name: "",
  //   collection: "Places",
  //   description: "",
  //   image: "",
  //   type: ""
  // });

  useEffect(() => {
    fetchAllCollections();
  }, []);

  const fetchAllCollections = async () => {
    setLoading(true);
    try {
      let result = {};
      for (let colName of collectionsList) {
        const q = query(collection(db, colName), limit(40));
        const snapshot = await getDocs(q);
        result[colName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      setData(result);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  if (loading) return <div style={styles.loader}>Loading...</div>;

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>TRAVEL<span >MATE</span></div>
        <nav style={styles.navMenu}>
          {[{ id: "Dashboard", label: "Dashboard", icon: "📊" },
            { id: "Add", label: "Add Places", icon: "➕" }].map((item) => (
            <button   key={item.id}
            onClick={() => {
              if (item.id === "Add") {
                navigate("/AddPlaceScreen");
              } else {
                setActiveTab(item.id);
              }
            }}
              style={{...styles.navBtn, backgroundColor: activeTab === item.id ? "#2e7d32" : "transparent", color: activeTab === item.id ? "#fff" : "#64748b"}}>
              <span style={styles.navIcon}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={styles.main}>
        <header style={styles.topBar}>
          <h1 style={styles.pageTitle}>{activeTab}</h1>
          <div style={styles.adminBadge}>Super Admin</div>
        </header>

        <div style={styles.contentScroll}>
          {
            collectionsList.map((col) => (
              <section key={col} style={styles.section}>
                <div style={styles.sectionHeading}>
                  <h2 style={{textTransform: 'capitalize'}}>{col}</h2>
                  <span style={styles.countTag}>{data[col]?.length || 0} Items</span>
                </div>
                <div style={styles.grid}>
                  {data[col]?.map(item => (
                    <div key={item.id} style={styles.card}>
                      {/* ENHANCED SLIDER */}
                      <div style={styles.sliderContainer}>
                        <div style={styles.imageScrollContainer}>
                          {item.coverImages ? item.coverImages.map((url, i) => (
                            <img key={i} src={url} alt="" style={styles.sliderImg} />
                          )) : <img src={item.image || "../images/placeholderImage.jpg"} alt="" style={styles.sliderImg} />}
                        </div>
                        {item.coverImages?.length > 1 && <div style={styles.sliderBadge}>{item.coverImages.length} Photos</div>}
                      </div>
                      
                      <div style={styles.cardBody}>
                        <h3 style={styles.itemName}>{item.name || item.p_name}</h3>
                        <p style={styles.itemId}>Ref: {item.id.slice(0, 8)}</p>
                        <div style={styles.cardActions}>
                        <button
                            style={styles.btnSecondary}
                            onClick={() => handleDetails(item, col)}
                          >
                            Details
                          </button>
                          <button
                            style={styles.btnPrimary}
                            onClick={() => handleEdit(item, col)}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: { display: "flex", height: "100vh", backgroundColor: "#f8fafb", fontFamily: "'Inter', sans-serif" },
  sidebar: { width: "260px", backgroundColor: "#fff", padding: "24px", borderRight: "1px solid #eef2f6" },
  brand: { color: "#2e7d32", fontSize: "22px", fontWeight: "800", marginBottom: "40px", textAlign: "center" },
  navMenu: { display: "flex", flexDirection: "column", gap: "8px" },
  navBtn: { display: "flex", alignItems: "center", padding: "12px 16px", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", transition: "0.3s" },
  navIcon: { marginRight: "12px" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topBar: { height: "70px", backgroundColor: "#fff", borderBottom: "1px solid #eef2f6", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" },
  pageTitle: { fontSize: "20px", fontWeight: "700" },
  adminBadge: { backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
  contentScroll: { padding: "40px", overflowY: "auto", flex: 1 },
  section: { marginBottom: "50px" },
  sectionHeading: { display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "2px solid #e8f5e9", paddingBottom: "10px" },
  countTag: { color: "#2e7d32", fontSize: "14px", fontWeight: "600" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" },
  
  // BEAUTIFUL SLIDER
  card: { backgroundColor: "#fff", borderRadius: "18px", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.04)" },
  sliderContainer: { position: "relative", width: "100%", height: "180px", overflow: "hidden" },
  imageScrollContainer: { 
    display: "flex", overflowX: "auto", height: "100%", scrollSnapType: "x mandatory", 
    scrollbarWidth: "none", msOverflowStyle: "none" 
  },
  sliderImg: { minWidth: "100%", height: "100%", objectFit: "cover", scrollSnapAlign: "start" },
  sliderBadge: { 
    position: "absolute", bottom: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.6)", 
    color: "#fff", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "bold" 
  },
  
  cardBody: { padding: "20px" },
  itemName: { fontSize: "17px", fontWeight: "700", marginBottom: "5px" },
  itemId: { fontSize: "11px", color: "#94a3b8", marginBottom: "15px" },
  cardActions: { display: "flex", gap: "10px" },
  btnPrimary: { flex: 1, padding: "8px", border: "none", backgroundColor: "#2e7d32", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  btnSecondary: { flex: 1, padding: "8px", border: "1px solid #eef2f6", backgroundColor: "#fff", color: "#64748b", borderRadius: "8px", cursor: "pointer" },

  // FORM STYLES
  formCard: { backgroundColor: "#fff", padding: "40px", borderRadius: "20px", maxWidth: "600px", margin: "0 auto", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  label: { fontSize: "13px", fontWeight: "700", color: "#475569" },
  input: { padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none" },
  submitBtn: { padding: "15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", marginTop: "10px" },
  
  loader: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "800", color: "#2e7d32" },
  emptyState: { textAlign: "center", marginTop: "50px", color: "#94a3b8" },
  dashboardMenu:{}
};