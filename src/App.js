import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/Dashboard';
import HotelDetailWeb from './pages/HotelDetail';
import RestaurantDetailWeb from './pages/RestaurantDetail';
import AddPlaceWeb from './pages/AddPlace';
import EditPlaceWeb from './pages/EditPlace';
import PlaceDetailWeb from './pages/PlaceDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/HotelDetail/:id" element={<HotelDetailWeb />} />
      <Route path="/RestaurantDetail/:id" element={<RestaurantDetailWeb />} />
      <Route path="/AddPlaceScreen" element={<AddPlaceWeb />} />
      <Route path="/EditPlace/:id" element={<EditPlaceWeb />} />
      <Route path="/PlaceDetail/:id" element={<PlaceDetailWeb />} />



    </Routes>
  );
}

export default App;
