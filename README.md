# Nieck Buijs Portfolio

A modern, interactive personal portfolio website built with Next.js, showcasing projects, resume, and contact information with smooth scroll-driven navigation and animated visual effects.

## Features

### 🎨 Design & UI
- **Fixed viewport layout** with animated decorative border cuts
- **State-based navigation** system with 5 distinct pages (Portfolio, About, Projects, Resume, Contact)
- **Inverted color scheme** for About and Contact pages (black background, yellow text)
- **Smooth transitions** between pages with debounce delays to prevent rapid scrolling
- **Animated glitch effects** on text elements for visual interest
- **Responsive mobile design** that scales content appropriately for smaller screens

### 📱 Navigation
- **Scroll-driven navigation**: Use mouse wheel or touch to navigate between pages
- **Click navigation**: Left sidebar with clickable nav buttons
- **Mobile-friendly**: Touch gestures and responsive layout for all devices
- **Auto-highlighting**: Navigation buttons sync with current page state

### 📄 Page States

1. **Portfolio** - Landing page with hero text and introduction
2. **About** - Personal bio with inverted colors (yellow on black)
3. **Projects** - Interactive slider to browse portfolio projects with images
4. **Resume** - Clickable box linking to CV/PDF file
5. **Contact** - Contact information page with inverted colors

### ⌨️ Scroll Navigation Flow
```
Portfolio ↕ About ↕ Projects ↕ Resume ↕ Contact
```

- **Scroll Down**: Advance to next page
- **Scroll Up**: Return to previous page
- Within Projects: Scroll up/down to navigate between project slides
- From first project slide: Scroll up returns to About
- From last project slide: Scroll down advances to Resume

### ⚡ Technical Features

- **Debounce System**:
  - 800ms delay between major page transitions (prevents rapid state changes)
  - 500ms delay between project slides (prevents skipping)
  
- **Refs for State Management**:
  - `pageStateRef` - Current page state in event handlers
  - `currentProjectRef` - Current project index
  - `pageScrollLock` - Prevents rapid page transitions
  - `projectScrollLock` - Prevents rapid project navigation

- **Event Coordination**:
  - CustomEvent('setPageState') syncs navigation with page content
  - Layout nav clicks dispatch events to page component
  - Page state changes trigger nav highlighting

- **Mobile Optimizations**:
  - Profile image hidden on mobile
  - Text sizes scale with viewport (using vw units and clamp())
  - Project images and buttons remain visible and functional
  - Navigation text and spacing adjusted for small screens
  - Resume link includes pulsing animation on mobile (4.2s cycle with glitch effect)

## Project Structure

```
showcase-portfolio/
├── app/
│   ├── page.tsx          # Main page component with scroll logic
│   ├── layout.tsx        # Root layout with navigation
│   └── globals.css       # Global styles and animations
├── public/
│   └── images/           # Images and CV file
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **CSS3** - Animations, transitions, and responsive design
- **Inter Font** - Typography via Google Fonts

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
# Navigate to http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Key Code Sections

### Scroll Navigation Logic
The main scroll handler (`onWheel`) in `page.tsx`:
- Detects scroll direction (Math.sign of deltaY)
- Manages state transitions with debounce locks
- Handles project slider navigation
- Applies different delays for different transitions

### Event System
Two-way communication between layout navigation and page content:
- Layout dispatches `CustomEvent('setPageState')` on nav clicks
- Page listens for events and updates state
- Page dispatches same event to sync nav highlighting

### Responsive Design
Mobile breakpoints in `globals.css`:
- `@media (max-width: 768px)` - Tablets and larger phones
- `@media (max-width: 480px)` - Small phones
- Text scales with viewport using `clamp()`
- Project section maintains format while scaling dimensions
(still needs updating)

## Color Scheme

- **Default (Portfolio)**: Yellow background (#F7E211), Black text (#000)
- **About**: Black background (#000), Yellow text (#F7E211)
- **Contact**: Black background (#000), Yellow text (#F7E211)
- **Border cuts**: Yellow animated lines

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Fixed viewport layout (no document scroll)
- Debounce prevents jank from rapid scrolling
- CSS animations use GPU acceleration
- Touch events for better mobile performance
- Lazy loading of images on demand


### Updating code
No one person other than me will have any access to this project's code and be able to update it. Any updates will be made by me and me alone but feedback is always welcome!

### Modifying Navigation
Edit nav items in `app/layout.tsx` and corresponding event handlers in the inline script.

## Future Enhancements

- [ ] Language toggle NL/EN
- [ ] Project Documentation
- [ ] Use of some kind of cookies and stats
- [ ] Theme customization per project page

## Author

Nieck Buijs - Designer & Developer

## License

This project is personal portfolio work. All rights reserved.

---

**Last Updated**: December 2025
