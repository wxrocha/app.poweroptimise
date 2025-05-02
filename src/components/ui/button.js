import React from "react";

export function Button({ children, onClick, type = "button", variant = "solid", ...props }) {
  const base = "px-5 py-2 rounded-lg font-medium transition duration-200";
  const styles = {
    solid: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-white text-white hover:bg-white hover:text-black",
  };

  return (
    <button
      onClick={onClick}
      type={type} 
      className={`${base} ${styles[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
