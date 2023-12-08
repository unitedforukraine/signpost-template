import { Popover, Slider, Tooltip } from 'antd';
import React, { ReactNode, useState } from 'react';

export interface DistanceAwayStrings {
  informationTooltip: string;
}
interface DistanceAwayProps {
  onChange: (value: number) => void;
  children: ReactNode;
  strings: DistanceAwayStrings;
}

export default function DistanceAway({
  onChange,
  children,
  strings,
}: DistanceAwayProps) {
  const [sliderValue, setSliderValue] = useState<number>(0);

  //Handle the slider value change
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };

  const handleAfterChange = (value: number) => {
    onChange(value);
  };

  //Create the content to be displayed in the popover
  const content = (
    <div className="distance-away-content">
      <Slider
        min={0}
        max={100}
        step={1}
        value={sliderValue}
        onAfterChange={handleAfterChange}
        onChange={handleSliderChange}
      />
      <p> {`${sliderValue} km`}</p>
    </div>
  );

  //Render the component with popover and children (button)
  return (
    <div className="distance-away-container">
      <Popover placement="bottomLeft" content={content}>
        {children}
      </Popover>
      <Tooltip title={strings.informationTooltip}>
        <span className="distance-away-info-button">
          <i className="fa-solid fa-circle-info info-icon" />
        </span>
      </Tooltip>
    </div>
  );
}
