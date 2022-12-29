import { ScaleToFitWindow } from "./ScaleToFitWindow.js";
import ChromaGL from 'gl-chromakey';
import { Maptastic } from "maptastic";
import { gsap } from "gsap";

const screenSelector = "#screen";

export class Portal {
  highPerformanceMode: boolean = false;
  /*video: HTMLVideoElement|null = null;
  video2;
  c1;
  ctx1: CanvasRenderingContext2D;
  c_tmp;
  ctx_tmp;
*/
  frameId:number = -1;
  chroma:any;

  constructor() {

      console.log("Interdimensional Cocktail Portal, (c) 2022 Christian Schüler");

      this.installKeyboardDebugHandler();

      //this.init();

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

        gsap.to(portalImage, { css: { rotation:360 },
          duration: 15,
          ease: "none",
          repeat: -1,
          paused: false});
      }
 
      //new ScaleToFitWindow(screenSelector);
      
      console.log("Started MapTastic: used Shift-Space to open mapping controls.");
      new Maptastic("app");

      gsap.fromTo(".header-title", { x: -500, duration: 5 }, {x: 0});
  }

    // methods for render loop
  startChroma = () => {
    this.frameId = requestAnimationFrame(this.startChroma);
    this.chroma.render()
  }
  stopChroma = () => cancelAnimationFrame(this.frameId)


   /*
  init() {
    this.video = document.getElementById('video') as HTMLVideoElement;

    this.video2 = document.createElement('video');
    this.video2.src = "fire.mp4"
    this.video2.muted = true;
    this.video2.autoplay = true;

    this.c1 = document.getElementById('portal');
    this.ctx1 = this.c1.getContext('2d');

    c_tmp = document.createElement('canvas');
    c_tmp.setAttribute('width', 800);
    c_tmp.setAttribute('height', 450);
    ctx_tmp = c_tmp.getContext('2d');

    this.video.addEventListener('play', this.computeFrame);
  }

  computeFrame() {

    if (this.video.paused || this.video.ended) {
      return;
    }
    ctx_tmp.drawImage(video, 0, 0, video.videoWidth , video.videoHeight );
    let frame = ctx_tmp.getImageData(0, 0, video.videoWidth , video.videoHeight );

    ctx_tmp.drawImage(video2, 0, 0, video2.videoWidth , video2.videoHeight );
    let frame2 = ctx_tmp.getImageData(0, 0, video2.videoWidth , video2.videoHeight );

    this.ctx1.clearRect();
    let frame = this.video.getImageData(0, 0, this.video.videoWidth , this.video.videoHeight );

    for (let i = 0; i < frame.data.length /4; i++) {
      let r = frame.data[i * 4 + 0];
      let g = frame.data[i * 4 + 1];
      let b = frame.data[i * 4 + 2];

      //8/39/245
      if (r < 45 && g < 45 && b > 100) 
      //if (b >= 220) 
      //if (r > 70 && r < 160 && g > 95 && g < 220 && b > 25 && b < 150) 
      {  
          frame.data[i * 4 + 0] = 0;//frame2.data[i * 4 + 0];
          frame.data[i * 4 + 1] = 0;//frame2.data[i * 4 + 1];
          frame.data[i * 4 + 2] = 0;//frame2.data[i * 4 + 2];
      }
    }
    this.ctx1.putImageData(frame, 0, 0);
    setTimeout(this.computeFrame, 0);   // TODO: this is bad!
  }
*/

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
 
        //console.log("Hi there");
  }
};

new Portal();