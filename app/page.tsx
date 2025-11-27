"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function Home() {
  // Current section being displayed
  const [pageState, setPageState] = useState<'portfolio'|'about'|'projects'|'resume'>('portfolio');
  
  // Controls inverted color scheme (black bg + yellow text in about section)
  const [scrolled, setScrolled] = useState(false);

  // Project data for the slider
  const projects = [
    { id: 'p1', img: '/images/persona-portfolio-thumbnail.png', left: 'Semester 3 portfolio - applying the persona 3 artstyle to a website.', right: 'Solo project' },
    { id: 'p2', img: '/images/bonds-thumbnail.png', left: 'A project to help young adults deal with loneliness.', right: 'Team project' },
    { id: 'p3', img: '/images/semester-2-portfolio-thumbnail.png', left: 'My first try at parallax websites', right: 'Solo project' },
  ];
  
  // Current project index in the slider
  const [currentProject, setCurrentProject] = useState(0);
  
  // Debounce locks to prevent rapid scrolling
  const pageScrollLock = useRef(false);
  const projectScrollLock = useRef(false);
  
  // Refs to avoid stale closures in event handlers
  const pageStateRef = useRef(pageState);
  const currentProjectRef = useRef(currentProject);

  // Keep refs in sync with state
  useEffect(() => { 
    pageStateRef.current = pageState;
  }, [pageState]);
  
  useEffect(() => { 
    currentProjectRef.current = currentProject; 
  }, [currentProject]);

  // Main effect: Handle wheel and touch events for page state transitions
  useEffect(() => {
    // Wheel handler: Switch page states or navigate projects
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      
      const dir = Math.sign(e.deltaY); // +1 for down, -1 for up
      const currentState = pageStateRef.current;
      
      // In projects state: navigate between slides
      if (currentState === 'projects') {
        if (projectScrollLock.current) return;
        
        projectScrollLock.current = true;
        const cur = currentProjectRef.current;
        
        // Scroll up from first project returns to About
        if (dir < 0 && cur === 0) {
          // Use page scroll lock to prevent rapid transition through about to portfolio
          pageScrollLock.current = true;
          setTimeout(() => { pageScrollLock.current = false; }, 800);
          
          setPageState('about');
          setScrolled(true);
          setTimeout(() => { projectScrollLock.current = false; }, 500);
          return;
        }
        
        // Scroll down from last project goes to Resume
        if (dir > 0 && cur === projects.length - 1) {
          // Use page scroll lock to prevent rapid transitions
          pageScrollLock.current = true;
          setTimeout(() => { pageScrollLock.current = false; }, 800);
          
          setPageState('resume');
          setScrolled(false);
          setTimeout(() => { projectScrollLock.current = false; }, 500);
          return;
        }
        
        // Navigate between projects
        setCurrentProject((i) => Math.min(projects.length - 1, Math.max(0, i + dir)));
        setTimeout(() => { projectScrollLock.current = false; }, 500);
        return;
      }

      // Check page transition lock
      if (pageScrollLock.current) return;
      
      // Lock scrolling for 800ms to prevent rapid transitions
      pageScrollLock.current = true;
      setTimeout(() => { pageScrollLock.current = false; }, 800);
      
      // Scroll down: advance to next state
      if (dir > 0) {
        if (currentState === 'portfolio') {
          setPageState('about');
          setScrolled(true);
        } else if (currentState === 'about') {
          setPageState('projects');
          setScrolled(false);
        }
      }
      // Scroll up: go back to previous state
      else if (dir < 0) {
        if (currentState === 'resume') {
          setPageState('projects');
          setScrolled(false);
        } else if (currentState === 'about') {
          setPageState('portfolio');
          setScrolled(false);
        }
      }
    }
    
    // Touch handlers: Mirror wheel behavior for mobile
    let touchStartY: number | null = null;
    
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
    }
    
    function onTouchMove(e: TouchEvent) {
      if (touchStartY == null) return;
      
      e.preventDefault();
      
      const d = touchStartY - e.touches[0].clientY;
      const dir = Math.sign(d);
      const currentState = pageStateRef.current;
      
      // In projects state: navigate between slides
      if (currentState === 'projects') {
        if (projectScrollLock.current) return;
        
        projectScrollLock.current = true;
        const cur = currentProjectRef.current;
        
        // Swipe down from first project returns to About
        if (dir < 0 && cur === 0) {
          // Use page scroll lock to prevent rapid transition through about to portfolio
          pageScrollLock.current = true;
          setTimeout(() => { pageScrollLock.current = false; }, 800);
          
          setPageState('about');
          setScrolled(true);
          setTimeout(() => { projectScrollLock.current = false; }, 500);
          return;
        }
        
        // Swipe up from last project goes to Resume
        if (dir > 0 && cur === projects.length - 1) {
          // Use page scroll lock to prevent rapid transitions
          pageScrollLock.current = true;
          setTimeout(() => { pageScrollLock.current = false; }, 800);
          
          setPageState('resume');
          setScrolled(false);
          setTimeout(() => { projectScrollLock.current = false; }, 500);
          return;
        }
        
        // Navigate between projects
        setCurrentProject((i) => Math.min(projects.length - 1, Math.max(0, i + dir)));
        setTimeout(() => { projectScrollLock.current = false; }, 500);
        return;
      }
      
      // Check page transition lock
      if (pageScrollLock.current) return;
      
      // Lock scrolling for 800ms
      pageScrollLock.current = true;
      setTimeout(() => { pageScrollLock.current = false; }, 800);
      
      // Swipe up: advance to next state
      if (dir > 0) {
        if (currentState === 'portfolio') {
          setPageState('about');
          setScrolled(true);
        } else if (currentState === 'about') {
          setPageState('projects');
          setScrolled(false);
        }
      }
      // Swipe down: go back to previous state
      else if (dir < 0) {
        if (currentState === 'resume') {
          setPageState('projects');
          setScrolled(false);
        } else if (currentState === 'about') {
          setPageState('portfolio');
          setScrolled(false);
        }
      }
    }
    
    // Attach event listeners (passive:false allows preventDefault)
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    
    // Cleanup
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Toggle inverted colors for about section
  useEffect(() => {
    if (scrolled) document.body.classList.add("inverted");
    else document.body.classList.remove("inverted");
  }, [scrolled]);

  // Sync body classes and notify navigation of state changes
  useEffect(() => {
    setScrolled(pageState === 'about');
    
    if (pageState === 'projects') document.body.classList.add('projects');
    else document.body.classList.remove('projects');
    
    if (pageState === 'resume') document.body.classList.add('resume');
    else document.body.classList.remove('resume');

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
        setPageState('about');
        setScrolled(true);
      }
      else if (s === 'portfolio') {
        setPageState('portfolio');
        setScrolled(false);
      }
      else if (s === 'projects') {
        setPageState('projects');
        setScrolled(false);
      }
      else if (s === 'resume') {
        setPageState('resume');
        setScrolled(false);
      }
    }
    
    window.addEventListener("setPageState", onSet as EventListener);
    return () => window.removeEventListener("setPageState", onSet as EventListener);
  }, []);

  return (
    <div>
      <section className="title-section">
        {/* Hide portfolio/about content when in projects or resume state */}
        {pageState !== 'projects' && pageState !== 'resume' && (
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
        
        {/* Resume section */}
        {pageState === 'resume' && (
          <div className="resume-section">
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

            <a href="/images/CV-Nieck-Buijs.pdf" target="_blank" rel="noopener noreferrer" className="resume-link">
              <span>Click for <br/>Resume</span>
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
