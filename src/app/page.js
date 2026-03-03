"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import styles from "@/components/Preloader.module.css";
import "./style.css";
import "./globals.css";
import Menu from "@/components/Menu";

// import 'remixicon/fonts/remixicon.css';

const Preloader = ({ onComplete }) => {
  const preloaderRef = useRef(null);
  const progressRef = useRef(null);
  const capsuleContainerRef = useRef(null);
  const capsuleTextRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(Date.now());
  const isLoadingComplete = useRef(false);

  useEffect(() => {
    const loadAssets = async () => {
      const images = Array.from(document.images);
      const videos = Array.from(document.getElementsByTagName("video"));
      const totalAssets = Math.max(images.length + videos.length + 1, 1);
      let loadedCount = 0;

      const updateProgress = () => {
        loadedCount++;
        const newProgress = Math.min((loadedCount / totalAssets) * 100, 100);
        setProgress(Math.round(newProgress));

        if (progressRef.current && !isLoadingComplete.current) {
          gsap.to(progressRef.current, {
            width: `${newProgress}%`,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
              if (newProgress >= 100 && !isLoadingComplete.current) {
                isLoadingComplete.current = true;
                finishLoading();
              }
            },
          });
        }
      };

      // Load images
      const imagePromises = images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              updateProgress();
              resolve();
            } else {
              img.onload = img.onerror = () => {
                updateProgress();
                resolve();
              };
            }
          })
      );

      // Load videos
      const videoPromises = videos.map(
        (video) =>
          new Promise((resolve) => {
            if (video.readyState >= 2) {
              updateProgress();
              resolve();
            } else {
              video.onloadeddata = video.onerror = () => {
                updateProgress();
                resolve();
              };
            }
          })
      );

      // Wait for fonts
      const fontPromise = document.fonts.ready.then(() => {
        updateProgress();
      });

      // Initial progress update
      updateProgress();

      await Promise.all([...imagePromises, ...videoPromises, fontPromise]);
    };

    const playCapsuleRevealAnimation = () => {
      if (capsuleContainerRef.current && capsuleTextRef.current) {
        const tl = gsap.timeline();

        // Scale up capsule and make it transparent
        tl.to([capsuleContainerRef.current, ".capsuleOuter"], {
          scale: 15,
          borderRadius: "100px",
          duration: 1.2,
          ease: "power3.inOut",
          backgroundColor: "transparent",
        });

        // Fade out the progress bar
        tl.add(
          gsap.to(".capsuleProgress", {
            opacity: 0,
            duration: 0.6,
            backgroundColor: "none",
            ease: "power2.inOut",
          })
        );
      }
    };

    const finishLoading = async () => {
      // Ensure minimum 2 seconds have passed
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
      if (elapsedTime < 2) {
        await new Promise((resolve) =>
          setTimeout(resolve, (2 - elapsedTime) * 1000)
        );
      }

      if (
        capsuleContainerRef.current &&
        capsuleTextRef.current &&
        preloaderRef.current
      ) {
        const tl = gsap.timeline({
          onComplete: () => {
            if (typeof onComplete === "function") {
              onComplete();
            }
          },
        });

        // First animation - fade out text
        tl.to(capsuleTextRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
        });

        // Call the capsule reveal animation
        playCapsuleRevealAnimation();
      }
    };

    let cleanup = false;

    const init = async () => {
      if (!cleanup) {
        await loadAssets();
      }
    };

    init();

    return () => {
      cleanup = true;
      isLoadingComplete.current = true;
      if (preloaderRef.current) {
        gsap.killTweensOf(preloaderRef.current);
      }
      if (progressRef.current) {
        gsap.killTweensOf(progressRef.current);
      }
    };
  }, [onComplete]);

  return (
    <div ref={preloaderRef} className={styles.preloader}>
      <div ref={capsuleContainerRef} className={styles.capsuleContainer}>
        <div className={styles.capsuleOuter}>
          <div ref={progressRef} className={styles.capsuleProgress} />
        </div>
      </div>
      <span ref={capsuleTextRef} className={styles.capsuleText}>
        Capsule
      </span>
    </div>
  );
};

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const aboutTextRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroFooterRef = useRef(null);
  const navLogoRef = useRef(null);
  const featuresTitleRef = useRef(null);
  const adventureTitleRef = useRef(null);

  useEffect(() => {
    // Reset scroll position on page load
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      smooth: true,
    });
    gsap.ticker.lagSmoothing(0);
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Marquee animation setup
    const setupMarquee = () => {
      const marqueeContent = document.querySelector(".marquee-content");
      const marqueeSpans = marqueeContent.querySelectorAll("span");

      // Set initial position for the second span
      gsap.set(marqueeSpans[1], {
        left: marqueeSpans[0].offsetWidth + 40, // Adding gap
      });

      // Create the marquee animation
      const marqueeAnim = gsap.to(marqueeSpans, {
        xPercent: -100,
        repeat: -1,
        duration: 20,
        ease: "none",
        paused: true,
      });

      // Create scroll-linked speed control
      ScrollTrigger.create({
        trigger: ".card-container",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          // Adjust speed based on scroll direction
          const scrollDirection = self.direction;
          const baseSpeed = 1;
          const speedFactor = scrollDirection === 1 ? 2 : -2;

          marqueeAnim.timeScale(baseSpeed + speedFactor);
        },
      });

      // Start the animation
      marqueeAnim.play();
    };

    // Initialize marquee
    setupMarquee();

    // Navbar animation
    const showAnim = gsap
      .from(".nav-container", {
        yPercent: -100,
        paused: true,
        duration: 0.4,
        ease: "power2.inOut",
      })
      .progress(1);

    // Logo visibility
    gsap.set(navLogoRef.current, { opacity: 0 }); // Set initial state

    ScrollTrigger.create({
      start: "top top",
      end: 99999,
      onUpdate: (self) => {
        const scrollDirection = self.direction;
        const isPassedHero = self.scroller.pageYOffset > window.innerHeight;

        // Show navbar on scroll up
        if (scrollDirection === -1) {
          showAnim.play();
        } else {
          showAnim.reverse();
        }

        // Control logo visibility
        if (isPassedHero) {
          gsap.to(navLogoRef.current, { opacity: 1, duration: 0.3 });
        } else {
          gsap.to(navLogoRef.current, { opacity: 0, duration: 0.3 });
        }
      },
    });

    // Create text split and reveal effect for about text
    if (aboutTextRef.current) {
      // Split text into lines
      const text = new SplitType(aboutTextRef.current, {
        types: "lines",
        lineClass: "split-line",
      });
      // Create container for each line with mask
      text.lines.forEach((line, i) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("line-mask-wrapper");

        const inner = document.createElement("div");
        inner.classList.add("line-mask-inner");

        // Create a clone of the line for the background layer
        const backgroundLine = line.cloneNode(true);
        backgroundLine.style.opacity = "0.2";
        backgroundLine.style.position = "absolute";
        backgroundLine.style.top = "0";
        backgroundLine.style.left = "0";

        // Move the line into our nested structure
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(backgroundLine);
        wrapper.appendChild(inner);
        inner.appendChild(line);

        // Create the reveal animation for this line
        gsap.fromTo(
          inner,
          {
            clipPath: "inset(0 0 100% 0)",
            opacity: 1,
          },
          {
            clipPath: "inset(0 0 0 0)",
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: wrapper,
              start: "top center",
              end: "bottom center",
              scrub: true,
              onUpdate: (self) => {
                const progress = self.progress;
                const clipAmount = (1 - progress) * 100;
                inner.style.clipPath = `inset(0 0 ${clipAmount}% 0)`;
              },
            },
          }
        );
      });
    }

    // Features title reveal animation
    if (featuresTitleRef.current) {
      const splitFeatures = new SplitType(featuresTitleRef.current, {
        types: "lines",
        lineClass: "feature-split-line",
      });

      // Create wrapper for each line
      splitFeatures.lines.forEach((line, i) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("feature-line-wrapper");

        const inner = document.createElement("div");
        inner.classList.add("feature-line-inner");

        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(inner);
        inner.appendChild(line);

        // Create reveal animation for each line
        gsap.fromTo(
          inner,
          {
            yPercent: -100,
          },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: wrapper,
              start: "top bottom",
              end: "top center",
              scrub: 1,
              onUpdate: (self) => {
                const progress = self.progress;
                const yMove = (1 - progress) * -100;
                inner.style.transform = `translateY(${yMove}%)`;
              },
            },
          }
        );
      });

      const cards = gsap.utils.toArray(".card-wrapper");
      const introCard = cards[0];

      const cardTitles = gsap.utils.toArray(".card-item-title");
      cardTitles.forEach((title, index) => {
        const splitTitle = new SplitType(title, {
          types: "chars",
          charClass: "card-char",
        });

        splitTitle.chars.forEach((char) => {
          char.innerHTML = `<span>${char.textContent}</span>`;
        });
      });

      const cardImageWrapper = document.querySelector(".card-item-image");
      const cardImage = cardImageWrapper.querySelector(" .card-item-image img");

      gsap.set(cardImageWrapper, {
        scale: 0.5,
        borderRadius: "400px",
      });

      gsap.set(cardImage, {
        scale: 1.5,
      });

      // Hide first card description initially
      const firstCardDescription = introCard.querySelector(
        ".card-item-description"
      );
      const firstCardTitleChars = introCard.querySelectorAll(".card-char span");
      gsap.set(firstCardDescription, {
        x: "40px",
        opacity: 0,
      });
      gsap.set(firstCardTitleChars, {
        x: "100%",
      });

      function animateCardContentIn(titleChar, descriptionChar) {
        gsap.to(titleChar, {
          x: "0%",
          duration: 0.75,
          ease: "power4.out",
        });
        gsap.to(descriptionChar, {
          x: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power4.out",
          delay: 0.1,
        });
      }
      function animateCardContentOut(titleChar, descriptionChar) {
        gsap.to(titleChar, {
          x: "100%",
          duration: 0.75,
          ease: "power4.out",
        });
        gsap.to(descriptionChar, {
          x: "40px",
          opacity: 0,
          duration: 0.75,
          ease: "power4.out",
          delay: 0.1,
        });
      }

      const marquee = introCard.querySelector(
        ".marquee-container .marquee-content"
      );
      const titleChars = introCard.querySelectorAll(".card-char span");
      const descriptionChars = introCard.querySelectorAll(
        ".card-item-description"
      );
      ScrollTrigger.create({
        trigger: introCard,
        start: "top top",
        end: "+=300vh",
        onUpdate: (self) => {
          const progress = self.progress;
          const imageScale = 0.5 + progress * 0.5;
          const imageBorderRadius = 400 - progress * 375;
          const innerImageScale = 1.5 - progress * 0.5;
          gsap.set(cardImageWrapper, {
            scale: imageScale,
            borderRadius: imageBorderRadius + "px",
          });
          gsap.set(cardImage, {
            scale: innerImageScale,
          });
          if (imageScale >= 0.5 && imageScale <= 0.75) {
            const fadeProgress = (imageScale - 0.5) / (0.75 - 0.5);
            gsap.set(marquee, { opacity: 1 - fadeProgress });
          } else if (imageScale < 0.5) {
            gsap.set(marquee, { opacity: 1 });
          } else if (imageScale > 0.75) {
            gsap.set(marquee, { opacity: 0 });
          }

          if (progress >= 1 && !introCard.contentRevealed) {
            introCard.contentRevealed = true;
            animateCardContentIn(titleChars, descriptionChars);
          }
          if (progress < 1 && introCard.contentRevealed) {
            introCard.contentRevealed = false;
            animateCardContentOut(titleChars, descriptionChars);
          }
        },
      });

      cards.forEach((card, index) => {
        const isLastCard = index === cards.length - 1;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          end: isLastCard ? " +=100vh" : "top top",
          endTrigger: isLastCard ? null : cards[cards.length - 1],
          pin: true,
          pinSpacing: true,
        });
      });

      cards.forEach((card, index) => {
        if (index < cards.length - 1) {
          const cardWrapper = card.querySelector(".card-item");
          ScrollTrigger.create({
            trigger: cards[index + 1],
            start: "top bottom",
            end: "top top",

            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(cardWrapper, {
                scale: 1 - progress * 0.25,
                opacity: 1 - progress,
              });
            },
          });
        }
      });
      cards.forEach((card, index) => {
        if (index > 0) {
          const cardImage = card.querySelector(".card-item-image img");
          const cardImageWrapper = card.querySelector(".card-item-image");
          ScrollTrigger.create({
            trigger: card,
            start: "top bottom",
            end: "top top",
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(cardImage, {
                scale: 2 - progress,
              });
              gsap.set(cardImageWrapper, {
                borderRadius: 150 - progress * 125 + "px",
              });
            },
          });
        }
      });

      cards.forEach((card, index) => {
        if (index === 0) {
          return;
        }
        const cardDescription = card.querySelector(".card-item-description");
        const cardTitleChars = card.querySelectorAll(".card-char span");

        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          end: "bottom top",
          onEnter: () => {
            animateCardContentIn(cardTitleChars, cardDescription);
          },
          onLeave: () => {
            animateCardContentOut(cardTitleChars, cardDescription);
          },
          onEnterBack: () => {
            animateCardContentIn(cardTitleChars, cardDescription);
          },
          onLeaveBack: () => {
            animateCardContentOut(cardTitleChars, cardDescription);
          },
        });
      });
    }

    // Adventure title reveal animation
    if (adventureTitleRef.current) {
      const splitAdventure = new SplitType(adventureTitleRef.current, {
        types: "lines",
        lineClass: "adventure-split-line",
      });

      // Create wrapper for each line
      splitAdventure.lines.forEach((line, i) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("adventure-line-wrapper");

        const inner = document.createElement("div");
        inner.classList.add("adventure-line-inner");

        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(inner);
        inner.appendChild(line);

        // Create reveal animation for each line
        gsap.fromTo(
          inner,
          {
            yPercent: -100,
          },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: wrapper,
              start: "top bottom",
              end: "top center",
              scrub: 1,
              onUpdate: (self) => {
                const progress = self.progress;
                const yMove = (1 - progress) * -100;
                inner.style.transform = `translateY(${yMove}%)`;
              },
            },
          }
        );
      });
    }

    // Location hover effect
    const locationTitle = document.querySelector(".location-title span");
    const locationHover = document.querySelector(".location-hover");
    if (locationTitle && locationHover) {
      let isHovering = false;
      let mouseX = 0;
      let mouseY = 0;
      let currentX = 0;
      let currentY = 0;
      let animationFrame = null;

      // Initially hide the hover element
      gsap.set(locationHover, {
        opacity: 0,
        scale: 0.5,
        position: "fixed",
        pointerEvents: "none",
        zIndex: 1000,
        xPercent: -50,
        yPercent: -50,
      });

      // Smooth follow animation
      const smoothFollow = () => {
        if (!isHovering) {
          cancelAnimationFrame(animationFrame);
          return;
        }

        // Spring physics parameters
        const springStrength = 0.15;
        const velocity = 0.5;

        // Calculate new position with spring physics
        currentX += (mouseX - currentX) * springStrength * velocity;
        currentY += (mouseY - currentY) * springStrength * velocity;

        // Update hover element position
        gsap.set(locationHover, {
          x: currentX,
          y: currentY,
        });

        // Continue animation loop
        animationFrame = requestAnimationFrame(smoothFollow);
      };

      // Show hover element
      const showHover = (x, y) => {
        if (isHovering) return;

        isHovering = true;
        mouseX = x;
        mouseY = y;
        currentX = x;
        currentY = y;

        // Kill any existing animations
        gsap.killTweensOf(locationHover);

        gsap
          .timeline()
          .set(locationHover, {
            x: x,
            y: y,
          })
          .to(locationHover, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            onStart: () => {
              locationHover.style.pointerEvents = "auto";
              smoothFollow(); // Start smooth following
            },
          });
      };

      // Hide hover element
      const hideHover = () => {
        if (!isHovering) return;

        isHovering = false;
        cancelAnimationFrame(animationFrame);

        // Kill any existing animations
        gsap.killTweensOf(locationHover);

        gsap.to(locationHover, {
          opacity: 0,
          scale: 0.95,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            locationHover.style.pointerEvents = "none";
          },
        });
      };

      // Check if point is in element bounds with padding
      const isInBounds = (x, y, element, padding = 10) => {
        const rect = element.getBoundingClientRect();
        return (
          x >= rect.left - padding &&
          x <= rect.right + padding &&
          y >= rect.top - padding &&
          y <= rect.bottom + padding
        );
      };

      // Handle mouse position update
      const handleMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isHovering) {
          showHover(e.clientX, e.clientY);
        }
      };

      // Handle mouse leave
      const handleMouseLeave = (e) => {
        // Add a small delay to check if we're moving to the hover element
        setTimeout(() => {
          if (
            !isInBounds(e.clientX, e.clientY, locationTitle) &&
            !isInBounds(e.clientX, e.clientY, locationHover)
          ) {
            hideHover();
          }
        }, 50);
      };

      // Clean up existing event listeners
      locationTitle.removeEventListener("mousemove", handleMouseMove);
      locationTitle.removeEventListener("mouseleave", handleMouseLeave);
      locationHover.removeEventListener("mouseenter", () => {});
      locationHover.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousemove", handleMouseMove);

      // Add event listeners
      locationTitle.addEventListener("mousemove", handleMouseMove);
      locationTitle.addEventListener("mouseleave", handleMouseLeave);

      locationHover.addEventListener("mouseenter", () => {
        isHovering = true;
      });

      locationHover.addEventListener("mouseleave", handleMouseLeave);

      // Global mouse move handler
      document.addEventListener("mousemove", (e) => {
        if (isHovering) {
          mouseX = e.clientX;
          mouseY = e.clientY;

          if (
            !isInBounds(e.clientX, e.clientY, locationTitle, 20) &&
            !isInBounds(e.clientX, e.clientY, locationHover, 20)
          ) {
            hideHover();
          }
        }
      });

      // Update cursor style
      locationTitle.style.cursor = "pointer";

      // Cleanup function
      return () => {
        cancelAnimationFrame(animationFrame);
        locationTitle.removeEventListener("mousemove", handleMouseMove);
        locationTitle.removeEventListener("mouseleave", handleMouseLeave);
        locationHover.removeEventListener("mouseenter", () => {});
        locationHover.removeEventListener("mouseleave", handleMouseLeave);
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Function to handle preloader completion
  const handlePreloaderComplete = () => {
    setIsLoading(false);

    // Split and animate hero title
    if (heroTitleRef.current) {
      // Split text into characters using SplitType
      const splitText = new SplitType(heroTitleRef.current, {
        types: "chars",
        charClass: "hero-char",
      });

      // Create wrapper for each character
      splitText.chars.forEach((char) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("char-wrapper");
        char.parentNode.insertBefore(wrapper, char);
        wrapper.appendChild(char);
      });

      // Create timeline for the animation
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
          duration: 1.2,
        },
      });

      // Set initial state
      gsap.set(".hero-char", {
        xPercent: 100, // Start from right
        opacity: 0,
      });

      // Animate each character to its original position
      tl.to(".hero-char", {
        xPercent: 0,
        opacity: 1,
        stagger: 0.03,
        delay: 0.2,
      });
    }

    // Split and animate hero footer text
    if (heroFooterRef.current) {
      // Split text into characters for each span
      const spans = heroFooterRef.current.querySelectorAll("span");

      spans.forEach((span, spanIndex) => {
        const splitText = new SplitType(span, {
          types: "chars",
          charClass: "footer-char",
        });

        // Create wrapper for each character
        splitText.chars.forEach((char) => {
          const wrapper = document.createElement("div");
          wrapper.classList.add("char-wrapper");
          char.parentNode.insertBefore(wrapper, char);
          wrapper.appendChild(char);
        });

        // Create timeline for each line
        const tl = gsap.timeline({
          defaults: {
            ease: "power3.out",
            duration: 1.2,
          },
        });

        // Set initial state
        gsap.set(splitText.chars, {
          xPercent: 100,
          opacity: 0,
        });

        // Animate each character to its original position with delay based on line number
        tl.to(splitText.chars, {
          xPercent: 0,
          opacity: 1,
          stagger: 0.03,
          delay: 0.4 + spanIndex * 0.1, // Slight delay between lines
        });
      });
    }
  };

  useEffect(() => {
    // Get all progress items
    const progressItems = document.querySelectorAll(
      ".adventure-progress-item-content"
    );

    // Add line classes
    progressItems.forEach((item, index) => {
      item.classList.add(`line-${index + 1}`);
    });

    // Create ScrollTrigger for each progress item
    progressItems.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: "top center+=100",
        end: "bottom center",
        toggleClass: "animate",
        once: true,
        markers: false, // Set to true for debugging
      });
    });
  }, []);

  useEffect(() => {
    const ridesSliderWrapper = document.querySelector(".rides-slider-wrapper");
    const ridesSliderItems = document.querySelectorAll(".rides-slider-item");
    const container = document.querySelector(".rides-slider-container");

    if (!ridesSliderWrapper || ridesSliderItems.length === 0 || !container)
      return;

    // Get the last item
    const lastItem = ridesSliderItems[ridesSliderItems.length - 1];
    // The distance from the left of the wrapper to the right edge of the last item
    const lastItemRight = lastItem.offsetLeft + lastItem.offsetWidth;
    // The visible width of the container
    const containerWidth = container.offsetWidth;
    // The max scroll is the distance needed to bring the last item's right edge to the container's right edge
    const maxScroll = lastItemRight - containerWidth;

    gsap.set(container, { overflow: "hidden" });

    // Set initial positions for parallax images
    ridesSliderItems.forEach((item) => {
      const image = item.querySelector(".rides-slider-image img");
      if (image) {
        gsap.set(image, {
          x: 0,
          force3D: true,
        });
      }
    });

    ScrollTrigger.create({
      trigger: ridesSliderWrapper,
      start: "left left",
      end: `+=${maxScroll}`,
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const viewportCenter = window.innerWidth / 2;

        // Update horizontal scroll position
        gsap.to(ridesSliderWrapper, {
          x: -progress * maxScroll,
          ease: "none",
        });

        // Apply parallax to visible items
        ridesSliderItems.forEach((item) => {
          const image = item.querySelector(".rides-slider-image img");
          if (image) {
            const rect = item.getBoundingClientRect();
            // Check if any part of the item is visible
            const isVisible = rect.right > 0 && rect.left < window.innerWidth;

            if (isVisible) {
              // Calculate how far the item is from the left edge of the viewport
              const distanceFromLeft = rect.left;
              // Calculate parallax based on position relative to viewport
              const parallaxX = (distanceFromLeft / window.innerWidth) * 200;

              gsap.to(image, {
                x: -parallaxX,
                duration: 0.1,
                ease: "none",
              });
            } else {
              // Only reset if completely out of view
              if (rect.right < 0 || rect.left > window.innerWidth) {
                gsap.to(image, {
                  x: 0,
                  duration: 0.1,
                  ease: "none",
                });
              }
            }
          }
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const reserveBackground = document.querySelector(".reserve-background img");

    if (reserveBackground) {
      ScrollTrigger.create({
        trigger: ".reserve-container",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          // Scale from 1 to 1.2 based on scroll progress
          const scale = 1 + progress * 0.2;
          gsap.to(reserveBackground, {
            scale: scale,
            duration: 0.1,
            ease: "none",
          });
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const reserveTitle = document.querySelector(".reserve-title");
    const reserveDescription = document.querySelector(
      ".reserve-description-left h2"
    );

    if (reserveTitle) {
      // Split text into characters using SplitType
      const splitText = new SplitType(reserveTitle, {
        types: "chars",
        charClass: "reserve-char",
      });

      // Create wrapper for each character
      splitText.chars.forEach((char) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("char-wrapper");
        char.parentNode.insertBefore(wrapper, char);
        wrapper.appendChild(char);
      });

      // Set initial state
      gsap.set(".reserve-char", {
        xPercent: 100,
        // opacity: 0
      });

      // Create ScrollTrigger animation
      ScrollTrigger.create({
        trigger: ".reserve-container",
        start: "top+=100 center",
        // end: 'center center',
        // scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.to(".reserve-char", {
            xPercent: 0,
            // opacity: 1,
            stagger: 0.03,
            delay: 0.2,
            duration: 1.2,
            ease: "power3.out",
          });
        },
      });
    }

    if (reserveDescription) {
      // Split each span into characters
      const spans = reserveDescription.querySelectorAll("span");

      spans.forEach((span, index) => {
        const splitSpan = new SplitType(span, {
          types: "chars",
          charClass: "reserve-desc-char",
        });

        // Create wrapper for each character
        splitSpan.chars.forEach((char) => {
          const wrapper = document.createElement("div");
          wrapper.classList.add("char-wrapper");
          char.parentNode.insertBefore(wrapper, char);
          wrapper.appendChild(char);
        });

        // Set initial state
        gsap.set(splitSpan.chars, {
          xPercent: 100,
          // opacity: 0
        });

        // Create ScrollTrigger animation for each line
        ScrollTrigger.create({
          trigger: ".reserve-container",
          start: "top+=100 center",
          // end: 'center center',
          // scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            gsap.to(splitSpan.chars, {
              xPercent: 0,
              // opacity: 1,
              stagger: 0.02,
              delay: 0.4 + index * 0.1, // Add delay based on line number
              duration: 1.2,
              ease: "power3.out",
            });
          },
        });
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <main>
      <div className="main">
        <div className="hero-container">
          <nav className="nav-container">
            <div className="nav-logo" ref={navLogoRef}>
              Capsules
            </div>
            <div className="nav-button">
              <button className="hero-button">
                <p>reserve</p>
                <svg
                  width="35"
                  height="35"
                  viewBox="-2 -2 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginLeft: "8px", verticalAlign: "middle" }}
                >
                  <path
                    d="M15.0237 4.36449L1.66265 17.7255L0.287972 16.3508L13.649 2.98981L2.0943 2.98981L2.09431 0.974945L17.0385 0.974956L17.0385 15.8929H15.0499L15.0237 4.36449Z"
                    fill="#B1A696"
                  />
                </svg>
              </button>
            </div>
          </nav>

          <Image src="/homepage/hero.png" alt="hero-image" width={1000} height={1000} />
          <div className="hero-header">
            <h1 className="hero-title" ref={heroTitleRef}>
              Capsules
            </h1>
          </div>

          <div className="hero-footer">
            <div className="hero-footer-title" ref={heroFooterRef}>
              <span>Closer to</span>
              <span>Nature—Closer</span>
              <span>to Yourself</span>
            </div>
            <div className="hero-footer-content">
              <p>
                Spend unforgettable and remarkable time in the Californian
                desert with—Capsules.
              </p>
            </div>
          </div>
        </div>

        <div className="about-container">
          <div className="about-text">
            <h1 ref={aboutTextRef}>
              Welcome to a world of wild California desert with Capsules®, where
              you will discover exquisite nature observing it from capsule
              houses, nestled in the one of the most breathtaking destination on
              the United States.
            </h1>
          </div>
          <div className="about-footer">
            <div className="about-image">
              <Image src="/homepage/welcome-1.png" alt="about-image" width={1000} height={1000} />
              <Image src="/homepage/welcome-2.png" alt="about-image" width={1000} height={1000} />
            </div>
            <div className="about-footer-text">
              <h2>
                A place where you can be with yourself and your loved ones.{" "}
                <br />A place where you can experience unforgettable desert
                things.
              </h2>
            </div>
          </div>
        </div>

        <div className="features-container">
          <div className="features-subtitle">
            <p>Discover available Capsules® </p>
          </div>
          <div className="features-title">
            <h1 ref={featuresTitleRef}>Choose the one you like best</h1>
          </div>
          <div className="features-content">
            <div className="feature-description-container">
              <h2>
                You can choose one of three premium capsule houses in our offer.
                Each of our capsules provides the highest quality and meets the
                standards adjusted to your needs. Choose the one you like.
              </h2>
            </div>
            <div className="feature-tabs-container">
              <p>All Capsules® houses—has built based on the same rules:</p>
              <div className="feature-tabs-item">
                <h2>Sustainable</h2>
                <h2>Nature—Care</h2>
                <h2>Smart</h2>
                <h2>Privacy</h2>
                <h2>Spacious</h2>
                <h2>Glassed-in</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="card-container">
          <div className="card-wrapper">
            <div className="marquee-container">
              <div className="marquee-content">
                <span>
                  CAPSULES® CAPSULES® CAPSULES® CAPSULES® CAPSULES® CAPSULES®
                  CAPSULES® CAPSULES® CAPSULES® CAPSULES® CAPSULES® CAPSULES®
                  CAPSULES® CAPSULES® CAPSULES® CAPSULES® CAPSULES®{" "}
                </span>
                <span>
                  CAPSULES® CAPSULES® CAPSULES® CAPSULES® CAPSULES® CAPSULES®
                  CAPSULES® CAPSULES® CAPSULES® CAPSULES® CAPSULES® CAPSULES®
                  CAPSULES® CAPSULES® CAPSULES® CAPSULES® CAPSULES®{" "}
                </span>
              </div>
            </div>
            <div className="card-item">
              <div className="card-item-image">
                <Image src="/homepage/card1.png" alt="card-image" width={1000} height={1000} />
              </div>
              <div className="card-item-text-content">
                <div className="card-item-content">
                  <div className="card-item-title">
                    <h2>Classic Capsule®</h2>
                    <h3>(Scroll)</h3>
                  </div>
                </div>
                <div className="card-item-description">
                  <p>
                    Classic Capsule® boasts refined aesthetics and a modern
                    interior, creating an intimate retreat in a desert
                    landscape.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="card-wrapper">
            <div className="card-item">
              <div className="card-item-image">
                <Image src="/homepage/card2.png" alt="card-image" width={1000} height={1000} />
              </div>
              <div className="card-item-text-content">
                <div className="card-item-content">
                  <div className="card-item-title">
                    <h2>Classic Capsule®</h2>
                    <h3>(Scroll)</h3>
                  </div>
                </div>
                <div className="card-item-description">
                  <p>
                    Classic Capsule® boasts refined aesthetics and a modern
                    interior, creating an intimate retreat in a desert
                    landscape.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="card-wrapper">
            <div className="card-item">
              <div className="card-item-image">
                <Image src="/homepage/card3.png" alt="card-image" width={1000} height={1000} />
              </div>
              <div className="card-item-text-content">
                <div className="card-item-content">
                  <div className="card-item-title">
                    <h2>Classic Capsule®</h2>
                    <h3>(Scroll)</h3>
                  </div>
                </div>
                <div className="card-item-description">
                  <p>
                    Classic Capsule® boasts refined aesthetics and a modern
                    interior, creating an intimate retreat in a desert
                    landscape.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="location-container">
          <div className="location-content">
            <div className="location-subtitle">
              <p>Closer than you think</p>
            </div>
            <div className="location-title">
              <h1>
                Our Capsules® are located near Los Angeles with easy <br />
                <span>access by road</span>
              </h1>
            </div>
            <div className="location-hover">
              <p>show the map</p>
              <div className="location-icon">
                <svg
                  width="45"
                  height="45"
                  viewBox="-2 -2 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginLeft: "8px", verticalAlign: "middle" }}
                >
                  <path
                    d="M15.0237 4.36449L1.66265 17.7255L0.287972 16.3508L13.649 2.98981L2.0943 2.98981L2.09431 0.974945L17.0385 0.974956L17.0385 15.8929H15.0499L15.0237 4.36449Z"
                    fill="#181717"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="benefits-container">
          <div className="benefits-subtitle">
            <p>
              Want to learn more about
              <br />
              the benefits of—Capsules®?
            </p>
          </div>

          <div className="benefit-marquee">
            <h1 className="benefit-marquee-content">
              Why Capsules®?<span>*</span>
            </h1>

            <div className="benefit-item-container">
              <div className="benefit-item">
                <div className="benefit-item-content">
                  <div className="benefit-item-title">
                    <h2>
                      Enjoy the view through—the wide panoramic glass window
                    </h2>
                  </div>
                  <div className="benefit-item-description">
                    <div className="benefit-item-counter">
                      <h2 className="benefit-counter-active">01</h2>
                      <h2>03</h2>
                    </div>
                    <p>
                      Get closer to the desert nature than ever before and
                      admire this unique, breathtaking landscape.
                    </p>
                  </div>
                </div>
                <div className="benefit-item-image">
                  <Image src="/homepage/benefit-1.jpg" alt="benefit-1" width={1000} height={1000} />
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-item-content">
                  <div className="benefit-item-title">
                    <h2>
                      Experience luxury and comfort in the heart of nature
                    </h2>
                  </div>
                  <div className="benefit-item-description">
                    <div className="benefit-item-counter">
                      <h2 className="benefit-counter-active">02</h2>
                      <h2>03</h2>
                    </div>
                    <p>
                      Our capsules combine modern amenities with sustainable
                      design to provide an unparalleled desert living
                      experience.
                    </p>
                  </div>
                </div>
                <div className="benefit-item-image">
                  <Image src="/homepage/benefit-2.jpg" alt="benefit-2" width={1000} height={1000} />
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-item-content">
                  <div className="benefit-item-title">
                    <h2>Connect with the desert's untamed beauty</h2>
                  </div>
                  <div className="benefit-item-description">
                    <div className="benefit-item-counter">
                      <h2 className="benefit-counter-active">03</h2>
                      <h2>03</h2>
                    </div>
                    <p>
                      Immerse yourself in the serene desert landscape while
                      staying in our thoughtfully designed capsule
                      accommodations.
                    </p>
                  </div>
                </div>
                <div className="benefit-item-image">
                  <Image src="/homepage/benefit-3.jpg" alt="benefit-3" width={1000} height={1000} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="adventure-container">
          <div className="adventure-subtitle">
            <p>Ready for an adventure?</p>
          </div>
          <div className="adventure-title">
            <h1 ref={adventureTitleRef}>Discover the desert activities</h1>
          </div>
          <div className="adventure-content">
            <div className="adventure-tabs-container">
              <p>
                Offered Capsules® activities have different levels of
                difficulty:
              </p>
              <div className="adventure-progress-item">
                <div className="adventure-progress-item-content">
                  <h2>Easy</h2>
                  <h4>3-5h Duration</h4>
                </div>
                <div className="adventure-progress-item-content">
                  <h2>Medium</h2>
                  <h4>8-12h Duration</h4>
                </div>
                <div className="adventure-progress-item-content">
                  <h2>Hard</h2>
                  <h4>24h Duration</h4>
                </div>
              </div>
            </div>
            <div className="adventure-description-container">
              <h2>
                We want to make sure your stay is exciting and enjoyable. That's
                why we offer a variety of activities with different levels of
                engagement. Whether you seek thrills or tranquility, there's
                something for everyone to make your desert stay truly memorable.
              </h2>
            </div>
          </div>
        </div>

        <div className="rides-slider-container">
          <div className="rides-slider-wrapper">
            <div className="rides-slider-item">
              <div className="rides-slider-content">
                <div className="rides-slider-title">
                  <h2>Desert Rides</h2>
                </div>
                <div className="rides-slider-description">
                  <p>
                    Experience the thrill of exploring the desert landscape on
                    our guided rides. From gentle scenic tours to
                    adrenaline-pumping adventures, our expert guides will ensure
                    an unforgettable journey through the stunning terrain.
                  </p>
                  <div className="rides-slider-counter">
                    <h2>01</h2>
                    <h2>03</h2>
                  </div>
                </div>
              </div>
              <div className="rides-slider-image">
                <Image src="/homepage/card1.png" alt="Desert ride experience" width={1000} height={1000} />
              </div>
            </div>

            <div className="rides-slider-item">
              <div className="rides-slider-content">
                <div className="rides-slider-title">
                  <h2>Night Adventures</h2>
                </div>
                <div className="rides-slider-description">
                  <p>
                    Discover the magic of the desert after dark. Our night
                    adventures offer a unique perspective of the landscape under
                    starlit skies, complete with expert guides and
                    state-of-the-art equipment for a safe and memorable
                    experience.
                  </p>
                  <div className="rides-slider-counter">
                    <h2>02</h2>
                    <h2>03</h2>
                  </div>
                </div>
              </div>
              <div className="rides-slider-image">
                <Image
                  src="/homepage/card2.png"
                  alt="Night adventure experience"
                />
              </div>
            </div>

            <div className="rides-slider-item">
              <div className="rides-slider-content">
                <div className="rides-slider-title">
                  <h2>Night Adventures</h2>
                </div>
                <div className="rides-slider-description">
                  <p>
                    Discover the magic of the desert after dark. Our night
                    adventures offer a unique perspective of the landscape under
                    starlit skies, complete with expert guides and
                    state-of-the-art equipment for a safe and memorable
                    experience.
                  </p>
                  <div className="rides-slider-counter">
                    <h2>03</h2>
                    <h2>03</h2>
                  </div>
                </div>
              </div>
              <div className="rides-slider-image">
                    <Image
                  src="/homepage/card2.png"
                  alt="Night adventure experience"
                  width={1000}
                  height={1000}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="reserve-container">
          <h1 className="reserve-title">
            Capsules<span>®</span>
          </h1>
          <div className="reserve-content">
            <div className="reserve-footer">
              <div className="reserve-description-left">
                <h2>
                  <span>Closer to</span>
                  <span>Nature—Closer</span>
                  <span>to Yourself</span>
                </h2>
              </div>
              <div className="reserve-description-right">
                <p>
                  Spend unforgettable and remarkable time in the Californian
                  desert with—Capsules.
                </p>
              </div>
            </div>
          </div>
          <div className="reserve-background">
            <div className="reserve-image-wrapper">
              <Image src="/homepage/hero.png" alt="Screen background" width={1000} height={1000} />
            </div>
          </div>
        </div>

        <div className="footer-container">
          <div className="footer-marquee-container">
            <p className="footer-subtitle">
              Interested in an amazing adventure? Reserve one of our Capsules®
            </p>
            <div className="footer-marquee-content">
              <span>Book Your Capsule --</span>
            </div>
          </div>
          <div className="footer-info-container">
            <div className="footer-info-item">
              <div className="footer-info-left">
                <h2>
                  This website is just the concept work done by—Moyra to
                  showcase our capabilities.
                  <br />
                  <br /> If you would like to outsource a similar website
                  project—
                  <span>
                    <Link href="mailto:ombhalodiya4545@gmail.com">Contact us.</Link>
                  </span>
                </h2>
              </div>

              <div className="footer-info-right">
                <div className="footer-info-page-links">
                  <Link href="/">Welcome</Link>
                  <Link href="/">Introduction</Link>
                  <Link href="/">Houses</Link>
                  <Link href="/">Why Capsules®</Link>
                  <Link href="/">Activities</Link>
                  <Link href="/">Feedback</Link>
                </div>
              </div>
            </div>
            <div className="footer-social-and-paragraph">
              <div className="footer-social-links">
                <Link href="/">
                  <Image src="/homepage/linked-in.svg" alt="LinkedIn" width={1000} height={1000} />
                </Link>
                <Link href="/">
                  <Image src="/homepage/instagram.svg" alt="Instagram" width={1000} height={1000} />
                </Link>
                <Link href="/">
                  <Image src="/homepage/dribble.svg" alt="Dribble" width={1000} height={1000} />
                </Link>
                <Link href="/">
                  <Image src="/homepage/behance.svg" alt="Behance" width={1000} height={1000} />
                </Link>
              </div>
              <p>
                Meet Capsules®—modern and cozy houses, in the California desert.
              </p>
            </div>
          </div>
          <div className="footer-bottom-container">
            <div className="footer-credits">
              <p>
                Designed by - <span>Ombhalodiya</span>
              </p>
              <p>
                Sites using <span>Cookies</span>
              </p>
              <p>© 2025. All rights reserved.</p>
            </div>
            <div className="footer-brand-name">
              <h2>
                Capsules<span>®</span>
              </h2>
            </div>
          </div>
        </div>
      </div>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
      <Menu />
    </main>
  );
}
