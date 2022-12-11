import { ScaleToFitWindow } from "./ScaleToFitWindow.js";

const screenSelector = "#screen";

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

new Portal();

new ScaleToFitWindow(screenSelector);