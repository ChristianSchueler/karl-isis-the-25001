import { gsap } from "gsap";
import { Maptastic } from "maptastic";

/**
 * @class ScaleToFitWindow scales all html elements given as selector such that their original size fits into the window
 * and maintains aspect ratio.
 */
export class ScaleToFitWindow {
    viewSelector: string;
  
    constructor(elementSelector: string) {
  
      this.viewSelector = elementSelector;
      console.log(this.constructor.name, "views for scaling selected:", this.viewSelector);
  
      this.rescale();
      this.installResizeHandler();
    }
  
    /**
     * 
     */
    installResizeHandler() {
      window.addEventListener("resize", () => {
        console.log(this.constructor.name, "window resizing");
        this.rescale();
      })
    }
  
    /**
     * 
     */
    rescale() {
      console.log(this.constructor.name, "rescaling views");
  
      const views: NodeListOf<HTMLElement> = document.querySelectorAll(this.viewSelector);   // grab all currently existing DOM elements
  
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const winAspect = windowWidth/windowHeight;
      console.log("Window size:", windowWidth, windowHeight);
  
      // perform scaling for ALL DOM elements in selector
      for (const view of views) {
        const origWidth = view.clientWidth;
        const origHeight = view.clientHeight;
        console.log("View:", view, "size:", origWidth,origHeight);
  
        let scale;
  
        // view is wider than window -> scale down width
        if (origWidth/origHeight >= winAspect) {
          scale = windowWidth/origWidth;
        }
        else {
          scale = windowHeight/origHeight;
        }
  
        view.style.transformOrigin="0 0";
        gsap.to(view, { duration: 1, css: { scale: scale } });

        // update transformation
        
        //view.style.transform="scale(" + scale + ")";
        
        console.log("Scaling to", scale);

        new Maptastic(view);
      } 
    }
  }