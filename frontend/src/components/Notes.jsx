import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Notes.css";
import { useNavigate } from "react-router-dom";
import { GrAdd } from "react-icons/gr";
import Menu from "./Menu"; // Import Menu component
import { FiList, FiGrid } from "react-icons/fi";
import { navigate } from "react-router-dom"; // Import useNavigate

// const API_URL = "http://localhost:5000/notes"; // Backend API URL

const API_URL = "to-do-list-production-a8c8.up.railway.app/notes";


const Notes = ( {handleLogout} ) => {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [showTextarea, setShowTextarea] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate(); // Initialize navigate
  const [searchTerm, setSearchTerm] = useState("");

  const colors = ["#b1d8fa", "#7bc2ff", "#6db9fc", "#4b90d5", "#85a1ff", "#53a3ef"];


  useEffect(() => {
    
    fetchNotes();
  }, []);

 
  
  const fetchNotes = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      if (Array.isArray(response.data)) {
        setNotes(response.data); // Directly set notes without localStorage
      } else {
        console.error("Unexpected response format", response.data);
        setNotes([]);
      }
    } catch (error) {
      console.error("🔥 Error fetching notes:", error.response?.data || error.message);
      setNotes([]);
    }
  };
  
  

  const addNote = async () => {
    if (noteText.trim() === "") return;

    try {
      const response = await axios.post(
        API_URL,
        { text: noteText },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const updatedNotes = [...notes, response.data];
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));

      setNoteText("");
      setShowTextarea(false);
    } catch (error) {
      console.error("🔥 Error adding note:", error.response?.data || error.message);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Remove the note from state without modifying other IDs
      const updatedNotes = notes.filter((note) => note._id !== id);
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));

    } catch (error) {
      console.error("🔥 Error deleting note:", error.response?.data || error.message);

      if (error.response?.status === 404) {
        console.warn("⚠️ The note was not found on the server. Removing it from local state.");
        const updatedNotes = notes.filter((note) => note._id !== id);
        setNotes(updatedNotes);
        localStorage.setItem("notes", JSON.stringify(updatedNotes));
      }
    }
  };

  const openPopup = (note) => {
    setCurrentNote(note);
    setNoteText(note.text);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setCurrentNote(null);
    setNoteText("");
  };

  const updateNote = async () => {
    if (!currentNote) return;

    try {
      await axios.put(`${API_URL}/${currentNote.id}`, { text: noteText }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const updatedNotes = notes.map((note) =>
        note._id === currentNote._id ? { ...note, text: noteText } : note
      );

      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      closePopup();
    } catch (error) {
      console.error("🔥 Error updating note:", error.response?.data || error.message);
    }
  };
  const handleLogoutAndRedirect = () => {
    handleLogout(); // Call the original logout logi
      navigate("/"); // Redirect after 1.5 seconds
   
  };

  return (
    <div className="notes-outer-container">
    <div className="notes-container">
      <div className="notes-header">
        <h2>My Notes</h2>
        <input
  type="text"
  placeholder="Search notes...   "
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="notes-search"
/>

        <button className="view-toggle" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
          {viewMode === "grid" ? <FiList size={24} /> : <FiGrid size={24} />}
        </button>
      </div>

      <Menu handleLogout={handleLogoutAndRedirect} />
      <div className="notespace">
      <div className={viewMode === "grid" ? "notes-grid" : "notes-list"}>
        {/* Display Existing Notes */}
        {Array.isArray(notes) && notes.length > 0 ? (
  notes
    .filter(note => note.text.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((note, index) => {
      const lines = note.text.split("\n");
      const firstLine = lines[0] || "";
      const remainingText = lines.slice(1).join("\n");

      const highlight = (text) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, "gi");
        return text.split(regex).map((part, i) =>
          regex.test(part) ? <mark key={i}>{part}</mark> : part
        );
      };

      return (
        <div
          className="note-box"
          key={note.id}
          onClick={() => openPopup(note)}
          style={{ backgroundColor: colors[index % colors.length] }}
        >
          <p><strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{highlight(firstLine)}</strong></p>
          {remainingText.split("\n").map((line, i) => (
            <p className="note-text" key={i}>{highlight(line)}</p>
          ))}
        </div>
      );
    })
) : (
  ""
)}

        {/* Add Note Button - Styled Like a Note Box */}
        {!showTextarea && (
          <div className="note-box add-note-box" onClick={() => setShowTextarea(true)}>
            <GrAdd size={24} />
            <p>Add Note</p>
          </div>
        )}
      </div>

      {showTextarea && (
        <div className="note-input">
          <div className="notes-textarea">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={noteText ? "" : "Title\nWrite your note here..." }
            // style={{ whiteSpace: "pre-wrap" }} // Ensures line breaks in placeholder
          />
       
          <div className="note-buttons">
          <button className="notes-save-btn" onClick={addNote}>Save</button>
          <button className="notes-cancel-btn" onClick={() => setShowTextarea(false)}>Cancel</button>
        </div>
        </div>
        </div>
      )}
      </div>

      {/* Popup for editing */}
      {popupVisible && (
        <div className="notes-popup">
          <div className="popup-content">
            <div className="popup-textarea">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            </div>
            <div className="popup-actions">
            <div className="note-btn">
            <button className="notes-save-btn" onClick={updateNote}>Save</button>
            <button className="notes-delete-btn" onClick={() => { deleteNote(currentNote.id); closePopup(); }}>Delete</button>
</div>
</div>
          </div>
        </div>
      )} 
    </div>
    </div>
  );
};

export default Notes;

