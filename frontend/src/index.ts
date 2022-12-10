//import * as Maptastic from 'maptastic'

/**
 * @class ScaleToFitWindow scales all html elements given as selector such that their original size fits into the window
 * and maintains aspect ratio.
 */
export class ScaleToFitWindow {
  constructor(elementSelector: string) {

    console.log("Hello");

    console.log(this.constructor.name, "asdpj");

    const views = document.querySelectorAll(elementSelector);

    for (const view of views) {
      console.log("View:", view);
      const origWidth = view.clientWidth;
      const origHeight = view.clientHeight;
      console.log(origWidth,origHeight);
    } 
  }
}

export class Portal {

  constructor() {
      this.installKeyboardDebugHandler();
  }

  installKeyboardDebugHandler() {
      document.addEventListener('keydown', (event) => {
          const keyName = event.key;
        
          console.log(keyName);
          // 1, 2, 3, 4, 5,6 7, 8, 9, 0 pumps 1 to 10 on/off
          // motor vor/zurück

          if (keyName === 'Control') {
            // do not alert when only Control key is pressed.
            return;
          }
        
          /*if (event.ctrlKey) {
            // Even though event.key is not 'Control' (e.g., 'a' is pressed),
            // event.ctrlKey may be true if Ctrl key is pressed at the same time.
            alert(`Combination of ctrlKey + ${keyName}`);
          } else {
            alert(`Key pressed ${keyName}`);
          }*/
        }, false);
 
        console.log("Hi there");
  }
};

//import * as gsap from "gsap";

new Portal();

new ScaleToFitWindow("#screen");

console.log("sdfsdfsdf");