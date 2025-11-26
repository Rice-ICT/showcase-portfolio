"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function Home() {
  // ========================================
  // STATE: Virtual Scroll System
  // ========================================
  
  // scrolled: Controls the inverted color scheme (true = black bg + yellow text)
  // This is synchronized with the 'about' pageState to create visual distinction
  const [scrolled, setScrolled] = useState(false);
  
  // vpos (virtual position): Represents logical scroll progress through the page
  // Range: 0 to 1, where:
  //   0.0 = portfolio section (hero with name and image)
  //   0.4+ = transition to about section (inverted colors with bio text)
  //   0.8+ = transition to projects section (project slider)
  // WHY: We use a virtual scroll system instead of native browser scrolling because
  // it gives us precise control over transitions, prevents unwanted scroll bounce,
  // and allows us to create custom scroll-driven animations and state changes
  const [vpos, setVpos] = useState(0);
  
  // pageState: The current major section being displayed
  // Derived from vpos with hysteresis thresholds (see useEffect below) to prevent
  // rapid flickering when user scrolls back and forth near boundaries
  // The hysteresis creates a "dead zone" that requires deliberate scrolling to change states
  const [pageState, setPageState] = useState<'portfolio'|'about'|'projects'>('portfolio');

  // ========================================
  // STATE: Project Slider
  // ========================================
  
  // projects: Static array of project metadata for the slider
  // Each project has an id, image path, left text (description), and right text (context)
  const projects = [
    { id: 'p1', img: '/images/persona-portfolio-thumbnail.png', left: 'Semester 3 portfolio - applying the persona 3 artstyle to a website.', right: 'Solo project' },
    { id: 'p2', img: '/images/bonds-thumbnail.png', left: 'A project to help young adults deal with loneliness.', right: 'Team project' },
    { id: 'p3', img: '/images/semester-2-portfolio-thumbnail.png', left: 'My first try at parallax websites', right: 'Solo project' },
  ];
  
  // currentProject: Index of the currently visible project in the slider (0 to projects.length-1)
  // Used to calculate the translateY transform for the vertical slider animation
  const [currentProject, setCurrentProject] = useState(0);
  
  // projectScrollLock: Debounce mechanism to prevent rapid wheel/touch events from skipping slides
  // WHY: Without this lock, a single wheel gesture could trigger multiple scroll events in quick
  // succession, causing the slider to skip several projects instead of advancing one at a time
  // The lock is set to true during a transition and released after 300ms (see event handlers below)
  const projectScrollLock = useRef(false);
  
  // ========================================
  // REFS: Avoiding Stale Closures in Event Handlers
  // ========================================
  
  // pageStateRef: Keeps the current pageState accessible inside event handlers
  // WHY: Event handlers (onWheel, onTouchMove) are attached once and capture variables
  // from their creation scope. Without this ref, they would always see the initial pageState
  // value ('portfolio'), even after state updates. Refs persist across renders and always
  // contain the latest value, solving the "stale closure" problem.
  const pageStateRef = useRef(pageState);
  
  // currentProjectRef: Keeps the current project index accessible inside event handlers
  // WHY: Similar to pageStateRef - we need the latest currentProject value inside wheel/touch
  // handlers to detect when we're at the first project (index 0) to enable scrolling back to
  // the About section. Without this ref, the handler would always see the initial value (0).
  const currentProjectRef = useRef(currentProject);

  // Sync currentProjectRef whenever currentProject state changes
  // This ensures event handlers always have access to the latest project index
  useEffect(() => { currentProjectRef.current = currentProject; }, [currentProject]);

  // ========================================
  // EFFECT: Main Event Handler Setup (Wheel + Touch)
  // ========================================
  useEffect(() => {
    // Sync pageStateRef with current pageState to avoid stale closure issues
    pageStateRef.current = pageState;
    
    // ticking: RequestAnimationFrame flag to throttle vpos updates
    // Prevents excessive state updates on rapid wheel events
    let ticking = false;
    
    // ========================================
    // WHEEL HANDLER: Virtual Scroll + Project Navigation
    // ========================================
    function onWheel(e: WheelEvent) {
      // SPECIAL CASE: When in 'projects' state, wheel input navigates between project slides
      // instead of updating vpos (virtual scroll position)
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
        
        // EDGE CASE: If at first project (index 0) and user scrolls up, exit projects
        // and return to the About section. This creates a natural navigation flow:
        // About → Projects (first) → Projects (second) → ... → Projects (last)
        // And allows: Projects (first) → (scroll up) → About
        if (dir < 0 && cur === 0) {
          setVpos(0.5);          // Jump to middle of vpos range (about section)
          setPageState('about'); // Explicitly set state to avoid threshold delays
          setScrolled(true);     // Enable inverted colors for about section
          setTimeout(() => { projectScrollLock.current = false; }, 300); // Release lock
          return; // Exit handler - don't update currentProject
        }
        
        // Normal case: Navigate to next/previous project within bounds [0, projects.length-1]
        // Math.min/max clamp the result so we can't go below 0 or above last index
        setCurrentProject((i) => Math.min(projects.length - 1, Math.max(0, i + dir)));
        
        // Release debounce lock after 300ms to allow next slide transition
        setTimeout(() => { projectScrollLock.current = false; }, 300);
        return; // Exit handler - we handled this event in projects context
      }

      // DEFAULT CASE: We're NOT in projects state, so use wheel to update vpos (virtual scroll)
      e.preventDefault(); // Always prevent native scroll to maintain fixed layout
      
      // delta: normalized scroll step (+0.05 or -0.05 per wheel tick)
      // WHY 0.05: Gives smooth, controlled scroll speed - not too fast, not too slow
      // A full scroll from portfolio → about requires ~8 wheel ticks (8 * 0.05 = 0.4)
      const delta = Math.sign(e.deltaY) * 0.05;
      
      // Update vpos, clamped to [0, 1] range with 3 decimal precision
      // toFixed(3) prevents floating point accumulation errors
      setVpos((p) => Math.min(1, Math.max(0, +(p + delta).toFixed(3))));
    }
    
    // ========================================
    // TOUCH HANDLERS: Mobile Support (mirrors wheel behavior)
    // ========================================
    
    // touchStartY: Tracks Y coordinate where touch gesture began
    // Used to calculate touch movement distance and direction
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
      
      // SPECIAL CASE: When in projects state, touch gestures navigate between slides
      if (pageStateRef.current === 'projects') {
        e.preventDefault(); // Prevent native scroll/pull-to-refresh
        
        // Check debounce lock - ignore rapid touches
        if (projectScrollLock.current) return;
        
        // Set lock to prevent slide skipping
        projectScrollLock.current = true;
        
        // cur: current project index from ref
        const cur = currentProjectRef.current;
        
        // EDGE CASE: If at first project and user swipes down (dir < 0), return to About
        // This provides the same back-navigation as wheel scrolling up
        if (dir < 0 && cur === 0) {
          setVpos(0.5);          // Jump to about section
          setPageState('about'); // Set state explicitly
          setScrolled(true);     // Enable inverted colors
          setTimeout(() => { projectScrollLock.current = false; }, 300); // Release lock
          return;
        }
        
        // Normal case: Navigate to next/previous project, clamped to valid index range
        setCurrentProject((i) => Math.min(projects.length - 1, Math.max(0, i + dir)));
        
        // Release debounce lock after 300ms
        setTimeout(() => { projectScrollLock.current = false; }, 300);
        return; // Exit - we handled this touch in projects context
      }
      
      // DEFAULT CASE: Not in projects, so update vpos based on touch swipe
      e.preventDefault(); // Prevent native scroll
      
      // delta: Same step size as wheel for consistent feel (+/-0.05)
      const delta = dir * 0.05;
      
      // Update vpos within [0, 1] bounds
      setVpos((p) => Math.min(1, Math.max(0, +(p + delta).toFixed(3))));
    }
    
    // ========================================
    // EVENT LISTENER REGISTRATION
    // ========================================
    
    // Register wheel and touch event listeners on window
    // WHY window: Ensures we capture events anywhere on the page, not just specific elements
    // { passive: false }: CRITICAL - allows us to call e.preventDefault() to block native scroll
    // Without passive:false, preventDefault() would be ignored and native scroll would occur
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    
    // Initialize vpos to 0 (portfolio section) on mount
    setVpos(0);
    
    // Cleanup function: Remove event listeners when component unmounts or pageState changes
    // This prevents memory leaks and ensures handlers are re-registered with fresh closures
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [pageState]); // Re-run when pageState changes to update pageStateRef in closure

  // ========================================
  // EFFECT: Sync Body Classes for Visual States
  // ========================================
  useEffect(() => {
    // Toggle body.inverted class based on scrolled state
    // This class applies black background and yellow text (see globals.css)
    // Used exclusively in the 'about' section for visual distinction
    if (scrolled) document.body.classList.add("inverted");
    else document.body.classList.remove("inverted");
  }, [scrolled]);

  // ========================================
  // EFFECT: Derive pageState from vpos (with Hysteresis)
  // ========================================
  // This is the core of the state machine that maps virtual scroll position to page sections
  // HYSTERESIS: Different thresholds for entering vs. exiting states prevents rapid flickering
  // when user scrolls back and forth near boundaries
  useEffect(() => {
    setPageState((prev) => {
      // FROM 'portfolio' state:
      if (prev === 'portfolio') {
        if (vpos > 0.4) return 'about'; // Enter about at 0.4
        return prev; // Stay in portfolio if vpos <= 0.4
      }
      
      // FROM 'about' state:
      if (prev === 'about') {
        if (vpos >= 0.8) return 'projects'; // Enter projects at 0.8 (requires more scroll)
        if (vpos < 0.35) return 'portfolio'; // Exit back to portfolio at 0.35 (hysteresis gap)
        return prev; // Stay in about if 0.35 <= vpos < 0.8
      }
      
      // FROM 'projects' state:
      if (prev === 'projects') {
        if (vpos < 0.75) return 'about'; // Exit back to about at 0.75 (not the same as entry threshold)
        return prev; // Stay in projects if vpos >= 0.75
      }
      
      // Fallback (should never reach here)
      return prev;
    });
  }, [vpos]); // Re-run whenever vpos changes

  // ========================================
  // EFFECT: Sync State Changes with Body Classes and Navigation
  // ========================================
  useEffect(() => {
    // Auto-sync scrolled state to match 'about' section (inverted colors only in about)
    setScrolled(pageState === 'about');
    
    // Toggle body.projects class for projects-specific styling (if needed in CSS)
    if (pageState === 'projects') document.body.classList.add('projects');
    else document.body.classList.remove('projects');

    // Notify layout navigation of current pageState via CustomEvent
    // This keeps nav item highlighting in sync when page state changes due to scrolling
    // (as opposed to nav clicks, which dispatch events the other direction)
    try { 
      window.dispatchEvent(new CustomEvent('setPageState', { detail: { state: pageState } })); 
    } catch (e) {
      // Catch for safety in case CustomEvent isn't supported (unlikely in modern browsers)
    }
  }, [pageState]); // Re-run whenever pageState changes

  // ========================================
  // EFFECT: Listen for Navigation Click Events from Layout
  // ========================================
  // This creates bidirectional communication between layout.tsx nav and this page component
  // Flow: User clicks nav item → layout dispatches CustomEvent → this listener receives it → jump to state
  useEffect(() => {
    // Event handler for CustomEvent('setPageState') dispatched by nav clicks in layout.tsx
    function onSet(e: CustomEvent) {
      const s = e?.detail?.state; // Extract requested state from event detail
      
      // Jump to 'about' section
      if (s === 'about') {
        setVpos(0.5);          // Set vpos to middle of about range (0.35-0.8)
        setPageState('about'); // Explicitly set state (skip threshold delay)
        setScrolled(true);     // Enable inverted colors immediately
      }
      // Jump to 'portfolio' section
      else if (s === 'portfolio') {
        setVpos(0);              // Reset to start
        setPageState('portfolio'); // Return to initial state
        setScrolled(false);      // Disable inverted colors
      }
      // Jump to 'projects' section
      else if (s === 'projects') {
        setVpos(1);              // Jump to end of vpos range (beyond 0.8 threshold)
        setPageState('projects'); // Enter projects state
        setScrolled(false);      // Disable inverted colors (projects uses default scheme)
      }
      // Handle 'resume' nav click (currently maps to projects since resume section was removed)
      else if (s === 'resume') {
        setVpos(1);              // Same as projects
        setPageState('projects'); // Map to projects for now
        setScrolled(false);      // Normal colors
      }
    }
    
    // Register event listener for CustomEvent from layout
    window.addEventListener("setPageState", onSet as EventListener);
    
    // Cleanup: Remove listener on unmount to prevent memory leaks
    return () => window.removeEventListener("setPageState", onSet as EventListener);
  }, []); // Empty dependency array - register once on mount, cleanup on unmount

  // ========================================
  // RENDER: Page Sections (Conditional Based on pageState)
  // ========================================
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
            {/* decorative moving cuts around the projects box (matches site-frame cuts) */}
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
