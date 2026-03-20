import React from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import styles from "./Button.module.css";

const Button = ({ link, label, whiteBg = false }) => {
  const style = {
    backgroundColor: whiteBg ? "white" : "var(--primary-color)",
    color: whiteBg ? "var(--primary-color)" : "white",
  };

  return (
    <Link href={link} className={styles.ctaButton} style={style}>
      <span className={styles.buttonText}>{label}</span>
      <MoveRight className={styles.arrowIcon} />
    </Link>
  );
};

export default Button;
