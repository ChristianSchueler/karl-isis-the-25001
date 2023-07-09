import { ScaleToFitWindow } from "./ScaleToFitWindow.js";
import ChromaGL from 'gl-chromakey';
import { Maptastic } from "maptastic";
import { gsap } from "gsap";
import { listenerCount } from "process";
import { urlToHttpOptions } from "url";

const screenSelector = "#screen";

/** @class Portal */
export class Portal {
  highPerformanceMode: boolean = true;          // whether or not to use video animation or image animation
  portalElement: HTMLElement | null = null;
  frameId:number = -1;                          // for video aniamtion
  chroma:any;                                   // for video aniamtion
  portalOpen: boolean = false;

  constructor() {

      console.log("Interdimensional Cocktail Portal, (c) 2022 Christian Schüler");

      this.installKeyboardDebugHandler();

      this.setupPortalAnimation();
      
      new ScaleToFitWindow(screenSelector);

      console.log("Starting MapTastic");
      new Maptastic("app");
      console.log(`
      SHIFT + Space Toggle edit mode

      While In Edit Mode
      click or drag select and move quads/corner points
      
      SHIFT + drag move selcted quad/corner point with 10x precision
      
      ALT + drag rotate and scale selected quad
      
      SHIFT + ALT + drag rotate and scale selected quad with 10x precision.
      
      Arrow keys move selected quad/corner point
      
      SHIFT + Arrow keys move selected quad/corner point by 10 pixels
      
      ALT + Arrow keys rotate and scale selected quad
      
      's' Solo or unsolo the selected quad (hides all others). This helps to adjust quads when corner points are very close together.
      
      'c' Toggle mouse cursor crosshairs
      
      'b' Toggle display bounds/metrics
      
      'r' Rotate selected layer 90 degrees clockwise
      
      'h' Flip selected layer horizontally
      
      'v' Flip selected layer vertically
      
      'x' remove settings from localStorage. Hit Ctrl-R for reload.`);
  }

  // set up portal animation
  setupPortalAnimation() {

    if (this.highPerformanceMode) {
      console.log("High performance mode: using greenscreen chroma keying.");

      console.log("Setting up chrome keying");

      const video = document.getElementById('video');
      
      // grab portal video and make visible
      const canvas = document.getElementById('portal');
      canvas?.classList.add("visible");
      canvas?.classList.remove("invisible");

      // hide portal image
      const portalImage = document.getElementById('portal-image');
      portalImage?.classList.add("invisible");
      portalImage?.classList.remove("visible");

      // set source video and target canvas elements
      this.chroma = new ChromaGL(video, canvas);
      console.log("WebGL2 Support:", this.chroma.hasWebGL2());
      //this.chroma.key('auto');
      //8/39/245
      //if (r < 45 && g < 45 && b > 100) 
      this.chroma.key({ color: [8, 39, 245], tolerance: 0.3 })  // blue

      // link to <video> element
      video!.addEventListener('play', this.startChroma);
      video!.addEventListener('pause', this.stopChroma);
      video!.addEventListener('ended', this.stopChroma);

      this.portalElement = canvas;
    }
    else {
      console.log("Low performance mode.");

      // grab portal image and make visible
      const portalImage = document.getElementById('portal-image');
      portalImage?.classList.add("visible");
      portalImage?.classList.remove("invisible");

      // grab portal video and make invisible
      const canvas = document.getElementById('portal');
      canvas?.classList.add("invisible");
      canvas?.classList.remove("visible");

      gsap.to(portalImage, { css: { rotation:-360 },
        duration: 15,
        ease: "none",
        repeat: -1,
        paused: false});

      this.portalElement = portalImage;
    }

    // close portal
    gsap.set(this.portalElement, { scale: 0 });
  }

  /** animated opening of the portal */
  openPortal() {
    console.log("opening portal");

    gsap.fromTo(this.portalElement, { scale: 0 }, { scale: 1, ease: "power2.inOut", duration: 1 })

    this.portalOpen = true;
  }

  /** animated closing of the portal */
  closePortal() {
    console.log("closing portal");

    gsap.fromTo(this.portalElement, { scale: 1 }, { scale: 0, ease: "power2.inOut", duration: 1 })

    this.portalOpen = false;
  }

  // show start screen
  goStart() {
    console.log("screen:start");

    if (this.portalOpen) this.closePortal();

    // fly in title
    gsap.fromTo(".header-title", { x: -500 }, { x: 0, duration: 1, ease: "bounce.out" });
  }

  // show portal
  goPortal() {
    console.log("screen:portal");

    this.openPortal();
  }

  // methods for render loop
  startChroma = () => {
    this.frameId = requestAnimationFrame(this.startChroma);
    this.chroma.render()
  }

  // methods for render loop
  stopChroma = () => cancelAnimationFrame(this.frameId)

  installKeyboardDebugHandler() {
      document.addEventListener('keydown', (event) => {
          const keyName = event.key;
        
          console.log(`key pressed: ${keyName}`);

          switch (keyName) {
            case '0': this.goStart(); break;
            case '1': this.goPortal(); break;
            case 'x': window.localStorage.removeItem("maptastic.layers");
          }

        }, false);
  }
};

// finally!
const portal = new Portal();
portal.goStart();