import { useState } from "react";
import Slider from "@mui/material/Slider";

export default function MuiSlider() {
  const [value, setValue] = useState(30);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div style={{ width: 300 }}>
      <Slider value={value} onChange={handleChange} aria-label="slider" />
      <p>Value: {value}</p>
    </div>
  );
}
