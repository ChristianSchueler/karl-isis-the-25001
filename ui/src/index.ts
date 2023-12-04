// Google Media Pipe Face Detection Test using Typescript, (c) 2023 Christian Schüler, christianschueler.at

import { Detection, FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision"
import { ScaleToFitWindow } from "./ScaleToFitWindow.js";
import { gsap } from "gsap";
import { Dir } from "fs";

enum Direction { up, down };
interface Face { x: number, y: number, valid: boolean };

/** @class SquatBot */
export class SquatBot {
  // CONFIG. possibly TODO: move to .env
  readonly targetSquats: number = 21;
  readonly gameWinTimeout_s = 0;          // how long until the next game might start
  readonly faceMinX: number = 100;        // only use faces in the center region
  readonly faceMaxX: number = 640-100;    // only use faces in the center region
  readonly gameStartTimeout_s = 3;        // how long to see a face for starting a game
  readonly topOffset_px = 50;
  readonly bottomOffset_px = 50;
  readonly squatFactor = 1.2;

  // game state
  squats: number = 0;
  lastFaceTime: number = Date.now();
  lastWinTime: number = 0;
  topY: number = 0;
  bottomY: number = 0;
  gameRunning: boolean = false;
  direction: Direction = Direction.down;
  startTime: number = 0;

  constructor() {
    console.log("SquatBot: contructor");
  }

  // find single valid face
  extractFace(d: Detection[]): Face {

    let face = { x: -1, y: -1, valid: false };

    if (d == undefined || d.length == 0) return face;

    let found = false;
    let index = 0;
    do {

      let bb = d[index].boundingBox;
      if (bb) {
        face.x = bb.originX + bb.width/2;     // find center of face
        face.y = bb.originY + bb.height/2;
        found = true;
      }
      else index++;
  
    } while (!found && index < d.length);

    if (found) face.valid = true;

    return face;
  }

  analyzeFaces(d: Detection[]) {

    // find single valid face
    let face = this.extractFace(d);

    // if recently won a game -> exit (game paused)
    if (Date.now() - this.lastWinTime <= this.gameWinTimeout_s*1000) return;

    if (this.gameRunning) {

    }
    else {

      // immediately exit when no game running and no face recognized
      if (!face.valid) { this.startTime = Date.now(); return; }

      // immediately exit when start duration not yet reached
      if (Date.now() - this.startTime <= this.gameStartTimeout_s*1000) return;

      this.startGame(face);
    }
  }

  startGame (face: Face) {
    console.log("SquatBot: start game");

    this.squats = 0;
    this.lastFaceTime = Date.now();
    this.topY = face.y + this.topOffset_px;
    this.bottomY = face.y * this.squatFactor - this.bottomOffset_px;
    this.direction = Direction.down;
    this.gameRunning = true;
  }
}

/** @class Application */
export class Application {
  lastVideoTime = -1;
  video?: HTMLVideoElement;
  faceDetector?: FaceDetector;
  squatBot: SquatBot = new SquatBot();

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
      
      if (d && d.detections) {
        this.squatBot.analyzeFaces(d.detections);
      }
      
      //console.log(detections);
      if (d && d.detections && d.detections.length > 0) {
        let bb = d.detections[0].boundingBox;
        if (bb) {
          let centerX = bb.originX + bb.width / 2;
          let centerY = bb.originY + bb.height / 2;
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