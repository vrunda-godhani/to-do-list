import React, { useEffect, useState } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Tasklist.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Calendar = ({ onDateChange, tasks, onFestivalSelect, setAllFestivals }) => {
  const [holidays, setHolidays] = useState([]);
  const [fullHolidays, setFullHolidays] = useState([]);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  useEffect(() => {
    const fetchHolidays = async () => {
      const apiKey = "1NdFHbM5nML0lm3fuLR9vPPBpxopoMOx";
      const cached = localStorage.getItem("cachedHolidays");
      const cachedDate = localStorage.getItem("cachedDate");
  
      const today = new Date().toISOString().split("T")[0];
  
      if (cached && cachedDate === today) {
        const all = JSON.parse(cached);
        setHolidays(all.map(h => formatDate(h.date.iso)));
        setFullHolidays(all);
        setAllFestivals(all);
        checkTodayCelebration(all);
        return;
      }
  
      try {
        const response = await axios.get(
          `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=IN&year=2025`
        );
  
        const all = response.data.response.holidays;
        localStorage.setItem("cachedHolidays", JSON.stringify(all));
        localStorage.setItem("cachedDate", today);
  
        setHolidays(all.map(h => formatDate(h.date.iso)));
        setFullHolidays(all);
        setAllFestivals(all);
        checkTodayCelebration(all);
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
        // Optional fallback message
        toast.error("Rate limit reached. Try again later.");
      }
    };
  
    const checkTodayCelebration = (all) => {
      const todayStr = formatDate(new Date());
      const todayFestival = all.find(h => formatDate(h.date.iso) === todayStr);
  
      onFestivalSelect(todayFestival || { name: "No celebration today 🎈" });
    };
  
    fetchHolidays();
  }, []);
  


    //   const checkTodayCelebration = (all) => {
    //     const todayStr = formatDate(new Date());
    //     const todayFestival = all.find(h => formatDate(h.date.iso) === todayStr);

    //     if (todayFestival) {
    //       onFestivalSelect(todayFestival);
    //     } else {
    //       onFestivalSelect({ name: "No celebration today 🎈" });
    //     }
    //   };

    //   fetchHolidays();
    // }, []);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateString = formatDate(date);

      const isHoliday = holidays.includes(dateString);

      const isTaskDay = tasks.some(task => {
        const taskDate = formatDate(task.task_date);
        return taskDate === dateString;
      });


      if (isHoliday && isTaskDay) return "calendar-highlight holiday-tile";
      if (isHoliday) return "holiday-tile";
      if (isTaskDay) return "calendar-highlight";
    }
    return null;
  };

  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    const festival = fullHolidays.find(h => formatDate(h.date.iso) === dateStr);

    onFestivalSelect(festival || { name: "No celebration on this day 🎉" });
    onDateChange(date);
  };

  return (
    <div>
      <ReactCalendar
        onChange={handleDateClick}
        tileClassName={tileClassName}
      />
   
    </div>
  );
};

export default Calendar;

export const getCurrentMonthFestivals = (fullHolidays) => {
  const currentMonth = new Date().getMonth(); // current month
  return fullHolidays.filter(festival => {
    const festivalDate = new Date(festival.date.iso);
    return festivalDate.getMonth() === currentMonth;
  });
};

