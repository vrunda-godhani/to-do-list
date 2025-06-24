import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Weather.css";
import Menu from "./Menu";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Import heart icons
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { GrMapLocation } from "react-icons/gr";

// const API_URL = "https://to-do-list-production-7667.up.railway.app";

const API_URL = "http://localhost:5000";
const API_KEY = "17535e06f7d48c5b09c1a3f767906525";
const COUNTRIES_API = "https://restcountries.com/v3.1/all";
const CITIES_API = "https://countriesnow.space/api/v0.1/countries/cities";

export default function Weather() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState(null);
  const [city, setCity] = useState(null);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false); // Track if the city is a favorite
  const [showFavorites, setShowFavorites] = useState(false); // Track visibility



  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(COUNTRIES_API);
        setCountries(response.data.map(country => ({ label: country.name.common, value: country.name.common })).sort((a, b) => a.label.localeCompare(b.label)));
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
    fetchFavorites();
    fetchHistory();
  }, []);

  const handleCountryChange = async (selectedOption) => {
    setCountry(selectedOption);
    setCities([]);
    setCity(null);
    try {
      const response = await axios.post(CITIES_API, { country: selectedOption.value });
      setCities(response.data.data.map(city => ({ label: city, value: city })).sort((a, b) => a.label.localeCompare(b.label)));
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchWeather = async (event) => {
    event.preventDefault();
    if (!city) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.value}&units=metric&appid=${API_KEY}`
      );
      setWeather(response.data);
      await axios.post(`${API_URL}/weather/search`, { country: country.value, city: city.value }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      fetchHistory();
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather(null);
    }
    setLoading(false);
  };
    
  const addToFavorites = async () => {
    if (city && city.value && country && country.value && 
        !favorites.some(fav => fav.city === city.value && fav.country === country.value)) {
      try {
        await axios.post(`${API_URL}/weather/favorite`, { 
          city: city.value, 
          country: country.value
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        });
        fetchFavorites(); // Refresh favorites
        setIsFavorite(true); // Change button to heart icon
      } catch (error) {
        console.error("Error adding to favorites:", error);
      }
    }
  };
  
  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API_URL}/weather/favorites`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      setFavorites(response.data); // Now storing both city and country
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };
  const removeFromFavorites = async (city, country) => {
    try {
        await axios({
            method: "delete",
            url: `${API_URL}/weather/favorite`,
            headers: { 
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                "Content-Type": "application/json"
            },
            data: { city, country } // Ensure data is sent properly
        });

        // Update UI after successful deletion
        setFavorites(prev => prev.filter(fav => !(fav.city === city && fav.country === country)));
    } catch (error) {
        console.error("Error removing favorite:", error.response?.data || error.message);
    }
};

  


  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/weather/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handlelocationbtn = () => {
    navigate("/Gmap", {
      state: {
        city: city?.value || null,
        country: country?.value || null
      }
    });
      };
  

  return (
    <div className="weather-outer">
        
    <div className="weather-container">
      <Menu />
      <button className="Wback-button" onClick={handlelocationbtn}>
  <GrMapLocation /> 
</button> 

      <h1 className="title">Weather </h1>
      <p className="map-instructions">Check the weather in your location here!</p>

      <form onSubmit={fetchWeather} className="weather-form">

<Select
  options={countries}
  onChange={handleCountryChange}
  className="country-select"
  placeholder="🌍 Select Country"
  isSearchable={true}  // Enables search inside the dropdown
/>

<Select
  options={cities}
  onChange={setCity}
  className="city-select"
  placeholder="🏙 Select City"
  isSearchable={true}  // Enables search inside the dropdown
  isDisabled={!cities.length}
/>

<button type="submit" className="search-button" disabled={!city}>🔍 Search</button>

        <button 
    type="button" 
    className={`favorite-button ${isFavorite ? "favorited" : ""}`} 
    onClick={addToFavorites} 
    disabled={!city || !country}
  >
    {isFavorite ? <FaHeart className="heart-icon" /> : <FaRegHeart/>}
  </button>
      </form>
      {loading && <img src='https://media.tenor.com/IfbOs_yh89AAAAAM/loading-buffering.gif' width={100} alt="Loading" />}
      {weather ? (
        <div className="weather-card">
          <h2>{weather.name}, {weather.sys.country}</h2>
          <h3>{Math.round(weather.main.temp)}°C</h3>
          <p>{weather.weather[0].description.toUpperCase()}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <img src={`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`} alt="Weather Icon" className="weather-icon" />
        </div>
      ) : (
        <p className="no-data">No Data Found</p>
      )}
 <div className="favorites-container">
      <button className="favorites-button" onClick={() => setShowFavorites(!showFavorites)}>
        {showFavorites ? "Hide Favorites" : "Show Favorites"}
      </button>

      <ul className={`favorites-list ${showFavorites ? "show" : "hide"}`}>
  {favorites.length > 0 ? (
    favorites.map((fav, index) => (
      <div className="outter-line" key={fav.city + fav.country}>
        <li className="favorite-item">
          <p>
            <span style={{ color: "black" }}>Country:</span> {fav.country}
          </p>
          <p>
            <span style={{ color: "black" }}>City:</span> {fav.city}
          </p>
          <button
            className="weather-delete-button"
            onClick={() => removeFromFavorites(fav.city, fav.country)}
          >
            <IoMdRemoveCircleOutline />
          </button>
        </li>
      </div>
    ))
  ) : (
    <li className="no-favorites">No favorites added yet.</li>
  )}
</ul>



  {/* <h3>Search History</h3>
  <ul>
    {history.map((entry, index) => (
      <li key={index}>
        {entry.city} ({entry.country})
      </li>
    ))}
  </ul> */}
</div>

    </div>
    </div>
  );
}
