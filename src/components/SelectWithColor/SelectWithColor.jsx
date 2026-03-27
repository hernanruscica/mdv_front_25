import { useState, useRef, useEffect } from 'react';
import styles from './SelectWithColor.module.css';

const ChevronIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const SelectWithColor = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper} ref={wrapperRef}>
        <div
          className={styles.selectedOption}
          style={{
            backgroundColor: selectedOption?.color + '20',
            borderColor: selectedOption?.color
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span 
            className={styles.selectedText}
            style={{ color: selectedOption?.color }}
          >
            {selectedOption?.label}
          </span>
          <span 
            className={styles.chevron}
            style={{ color: selectedOption?.color }}
          >
            <ChevronIcon />
          </span>
        </div>

        {isOpen && (
          <div className={styles.dropdown}>
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`${styles.option} ${value === opt.value ? styles.optionSelected : ''}`}
                style={{ borderLeftColor: opt.color }}
                onClick={() => handleSelect(opt.value)}
              >
                <span className={styles.optionDot} style={{ backgroundColor: opt.color }}></span>
                <span className={styles.optionLabel}>{opt.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectWithColor;
