import React from "react";

const Button = ({ text, onClick, disabled = false }) => {
  return (
    <button 
      className={`custom-button ${disabled ? "disabled" : ""}`} 
      onClick={!disabled ? onClick : undefined} 
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
