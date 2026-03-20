'use client';

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import "./offerPopup.css";

export default function OfferPopup({type}) {
  const dispatch = useDispatch();
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    // Create party bomb particles
    const particles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setConfetti(particles);

    // auto stop animation
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  const [open, setOpen] = useState(true)
  const closePopup =()=>{
    setOpen(false)
  }

  return (
    <div className="offer-overlay" style={{display: open? 'flex' : 'none'}}>
      {confetti.map((p) => (
        <span
          key={p.id}
          className="confetti"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="offer-popup">
        <h2>🎉 Woyahh!</h2>
        <p>
          You have unlocked items @ <strong>₹{type}</strong>
        </p>

        <button onClick={closePopup}>
          Awesome!
        </button>
      </div>
    </div>
  );
}
