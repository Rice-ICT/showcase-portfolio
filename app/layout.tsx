import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';

// Load Inter font and expose as CSS variable
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // enable variable
});




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="site-frame">
          {/* Decorative animated cuts on site frame borders */}
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
          <nav className="left-nav" aria-label="Primary">
            <ul className="nav-list">
              <li className="nav-item selected" id="portfolio-nav">Portfolio</li>
              <li className="nav-item" id="about-nav">About</li>
              <li className="nav-item" id="projects-nav">Projects</li>
              <li className="nav-item" id="resume-nav">Resume</li>
              <li className="nav-item" id="contact-nav">Contact</li>
            </ul>
          </nav>
          {/* 
            Inline script for nav coordination:
            - Click handlers dispatch CustomEvent to page component
            - Listens for setPageState events to sync nav highlighting
          */}
          <script dangerouslySetInnerHTML={{__html: `
            (function(){
              var about = document.getElementById('about-nav');
              var portfolio = document.getElementById('portfolio-nav');
              var projects = document.getElementById('projects-nav');
              function clearSelected(){
                var els = document.querySelectorAll('.nav-item.selected');
                els.forEach(function(el){ el.classList.remove('selected'); });
              }
              if(about) about.addEventListener('click', function(e){ e.preventDefault(); window.dispatchEvent(new CustomEvent('setPageState', { detail: { state: 'about' } })); clearSelected(); about.classList.add('selected'); });
              if(portfolio) portfolio.addEventListener('click', function(e){ e.preventDefault(); window.dispatchEvent(new CustomEvent('setPageState', { detail: { state: 'portfolio' } })); clearSelected(); portfolio.classList.add('selected'); });
              if(projects) projects.addEventListener('click', function(e){ e.preventDefault(); window.dispatchEvent(new CustomEvent('setPageState', { detail: { state: 'projects' } })); clearSelected(); projects.classList.add('selected'); });
              // keep nav selection synced with external setPageState events
              window.addEventListener('setPageState', function(ev){ var s = ev?.detail?.state; clearSelected(); if(s === 'about' && about) about.classList.add('selected'); else if(s === 'portfolio' && portfolio) portfolio.classList.add('selected'); else if(s === 'projects' && projects) projects.classList.add('selected'); });
            })();
          `}} />

          <main className="content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
