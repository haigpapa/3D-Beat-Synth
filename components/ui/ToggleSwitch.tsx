
import React from 'react';

interface ToggleSwitchProps {
  checked?: boolean;
  enabled?: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  label?: string;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  enabled,
  onChange,
  ariaLabel,
  label,
  description
}) => {
  const isChecked = checked !== undefined ? checked : enabled || false;
  const accessibleLabel = ariaLabel || label || 'Toggle switch';
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-gray-300">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-label={accessibleLabel}
        onClick={() => onChange(!isChecked)}
        className={`${
          isChecked ? 'bg-orange-500' : 'bg-gray-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
      >
        <span
          aria-hidden="true"
          className={`${
            isChecked ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
      {description && <span className="text-xs text-gray-400">{description}</span>}
    </div>
  );
};

export default ToggleSwitch;
