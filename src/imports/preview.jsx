import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Loading = () => {
  return (
    <div style={styles.container}>
      <DotLottieReact
        src="https://lottie.host/c0da20d6-fc01-4ab7-8cc9-d9d7ddeba5da/KphLTgnNxb.lottie"
        loop
        autoplay
        style={{ width: "250px", height: "250px" }}
      />
      <p style={styles.text}>Loading...</p>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  text: {
    marginTop: "10px",
    fontSize: "16px",
    color: "#555",
  },
};

export default Loading;