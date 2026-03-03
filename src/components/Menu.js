import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './Menu.css';
import '../app/globals.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';


const Menu = () => {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const menuContentRef = useRef(null);
  const hamburgerLinesRef = useRef([]);
  const closeLinesRef = useRef([]);
  const menuTextRef = useRef(null);

  // GSAP animations for hamburger to close icon transition
  const animateToClose = () => {
    const tl = gsap.timeline();
    tl.to(hamburgerLinesRef.current[0], {
      duration: 0.3,
      y: 4,
      rotation: 45,
      ease: "power2.out"
    })
    .to(hamburgerLinesRef.current[1], {
      duration: 0.3,
      opacity: 0,
      ease: "power2.out"
    }, "-=0.3")
    .to(hamburgerLinesRef.current[2], {
      duration: 0.3,
      y: -4,
      rotation: -45,
      ease: "power2.out"
    }, "-=0.3");
  };

  const animateToHamburger = () => {
    const tl = gsap.timeline();
    tl.to(hamburgerLinesRef.current[0], {
      duration: 0.3,
      y: 0,
      rotation: 0,
      ease: "power2.out"
    })
    .to(hamburgerLinesRef.current[1], {
      duration: 0.3,
      opacity: 1,
      ease: "power2.out"
    }, "-=0.3")
    .to(hamburgerLinesRef.current[2], {
      duration: 0.3,
      y: 0,
      rotation: 0,
      ease: "power2.out"
    }, "-=0.3");
  };

  // GSAP animation for menu text transition
  const animateTextChange = (newText) => {
    if (menuTextRef.current) {
      const tl = gsap.timeline();
      
      // Slide current text up
      tl.to(menuTextRef.current, {
        duration: 0.5,
        yPercent: -100,
        ease: "power4.out"
      })
      // Change text content
      .call(() => {
        menuTextRef.current.textContent = newText;
      })
      // Slide new text from bottom
      .fromTo(menuTextRef.current, 
        {
          yPercent: 100
        },
        {
          duration: 0.5,
          yPercent: 0,
          ease: "power4.out"
        }
      );
    }
  };


  // Handle menu toggle
  const handleMenuToggle = () => {
    if (!open) {
      setOpen(true);
      animateToClose();
      animateTextChange('Close');
    } else {
      setOpen(false);
      animateToHamburger();
      animateTextChange('Menu');
    }
  };

  // Initialize hamburger lines refs
  useEffect(() => {
    if (menuButtonRef.current) {
      const lines = menuButtonRef.current.querySelectorAll('.hamburgerIcon span');
      hamburgerLinesRef.current = Array.from(lines);
    }
  }, []);

  return (
    <>
    <div className="menuWrapper">
      <button
          ref={menuButtonRef}
        className="menuButton"
          onClick={handleMenuToggle}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <div className="menuTextWrapper">
          <span ref={menuTextRef} className="menuText">Menu</span>
        </div>
          <span className="iconCircle">
        <div className="iconWrapper">
              <div className="hamburgerIcon">
                <span ref={el => hamburgerLinesRef.current[0] = el}></span>
                <span ref={el => hamburgerLinesRef.current[1] = el}></span>
                <span ref={el => hamburgerLinesRef.current[2] = el}></span>
            </div>
            </div>
          </span>
        </button>
        </div>
      {open && (
        <div ref={menuContentRef} className="menuContentOverlay">
          <div className="menuContentInner">
            <nav className="menuNav">
          <ul>
                <li><Link href="#">Welcome</Link></li>
                <li><Link href="#">Introduction</Link></li>
            <li><Link href="#">Houses</Link></li>
                <li><Link href="#">Why Capsules<sup>®</sup></Link></li>
            <li><Link href="#">Activities</Link></li>
                <li><Link href="#">Feedback</Link></li>
          </ul>
            </nav>
            <div className="menuFooter">
              <div className="menuFooterLeft">
                <Link href="#" className="footerIcon">in</Link>
                <Link href="#" className="footerIcon">ig</Link>
                <Link href="#" className="footerIcon">be</Link>
              </div>
            </div>
            <div className="menuFooterDescription">
              This website is just the concept work done by—Moyra to showcase our capabilities.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Menu; 