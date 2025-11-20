"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  // virtual scroll position from 0..1 driven by wheel/touch input
  const [vpos, setVpos] = useState(0);
  // page stages to allow a gap/hysteresis between about and the next section
  const [pageState, setPageState] = useState<'portfolio'|'about'|'projects'>('portfolio');

  useEffect(() => {
    let ticking = false;
    // Replace native scroll with virtual scroll driven by wheel/touch so layout stays fixed
    function onWheel(e: WheelEvent) {
      // prevent default page scroll
      e.preventDefault();
      const delta = Math.sign(e.deltaY) * 0.05; // step per wheel tick
      setVpos((p) => Math.min(1, Math.max(0, +(p + delta).toFixed(3))));
    }
    // touch support
    let touchStartY: number | null = null;
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
    } // store initial touch position
    function onTouchMove(e: TouchEvent) {
      if (touchStartY == null) return;
      e.preventDefault();
      const d = touchStartY - e.touches[0].clientY;
      const delta = Math.sign(d) * 0.05;
      setVpos((p) => Math.min(1, Math.max(0, +(p + delta).toFixed(3))));
    }
    // attach listeners for wheel and touch events
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

  // derive pageState from virtual position with hysteresis to create a small scroll gap
  useEffect(() => {
    setPageState((prev) => {
      if (prev === 'portfolio') {
        if (vpos > 0.4) return 'about';
        return prev;
      }
      if (prev === 'about') {
        if (vpos >= 0.8) return 'projects'; // require extra scroll to move on
        if (vpos < 0.35) return 'portfolio'; // small hysteresis to go back
        return prev;
      }
      if (prev === 'projects') {
        if (vpos < 0.75) return 'about'; // require backing up a bit to return
        return prev;
      }
      return prev;
    });
  }, [vpos]);

  // sync scrolled class (inverted state) specifically to the about stage
  useEffect(() => {
    setScrolled(pageState === 'about');
    // projects visual state
    if (pageState === 'projects') document.body.classList.add('projects');
    else document.body.classList.remove('projects');

    // notify layout/nav about the current pageState so nav selected classes stay in sync
    try { window.dispatchEvent(new CustomEvent('setPageState', { detail: { state: pageState } })); } catch (e) {}
  }, [pageState]);

  useEffect(() => {
    function onSet(e: CustomEvent) {
      const s = e?.detail?.state;
      if (s === 'about') {
        // jump to about
        setVpos(0.5);
        setPageState('about');
        setScrolled(true);
      }
      else if (s === 'portfolio') {
        setVpos(0);
        setPageState('portfolio');
        setScrolled(false);
      }
      else if (s === 'projects') {
        // jump to projects/post-about
        setVpos(0.95);
        setPageState('projects');
        setScrolled(false);
      }
    }
    window.addEventListener("setPageState", onSet as EventListener);
    return () => window.removeEventListener("setPageState", onSet as EventListener);
  }, []);

  return (
    <div>
      <section className="title-section">
  {/* hide everything when in projects to create a natural gap before the next section */}
  {pageState !== 'projects' && (
          <>
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

            {/* projects-section previously here is only rendered after about */}

            <img src="/images/tech-profile-pic-yellow-bg.png" alt="Nieck Buijs" className="nieck-image" />
          </>
        )}
        {/* render projects-section only once we've moved into the projects state */}
        {pageState === 'projects' && (
          <div className="projects-section">
            <h3>My Projects</h3>
            <ul>
              <li>
                <a href="#project1">Project 1</a>
              </li>
              <li>
                <a href="#project2">Project 2</a>
              </li>
              <li>
                <a href="#project3">Project 3</a>
              </li>
            </ul>
          </div>
        )}
        {/* when pageState === 'postAbout' nothing of the hero/lorem/image is rendered, producing a gap */}
      </section>
    </div>
  );
}
