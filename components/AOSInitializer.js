"use client";
import { useEffect } from "react";

export default function AOSInitializer() {
  useEffect(() => {
    // Dynamically import AOS only when component mounts (client-side)
    // This reduces initial bundle size
    import("aos").then((AOS) => {
      AOS.init({
        duration: 1000,
        once: true, // Changed to true - animations only play once for better performance
        mirror: false, // Changed to false - no need to animate when scrolling back up
        easing: "ease-out-cubic",
        offset: 100,
        disable: false,
        // Add throttle to reduce performance impact
        throttleDelay: 99,
      });
      
      // Refresh on route changes if needed
      AOS.refresh();
    });

    // Import CSS dynamically as well
    import("aos/dist/aos.css");
  }, []);

  return null;
}