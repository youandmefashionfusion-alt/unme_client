"use client";

import { useEffect } from "react";
import styles from "./snowfall.module.css";

const SNOWFLAKE_COUNT = 10;

export default function SnowEffect() {
  useEffect(() => {
    const container = document.getElementById("snow-container");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
      const snowflake = document.createElement("img");
      snowflake.src = "/heart.png";
      snowflake.className = styles.snowflake;

      const size = Math.random() * 20 + 10;
      snowflake.style.width = `${size}px`;
      snowflake.style.left = `${Math.random() * 100}vw`;
      snowflake.style.animationDuration = `${Math.random() * 2 + 8}s`;
      snowflake.style.animationDelay = `${Math.random() * 5}s`;

      container.appendChild(snowflake);
    }
  }, []);

  return <div id="snow-container" className={styles.container}></div>;
}
