// Google Media Pipe Face Detection Test using Typescript, (c) 2023 Christian Schüler, christianschueler.at

import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision"
import { ScaleToFitWindow } from "./ScaleToFitWindow.js";
import { gsap } from "gsap";

/** @class Application */
export class Application {
  lastVideoTime = -1;
  video?: HTMLVideoElement;
  faceDetector?: FaceDetector;

  constructor() {
    console.log("Google Media Pipe Face Detection Test using Typescript, (c) 2023 Christian Schüler, christianschueler.at");

    new ScaleToFitWindow("#screen"); 
  }

  async setup(): Promise<void> {

    if (!('mediaDevices' in navigator)) return;
    if (!('getUserMedia' in navigator.mediaDevices)) return;

    console.log("media api: go");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        // width: {
          // min: 1280,
          // ideal: 1920,
          // max: 2560,
        // },
        // height: {
          // min: 720,
          // ideal: 1080,
          // max: 1440
        // },
        // facingMode: 'user'
      }
    });

    console.log("camera activated", stream);

    this.video = document.getElementById("video") as HTMLVideoElement;
    this.video.srcObject = stream;

    console.log("video running", this.video);

    // https://snyk.io/advisor/npm-package/@mediapipe/tasks-vision
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    this.faceDetector = await FaceDetector.createFromModelPath(vision,
      "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
    );

    console.log("mediapipe loaded");

    await this.faceDetector.setOptions({ runningMode: "VIDEO" });

    console.log("face detector created");
  }

  // analyse
  run(): void {
  
    if (this.video?.currentTime !== this.lastVideoTime) {
      const d = this.faceDetector?.detectForVideo(this.video!, this.lastVideoTime);
      //console.log(detections);
      if (d && d.detections && d.detections.length > 0) {
		let bb = d.detections[0].boundingBox;
		if (bb) {
			let centerX = bb.originX + bb.width/2;
			let centerY = bb.originY + bb.height/2;
			console.log(centerX, centerY);
		}
	  }
      this.lastVideoTime = this.video!.currentTime;
    }

    requestAnimationFrame(() => {
      this.run();
    });
  }
}

// go!
const app = new Application();
await app.setup();
app.run();