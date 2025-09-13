import MuiBlurSlider from './MuiBlurSlider';

interface DirectionalFadeProps {
  fadeLeft: number;
  fadeRight: number;
  fadeTop: number;
  fadeBottom: number;
  onFadeLeftChange: (value: number) => void;
  onFadeRightChange: (value: number) => void;
  onFadeTopChange: (value: number) => void;
  onFadeBottomChange: (value: number) => void;
}

export default function DirectionalFadeSliders({
  fadeLeft,
  fadeRight,
  fadeTop,
  fadeBottom,
  onFadeLeftChange,
  onFadeRightChange,
  onFadeTopChange,
  onFadeBottomChange
}: DirectionalFadeProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Directional Fade Controls</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <MuiBlurSlider
          value={fadeLeft}
          onChange={onFadeLeftChange}
          min={0}
          max={1000}
          label="Fade from Left"
          showValue={true}
        />
        
        <MuiBlurSlider
          value={fadeRight}
          onChange={onFadeRightChange}
          min={0}
          max={1000}
          label="Fade from Right"
          showValue={true}
        />
        
        <MuiBlurSlider
          value={fadeTop}
          onChange={onFadeTopChange}
          min={0}
          max={1000}
          label="Fade from Top"
          showValue={true}
        />
        
        <MuiBlurSlider
          value={fadeBottom}
          onChange={onFadeBottomChange}
          min={0}
          max={1000}
          label="Fade from Bottom"
          showValue={true}
        />
      </div>
    </div>
  );
}