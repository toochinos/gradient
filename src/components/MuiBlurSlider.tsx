import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import { useMemo, useCallback, useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from 'lucide-react';

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

interface MuiBlurSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
}

export default function MuiBlurSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 200, 
  disabled = false,
  label = "Blur",
  showValue = true 
}: MuiBlurSliderProps) {
  // Stabilize the clamped value using useMemo to prevent infinite loops
  const clampedValue = useMemo(() => {
    return Math.max(min, Math.min(max, Math.round(value)));
  }, [value, min, max]);

  const [inputValue, setInputValue] = useState(clampedValue.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Update input value when external value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(clampedValue.toString());
    }
  }, [clampedValue, isFocused]);

  const handleSliderChange = useCallback((event: Event, newValue: number | number[]) => {
    if (onChange && typeof newValue === 'number') {
      const newClampedValue = Math.max(min, Math.min(max, Math.round(newValue)));
      // Only call onChange if the value actually changed
      if (newClampedValue !== clampedValue) {
        onChange(newClampedValue);
      }
    }
  }, [onChange, min, max, clampedValue]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = event.target.value;
    setInputValue(newInputValue);
    
    // Allow empty string for backspace/delete
    if (newInputValue === '') {
      return; // Don't update the actual value yet, wait for blur
    }
    
    // Allow up to 3 digits
    if (newInputValue.length <= 3) {
      const newValue = parseInt(newInputValue);
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        const roundedValue = Math.round(newValue);
        if (roundedValue !== clampedValue) {
          onChange(roundedValue);
        }
      }
    }
  }, [onChange, min, max, clampedValue]);

  const handleInputFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setInputValue(clampedValue.toString()); // Show full value when focused
  }, [clampedValue]);

  const handleInputBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    let newValue = parseInt(inputValue);
    
    if (isNaN(newValue) || inputValue === '') {
      newValue = min;
    } else if (newValue < min) {
      newValue = min;
    } else if (newValue > max) {
      newValue = max;
    }
    const roundedValue = Math.round(newValue);
    if (roundedValue !== clampedValue) {
      onChange(roundedValue);
    }
    setInputValue(roundedValue.toString());
  }, [onChange, min, max, clampedValue, inputValue]);

  // Show full value when focused, remove first digit when not focused
  const displayValue = isFocused ? inputValue : (inputValue.length > 1 ? inputValue.substring(1) : inputValue);


  const handleIncrement = useCallback(() => {
    const newValue = Math.min(max, clampedValue + 1);
    onChange(newValue);
  }, [max, clampedValue, onChange]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(min, clampedValue - 1);
    onChange(newValue);
  }, [min, clampedValue, onChange]);

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
              max={max}
              disabled={disabled}
              className="w-20 px-2 py-1 pr-6 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="absolute right-1 flex flex-col">
              <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled || clampedValue >= max}
                className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                tabIndex={-1}
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled || clampedValue <= min}
                className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                tabIndex={-1}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
          <span className="text-sm text-gray-400">px</span>
        </div>
      </div>
      <CustomSlider
        value={clampedValue}
        onChange={handleSliderChange}
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
