"use client";

// ========================================
// LOOK UP SINGLE PAGE APPLICATIONS (SPA) REACT NEXT.JS
// AND HOW TO MANAGE STATE AND SCROLLING
// ========================================

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function Home() {
  // Controls inverted color scheme (black bg + yellow text in about section)
  const [scrolled, setScrolled] = useState(false);
  
  // Virtual scroll position (0-1): 0 = portfolio, 0.4+ = about, 0.8+ = projects
  const [vpos, setVpos] = useState(0);
  
  // Current section: derived from vpos with hysteresis to prevent flickering
  const [pageState, setPageState] = useState<'portfolio'|'about'|'projects'>('portfolio');

  // Project data for the slider
  const projects = [
    { id: 'p1', img: '/images/persona-portfolio-thumbnail.png', left: 'Semester 3 portfolio - applying the persona 3 artstyle to a website.', right: 'Solo project' },
    { id: 'p2', img: '/images/bonds-thumbnail.png', left: 'A project to help young adults deal with loneliness.', right: 'Team project' },
    { id: 'p3', img: '/images/semester-2-portfolio-thumbnail.png', left: 'My first try at parallax websites', right: 'Solo project' },
  ];
  
  // Current project index in the slider
  const [currentProject, setCurrentProject] = useState(0);
  
  // Debounce lock to prevent slide skipping (300ms delay between transitions)
  const projectScrollLock = useRef(false);
  
  // Refs to avoid stale closures in event handlers
  const pageStateRef = useRef(pageState);
  const currentProjectRef = useRef(currentProject);

  // Keep refs in sync with state
  useEffect(() => { currentProjectRef.current = currentProject; }, [currentProject]);

  // Main effect: Handle wheel and touch events for virtual scrolling and project navigation
  useEffect(() => {
    // Sync pageStateRef with current pageState to avoid stale closure issues
    pageStateRef.current = pageState;
    let ticking = false;
    
    // Wheel handler: Navigate projects or update vpos
    function onWheel(e: WheelEvent) {
      // In projects state: navigate between slides
      if (pageStateRef.current === 'projects') {
        e.preventDefault(); // Prevent any native browser scrolling
        
        // Check debounce lock - if locked, ignore this event to prevent rapid slide skipping
        if (projectScrollLock.current) return;
        
        // Set lock and schedule unlock after 300ms (debounce duration)
        projectScrollLock.current = true;
        
        // dir: +1 for scroll down (next project), -1 for scroll up (previous project)
        const dir = Math.sign(e.deltaY);
        
        // cur: current project index from ref (always fresh, not stale)
        const cur = currentProjectRef.current;
        
        // Scroll up from first project returns to About
        if (dir < 0 && cur === 0) {
          setVpos(0.5);          // Jump to middle of vpos range (about section)
          setPageState('about'); // Explicitly set state to avoid threshold delays
          setScrolled(true);     // Enable inverted colors for about section
          setTimeout(() => { projectScrollLock.current = false; }, 300); // Release lock
          return; // Exit handler - don't update currentProject
        }
        
        // Navigate between projects
        setCurrentProject((i) => Math.min(projects.length - 1, Math.max(0, i + dir)));
        
        // Release debounce lock after 300ms to allow next slide transition
        setTimeout(() => { projectScrollLock.current = false; }, 300);
        return; // Exit handler - we handled this event in projects context
      }

      // Default: Update virtual scroll position
      e.preventDefault();
      const delta = Math.sign(e.deltaY) * 0.05;
      
      // Update vpos, clamped to [0, 1] range with 3 decimal precision
      // toFixed(3) prevents floating point accumulation errors
      setVpos((p) => Math.min(1, Math.max(0, +(p + delta).toFixed(3))));
    }
    
    // Touch handlers: Mirror wheel behavior for mobile
    let touchStartY: number | null = null;
    
    // onTouchStart: Capture the starting Y position of a touch gesture
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY; // Store initial Y coordinate for distance calculation
    
    }
    
    // onTouchMove: Process touch drag gestures (swipe up/down)
    // Logic mirrors onWheel handler for consistent behavior across input methods
    function onTouchMove(e: TouchEvent) {
      // Safety check: only process if we have a valid starting position
      if (touchStartY == null) return;
      
      // d: distance traveled (positive = swipe up, negative = swipe down)
      const d = touchStartY - e.touches[0].clientY;
      
      // dir: normalized direction (+1 for up/next, -1 for down/previous)
      const dir = Math.sign(d);
      
      // In projects state: navigate between slides
      if (pageStateRef.current === 'projects') {
        e.preventDefault(); // Prevent native scroll/pull-to-refresh
        
        // Check debounce lock - ignore rapid touches
        if (projectScrollLock.current) return;
        
        // Set lock to prevent slide skipping
        projectScrollLock.current = true;
        
        // cur: current project index from ref
        const cur = currentProjectRef.current;
        
        // Swipe down from first project returns to About
        if (dir < 0 && cur === 0) {
          setVpos(0.5);
          setPageState('about');
          setScrolled(true);
          setTimeout(() => { projectScrollLock.current = false; }, 300);
          return;
        }
        
        // Navigate between projects
        setCurrentProject((i) => Math.min(projects.length - 1, Math.max(0, i + dir)));
        setTimeout(() => { projectScrollLock.current = false; }, 300);
        return;
      }
      
      // Default: Update virtual scroll position
      e.preventDefault();
      const delta = dir * 0.05;
      setVpos((p) => Math.min(1, Math.max(0, +(p + delta).toFixed(3))));
    }
    
    // Attach event listeners (passive:false allows preventDefault)
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    
    setVpos(0);
    
    // Cleanup
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [pageState]);

  // Toggle inverted colors for about section
  useEffect(() => {
    if (scrolled) document.body.classList.add("inverted");
    else document.body.classList.remove("inverted");
  }, [scrolled]);

  // Derive pageState from vpos with hysteresis to prevent flickering
  useEffect(() => {
    setPageState((prev) => {
      if (prev === 'portfolio') {
        if (vpos > 0.4) return 'about'; // Enter about at 0.4
        return prev; // Stay in portfolio if vpos <= 0.4
      }
      
      // FROM 'about' state:
      if (prev === 'about') {
        if (vpos >= 0.8) return 'projects';
        if (vpos < 0.35) return 'portfolio';
        return prev;
      }
      
      if (prev === 'projects') {
        if (vpos < 0.75) return 'about';
        return prev;
      }
      
      return prev;
    });
  }, [vpos]);

  // Sync body classes and notify navigation of state changes
  useEffect(() => {
    setScrolled(pageState === 'about');
    
    if (pageState === 'projects') document.body.classList.add('projects');
    else document.body.classList.remove('projects');

    // Notify nav to keep highlighting in sync
    try { 
      window.dispatchEvent(new CustomEvent('setPageState', { detail: { state: pageState } })); 
    } catch (e) {}
  }, [pageState]);

  // Listen for nav click events from layout
  useEffect(() => {
    function onSet(e: CustomEvent) {
      const s = e?.detail?.state;
      
      if (s === 'about') {
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
        setVpos(1);
        setPageState('projects');
        setScrolled(false);
      }
      else if (s === 'resume') {
        setVpos(1);
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
        {/* Hide portfolio/about content when in projects state */}
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

            <img src="/images/tech-profile-pic-yellow-bg.png" alt="Nieck Buijs" className="nieck-image" />
          </>
        )}
        
        {/* Projects section with slider */}
        {pageState === 'projects' && (
          <div className="projects-section">
            {/* Decorative animated cuts */}
            <div className="border-cuts">
              <span className="cut top c1" />
              <span className="cut top c2" />
              <span className="cut top c3" />
              <span className="cut top c4" />

              <span className="cut right c1" />
              <span className="cut right c2" />
              <span className="cut right c3" />
              <span className="cut right c4" />

              <span className="cut bottom c1" />
              <span className="cut bottom c2" />
              <span className="cut bottom c3" />
              <span className="cut bottom c4" />

              <span className="cut left c1" />
              <span className="cut left c2" />
              <span className="cut left c3" />
              <span className="cut left c4" />
            </div>

            <div className="projects-list">
              <div className="projects-inner" style={{ transform: `translateY(-${currentProject * 100}%)` }}>
                {projects.map((p, idx) => (
                  <a key={p.id} href={`#${p.id}`} className={`project-button project-slide ${idx === currentProject ? 'active' : ''}`}>
                    <img src={p.img} alt={p.left} className="project-image"/>
                    <div className="textbox-project-button">
                      <h3 className="project-text-left">{p.left}</h3>
                      <h3 className="project-text-right">{p.right}</h3>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* when pageState === 'postAbout' nothing of the hero/lorem/image is rendered, producing a gap */}
      </section>
    </div>
  );
}
