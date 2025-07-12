import React from "react";
import Logo from "@assets/logos/Logo.svg";
const Loader: React.FC = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div className="h-32 w-32 animate-spin rounded-full">
      <img src={Logo} alt="PitchBook" />
    </div>
  </div>
);

export default Loader;
