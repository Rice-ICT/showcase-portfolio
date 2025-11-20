"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  // virtual scroll position from 0..1 driven by wheel/touch input
  const [vpos, setVpos] = useState(0);

  useEffect(() => {
    let ticking = false;
    // Replace native scroll with virtual scroll driven by wheel/touch so layout stays fixed
    function onWheel(e: WheelEvent) {
      // prevent default page scroll
      e.preventDefault();
      const delta = Math.sign(e.deltaY) * 0.05; // step per wheel tick
      setVpos((p) => Math.min(1, Math.max(0, +(p + delta).toFixed(3))));
    }

    let touchStartY: number | null = null;
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
    }
    function onTouchMove(e: TouchEvent) {
      if (touchStartY == null) return;
      e.preventDefault();
      const d = touchStartY - e.touches[0].clientY;
      const delta = Math.sign(d) * 0.05;
      setVpos((p) => Math.min(1, Math.max(0, +(p + delta).toFixed(3))));
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    // initial check
    setVpos(0);
    return () => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useEffect(() => {
    // toggle a class on the body so global styles can invert colours
    if (scrolled) document.body.classList.add("inverted");
    else document.body.classList.remove("inverted");
  }, [scrolled]);

  // derive scrolled from virtual position (threshold 0.4)
  useEffect(() => {
    setScrolled(vpos > 0.4);
  }, [vpos]);

  useEffect(() => {
    function onSet(e: CustomEvent) {
      const s = e?.detail?.state;
      if (s === 'about') setScrolled(true);
      else if (s === 'portfolio') setScrolled(false);
    }
    window.addEventListener("setPageState", onSet as EventListener);
    return () => window.removeEventListener("setPageState", onSet as EventListener);
  }, []);

  return (
    <div>
  <section className="title-section">
        <h2
          className={`hero glitch layers ${scrolled ? "hide" : ""}`}
          data-text="NIECK <BR> BUIJS"
        >
          <span>NIECK <br /> BUIJS</span>
        </h2>

        <div className={`lorem ${scrolled ? "visible" : ""}`} aria-hidden={!scrolled}>
          <p>
            Hoi, mijn naam is Nieck en ik ontwerp en bouw graag websites. Voor mij is het belangrijk om dingen niet alleen functioneel, maar ook visueel aantrekkelijk te maken.
            <br /><br />
            Naast coderen en designen, ben ik vaak bezig met gamen, cosplay en fotografie. Dat geeft me altijd nieuwe inspiratie!
            <br /><br />
            Neem een kijkje naar mijn projecten en stuur me gerust een berichtje als je het wat vond!
          </p>
        </div>

        <img src="/images/tech-profile-pic-yellow-bg.png" alt="Nieck Buijs" className="nieck-image" />
      </section>
    </div>
  );
}
