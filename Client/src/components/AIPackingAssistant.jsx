import React, { useState } from 'react';
import './AIPackingAssistant.css';

const sampleChecklists = {
  summer: ['Sunglasses', 'Sunscreen', 'Hat', 'Water Bottle', 'Shorts', 'Light T-Shirts'],
  winter: ['Jacket', 'Thermal Wear', 'Woolen Socks', 'Gloves', 'Beanie', 'Moisturizer'],
  rainy: ['Raincoat', 'Umbrella', 'Waterproof Bag', 'Flip-flops', 'Dry Bag']
};

const getSeasonFromMonth = (month) => {
  const lower = month.toLowerCase();
  if (['december', 'january', 'february'].includes(lower)) return 'winter';
  if (['june', 'july', 'august'].includes(lower)) return 'rainy';
  return 'summer';
};

const AIPackingAssistant = () => {
  const [destination, setDestination] = useState('');
  const [month, setMonth] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  
  const generateChecklist = () => {
    if (!destination || !month) return;
    const season = getSeasonFromMonth(month);
    const items = sampleChecklists[season] || [];
    setChecklist(items);
    setCheckedItems([]);
  };
  
  const toggleItem = (item) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };
  
  return (
    <div className="ai-assistant-box">
      <h2>🧠 AI Packing Assistant</h2>
      <p>Just tell us where and when you're going — we'll handle the checklist!</p>
      
      <div className="form-group">
        <input
          type="text"
          placeholder="Destination (e.g., Goa)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <input
          type="text"
          placeholder="Month of travel (e.g., January)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <button onClick={generateChecklist}>Generate Checklist</button>
      </div>
      
      {checklist.length > 0 && (
        <div className="checklist">
          <h3>Checklist for {destination} in {month}</h3>
          <ul>
            {checklist.map((item, index) => (
              <li key={index}>
                <label>
                  <input
                    type="checkbox"
                    checked={checkedItems.includes(item)}
                    onChange={() => toggleItem(item)}
                  />
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIPackingAssistant;