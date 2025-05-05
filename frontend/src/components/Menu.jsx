import { useEffect, useRef, useState } from "react";
import { FaBars, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IoMdClose } from "react-icons/io";
import "react-toastify/dist/ReactToastify.css";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  EmailIcon,
} from "react-share";

const Menu = ({ selectedFestival, showMonthCelebrations, setSelectedFestival, allFestivals }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSubButton, setShowSubButton] = useState(false);
  const [showShareButton, setShowShareButton] = useState(false);
  const [modalStatus, setModalStatus] = useState(false);
  const [todayFestival, setTodayFestival] = useState(null);

  const navigate = useNavigate(); // Use for navigation
  const [showMonthList, setShowMonthList] = useState(false);
  const monthListRef = useRef(null);
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const handleToggleMonthCelebrations = () => {
    if (typeof showMonthCelebrations === 'function') {
      showMonthCelebrations();
    } else {
      console.warn("showMonthCelebrations is not available on this page.");
    }
    setShowMonthList((prev) => !prev);
  };
  
  const getTodayFestival = (festivals) => {
    const formatDate = (date) => {
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    if (!festivals || festivals.length === 0) return null;

    const todayStr = formatDate(new Date());
    return festivals.find(festival => formatDate(festival.date.iso) === todayStr);
  };


  useEffect(() => {
    if (allFestivals && allFestivals.length > 0) {
      const today = getTodayFestival(allFestivals);
      setTodayFestival(today);
      setSelectedFestival(today);
    }
  }, [allFestivals]); // <- add dependency so it runs only when allFestivals is ready


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthListRef.current && !monthListRef.current.contains(event.target)) {
        setShowMonthList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shareUrl = window.location.href;
  const title = "Check this out!";

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleMenuOptionClick = () => {
    setMenuOpen(false);
  };

  const handleBackButton = () => {
    setMenuOpen(false);
  };

  const handleMainButtonClick = () => {
    setShowSubButton(!showSubButton);
  };

  const handleShareButtonClick = () => {
    setShowShareButton(!showShareButton);
  };

  const notifyTheme = (theme) => {
    toast.info(`You are in ${theme}`, {
      position: "top-center",
      autoClose: 2000,
      theme: "colored",
    });
  };

  return (
    <div className="menu-container">
      <button className="menu-button" onClick={toggleMenu}>
        <FaBars />
      </button>

      {menuOpen && (
        <div className={`menu-options ${menuOpen ? "open" : ""}`}>
          <button className="back-btn menu-options-btn" onClick={handleBackButton}>
            <FaArrowLeft />
          </button>

          {/* Navigate to Home (TaskList) */}
          <button className="menu-options-btn" onClick={() => { handleMenuOptionClick(); navigate("/tasklist"); }}>
          
          📋 Home
          </button>

          <button className="menu-options-btn" onClick={() => { setModalStatus(true); handleShareButtonClick(); }}>
          🔗 Share
          </button>

          {showShareButton && (
            <>
              <div onClick={() => setModalStatus(false)} className={`ModalOverlay ${modalStatus ? "modalshow" : ""}`}></div>
              <div onClick={() => setModalStatus(false)} className={`Modaldiv ${modalStatus ? "showModaldiv" : ""}`}>
                <div className="shareContainer">
                  <h5>Share</h5>
                  <button className="shareSubBtn"><IoMdClose /></button>
                </div>
                <hr class="horizontal-line" />

                <div className="shr-icon">
                  <FacebookShareButton url={shareUrl} quote={title}>
                    <FacebookIcon size={35} round />
                  </FacebookShareButton>
                  <TwitterShareButton url={shareUrl} title={title}>
                    <TwitterIcon size={35} round />
                  </TwitterShareButton>
                  <WhatsappShareButton url={shareUrl} title={title}>
                    <WhatsappIcon size={35} round />
                  </WhatsappShareButton>
                  <LinkedinShareButton url={shareUrl} title={title}>
                    <LinkedinIcon size={35} round />
                  </LinkedinShareButton>
                  <EmailShareButton url={shareUrl} subject={title} body="Check this link:">
                    <EmailIcon size={35} round />
                  </EmailShareButton>
                </div>
              </div>
            </>
          )}

          <Link to="/Theme">
            <button className="outer-button menu-options-btn" onClick={() => { notifyTheme(); handleMenuOptionClick(); }}>📅 Full Calender</button>
          </Link>

          <Link to="/notes">
            <button className="menu-options-btn" onClick={handleMenuOptionClick}>📝 Notes</button>
          </Link>

          {/* <button className="menu-options-btn" onClick={() => setShowSubButton(!showSubButton)}>
        Other
      </button> */}

          {/* <div className={`sub-menu ${showSubButton ? "show" : ""}`}> </div>*/}
          <Link to="/Weather">
            <button className="menu-options-btn">🌤️ Weather</button>
          </Link>
          {/* <Link to='/Calculator'>
        <button className="sub-button menu-options-btn">➤ Calculator</button>
        </Link> */}

          <Link to="/Weeklyplanner">
            <button className="menu-options-btn">🗓️ Weekly Planner</button>
          </Link>
          <button className="menu-options-btn" onClick={handleToggleMonthCelebrations}>
          
          🌟 Month's Festivals
          </button>

          <div className="festival-footer">
  {showMonthList && selectedFestival?.name === "MONTH_LIST" ? (
    <div className="month-festivals" ref={monthListRef}>
      <h4>🎊 This Month's Celebrations</h4>
      <ul>
        {selectedFestival?.festivals?.length > 0 ? (
          selectedFestival.festivals.map((festival, i) => (
            <li key={i} className="festival-item">
            <span className="festival-date">{formatDate(festival.date.iso)}</span>
            <span className="festival-name">— {festival.name}</span>
          </li>
          
          ))
        ) : (
          <p>No festivals this month!</p>
        )}
      </ul>
    </div>
  ) : (
    <div className="today-festival">
    {selectedFestival && selectedFestival.name !== "MONTH_LIST" ? (
      <>
        <h4>🎉 {selectedFestival.name}</h4>
        {selectedFestival.description ? (
          <p>{selectedFestival.description}</p>
        ) : (
          <p>No description available.</p>
        )}
      </>
    ) : todayFestival ? (
      <>
        <h4>🎉 {todayFestival.name}</h4>
        {todayFestival.description ? (
          <p>{todayFestival.description}</p>
        ) : (
          <p>No description available.</p>
        )}
      </>
    ) : (
      <h4>🎉 No celebration today</h4>
    )}
  </div>
  
  )}
</div>


        </div>
      )}
    </div>
  );
};

export default Menu;
