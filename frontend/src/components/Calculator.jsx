import React, { useEffect, useState, useRef } from 'react';
import './Calculator.css';
import Menu from "./Menu";
import axios from 'axios';
import { BsCalculator } from "react-icons/bs";

const MAX_DISPLAY_LENGTH = 20; // Limit display length
const SCIENTIFIC_NOTATION_THRESHOLD = 15; // Limit before switching to scientific notation

const Calculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const historyRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory(); // Load history from backend on mount
}, []);

const fetchHistory = async () => {
    try {
        const response = await axios.get('http://localhost:5000/calculator');
        setHistory(response.data);
    } catch (error) {
        console.error('Error fetching history:', error);
    }
};

const saveHistory = async (expression, result) => {
    try {
        await axios.post('http://localhost:5000/calculator', { expression, result });
        fetchHistory(); // Refresh history
    } catch (error) {
        console.error('Error saving history:', error);
    }
};

const clearHistory = async () => {
    try {
        await axios.delete('http://localhost:5000/calculator');
        setHistory([]);
    } catch (error) {
        console.error('Error clearing history:', error);
    }
};


  const handleClear = () => {
    setInput('');
    setResult('');

  };

  const handlePercentage = () => {
    try {
      if (input) {
        setInput((parseFloat(input) / 100).toString());
      }
    } catch {
      setInput('Error');
    }
  };

  const handleNegate = () => {
    if (input && !isNaN(input)) {
      setInput((parseFloat(input) * -1).toString());
    }
  };

  const formatResult = (value) => {
    if (value.length > MAX_DISPLAY_LENGTH) {
      return value.slice(0, SCIENTIFIC_NOTATION_THRESHOLD) +
        'e' + (value.length - SCIENTIFIC_NOTATION_THRESHOLD);
    }
    return value;
  };

  const handleCalculate = () => {
    try {
      if (input.trim() === "" || /[+\-*/]$/.test(input[input.length - 1])) {
        setResult("Error");
      } else {
        const evalResult = eval(input).toString();
        setResult(formatResult(evalResult));
        saveHistory(input, evalResult);
      }
    } catch {
      setResult("Error");
    }
  };

  const handleClick = (value) => {
    if (value === 'hist') {
      setShowHistory(!showHistory);
      return;
    }
    setInput((prev) => /[+\-*/]$/.test(prev) && /[+\-*/]/.test(value) ? prev : prev + value);
  };

  const handleKeyPress = (event) => {
    const { key } = event;

    if ((key >= "0" && key <= "9") || key === ".") {
      setInput((prev) => prev + key);
    } else if (["+", "-", "*", "/"].includes(key)) {
      setInput((prev) => {
        if (prev === "" || /[+\-*/]$/.test(prev[prev.length - 1])) {
          return prev;
        }
        return prev + key;
      });
    } else if (key === "Enter") {
      event.preventDefault();
      handleCalculate();
    } else if (key === "Backspace") {
      setInput((prev) => prev.slice(0, -1));
    }
  };
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollLeft = historyRef.current.scrollWidth;
    }
  }, [input]); // Scrolls whenever input updates

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter") handleCalculate();
      else if (event.key === "Backspace") setInput((prev) => prev.slice(0, -1));
    });
  }, []);

  return (
    <div className="calculator">
      <Menu />

      <div className='calculator-box'>
  {showHistory ? (
    <div className="history-screen">
      <h3>History</h3>
      {history.length > 0 ? (
        history.map((entry, index) => (
          <div key={index} className="history-entry">
            <span>{entry.expression}</span> = <strong>{entry.result}</strong>
          </div>
        ))
      ) : (
        <p>No history available</p>
      )}
      <button onClick={clearHistory} className="clear-history">Clear History</button>
      <button onClick={() => setShowHistory(false)} className="close-history">Back</button>
    </div>
  ) : (
    <>
      <div className="calculator-display">
        <div className="calculator-history" ref={historyRef}>
          {input}
        </div>
        <div className="calculator-result">
          {result || " -- "}
        </div>
      </div>

      <div className="calculator-buttons">
        <button className='calculator-btn' onClick={handleClear}>C</button>
        <button className='calculator-btn' onClick={handleNegate}>+/-</button>
        <button className='calculator-btn' onClick={handlePercentage}>%</button>
        <button className='calculator-btn' onClick={() => handleClick('/')}>÷</button>

        <button className='calculator-btn' onClick={() => handleClick('7')}>7</button>
        <button className='calculator-btn' onClick={() => handleClick('8')}>8</button>
        <button className='calculator-btn' onClick={() => handleClick('9')}>9</button>
        <button className='calculator-btn' onClick={() => handleClick('*')}>×</button>

        <button className='calculator-btn' onClick={() => handleClick('4')}>4</button>
        <button className='calculator-btn' onClick={() => handleClick('5')}>5</button>
        <button className='calculator-btn' onClick={() => handleClick('6')}>6</button>
        <button className='calculator-btn' onClick={() => handleClick('-')}>-</button>

        <button className='calculator-btn' onClick={() => handleClick('1')}>1</button>
        <button className='calculator-btn' onClick={() => handleClick('2')}>2</button>
        <button className='calculator-btn' onClick={() => handleClick('3')}>3</button>
        <button className='calculator-btn' onClick={() => handleClick('+')}>+</button>

        <button className='calculator-btn' onClick={() => handleClick('hist')}><BsCalculator /></button>
        <button className='calculator-btn' onClick={() => handleClick('0')}>0</button>
        <button className='calculator-btn' onClick={() => handleClick('.')}>.</button>
        <button className='calculator-btn' onClick={handleCalculate}>=</button>
      </div>
    </>
  )}
</div>

    </div>
  );
};

export default Calculator;
