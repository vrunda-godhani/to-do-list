import React, { useState, Suspense, useEffect } from "react";
import axios from "axios";
import "./Gmap.css"; // Import CSS file
import { IoArrowBackCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { TiWeatherPartlySunny } from "react-icons/ti";
import Menu from "./Menu";
import { useLocation } from "react-router-dom";


// Lazy Load Google Maps Components
const LoadScript = React.lazy(() => import("@react-google-maps/api").then(module => ({ default: module.LoadScript })));
const GoogleMap = React.lazy(() => import("@react-google-maps/api").then(module => ({ default: module.GoogleMap })));
const Marker = React.lazy(() => import("@react-google-maps/api").then(module => ({ default: module.Marker })));
const InfoWindow = React.lazy(() => import("@react-google-maps/api").then(module => ({ default: module.InfoWindow })));

const GOOGLE_MAPS_API_KEY = "AIzaSyBVmUpDpf8bw7zHdlC5YtVExaZUvVRGFCQ";
const WEATHER_API_KEY = "17535e06f7d48c5b09c1a3f767906525";

const mapContainerStyle = { width: "100%", height: "500px", borderRadius: "10px", overflow: "hidden" };
const defaultCenter = { lat: 20, lng: 0 };

function WeatherMap() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  const locationState = useLocation();
  const { city, country } = locationState.state || {};

  useEffect(() => {
    const fetchCoordinatesFromCity = async () => {
      if (city && country) {
        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city + ", " + country)}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const result = response.data.results[0];
          if (result) {
            const { lat, lng } = result.geometry.location;
            setLocation({ lat, lng });
            setAddress(result.formatted_address);
          }
        } catch (error) {
          console.error("Failed to geocode city:", error);
        }
      }
    };
  
    fetchCoordinatesFromCity();
  }, [city, country]);
  
  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setLocation({ lat, lng });
    setWeather(null);
    setLoading(true);

    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`
      );
      setWeather(weatherRes.data);

      const geocodeRes = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (geocodeRes.data.results.length > 0) {
        const components = geocodeRes.data.results[0].address_components;
        let city = "";
        let country = "";
        
        for (const comp of components) {
          if (
            comp.types.includes("locality") ||
            comp.types.includes("administrative_area_level_1") ||
            comp.types.includes("administrative_area_level_2")
          ) {
            city = city || comp.long_name;
          }
          if (comp.types.includes("country")) {
            country = comp.long_name;
          }
        }
        

        setAddress(city ? `${city}, ${country}` : "Location not found");
      } else {
        setAddress("Location not found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setWeather(null);
      setAddress("Unable to fetch address");
    }

    setLoading(false);
  };

  return (
    <div className="map-outer-container">
      <div className="map-container">
      <Menu />

      <Suspense fallback={<div className="loading-spinner"></div>}>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
    
        <button className="Gback-button" onClick={() => navigate("/Weather")}>
          <TiWeatherPartlySunny /> 
        </button>
        <h1 className="map-title">Interactive Weather Map</h1>
        <p className="map-instructions">Click anywhere on the map to get weather information!</p>

        {/* Lazy Loading for Google Maps */}
      
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={2}
              onClick={handleMapClick}
            >
              {location && (
                <Marker position={location}>
                  <InfoWindow position={location} onCloseClick={() => setLocation(null)}>
                    <div className="info-box">
                      📍 <b>Location:</b> {address} <br />
                      🌍 <b>Coordinates:</b> {location.lat.toFixed(2)}, {location.lng.toFixed(2)} <br />
                      {loading ? (
                        <p className="loading-text">⏳ Fetching weather...</p>
                      ) : weather ? (
                        <>
                          🌡️ <b>Temperature:</b> {weather.main.temp}°C <br />
                          ☁ <b>Weather:</b> {weather.weather[0].description}
                        </>
                      ) : (
                        "Click a location to get weather details."
                      )}
                    </div>
                  </InfoWindow>
                </Marker>
              )}
            </GoogleMap>
          </LoadScript>
        </Suspense>
      </div>
    </div>
  );
}

export default WeatherMap;
