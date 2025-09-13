import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

// Custom styled slider for angle controls
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

interface MuiAngleSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
}

export default function MuiAngleSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 360, 
  disabled = false,
  label = "Angle",
  showValue = true 
}: MuiAngleSliderProps) {
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (onChange && typeof newValue === 'number') {
      onChange(newValue);
    }
  };

  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Update input value when external value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = event.target.value;
    
    // Prevent typing more than 360
    const numValue = parseInt(newInputValue);
    if (!isNaN(numValue) && numValue > 360) {
      return; // Don't allow values over 360
    }
    
    setInputValue(newInputValue);
    
    // Allow empty string for backspace/delete
    if (newInputValue === '') {
      return; // Don't update the actual value yet, wait for blur
    }
    
    // Allow up to 3 digits, but cap at 360
    if (newInputValue.length <= 3) {
      if (!isNaN(numValue) && numValue >= min && numValue <= Math.min(max, 360)) {
        onChange(numValue);
      }
    }
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setInputValue(value.toString()); // Show full value when focused
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    let newValue = parseInt(inputValue);
    
    if (isNaN(newValue) || inputValue === '') {
      newValue = min;
    } else if (newValue < min) {
      newValue = min;
    } else if (newValue > Math.min(max, 360)) {
      newValue = Math.min(max, 360); // Cap at 360
    }
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  // Show full value when focused, remove first digit when not focused
  const displayValue = isFocused ? inputValue : (inputValue.length > 1 ? inputValue.substring(1) : inputValue);


  const handleIncrement = () => {
    const newValue = Math.min(Math.min(max, 360), value + 1);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center">
            <input
              type="number"
              value={displayValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              min={min}
              max={Math.min(max, 360)}
              disabled={disabled}
              className="w-20 px-2 py-1 pr-6 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="absolute right-1 flex flex-col">
              <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                tabIndex={-1}
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                tabIndex={-1}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
          <span className="text-sm text-gray-400">°</span>
        </div>
      </div>
      <CustomSlider
        value={value}
        onChange={handleSliderChange}
        min={min}
        max={max}
        disabled={disabled}
        aria-label={label}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}°`}
      />
    </div>
  );
}