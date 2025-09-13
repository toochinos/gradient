import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";

// Custom styled slider for blur controls
const CustomSlider = styled(Slider)(() => ({
  color: '#8b5cf6',
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
    backgroundColor: '#d1d5db',
  },
  '& .MuiSlider-rail': {
    backgroundColor: '#374151',
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#374151',
    border: '2px solid #d1d5db',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: '0 0 0 8px rgba(139, 92, 246, 0.16)',
    },
    '&.Mui-active': {
      boxShadow: '0 0 0 14px rgba(139, 92, 246, 0.16)',
    },
  },
}));

export default function MuiBlurSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 200, 
  disabled = false,
  label = "Blur",
  showValue = true 
}) {
  const handleChange = (event, newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}: {showValue ? `${value}px` : ''}
      </label>
      <CustomSlider
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        disabled={disabled}
        aria-label={label}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}px`}
      />
    </div>
  );
}
