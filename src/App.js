import React from "react";
import "./styles.css";
import Shake from "shake.js";
import Darkmode from "darkmode-js";

const dark = new Darkmode();

// import * as darkreader from "darkreader";

// darkreader.enable();

let myShakeEvent = new Shake({
  threshold: 5, // optional shake strength threshold
  timeout: 150 // optional, determines the frequency of event generation
});

//function to call when shake occurs
function shakeEventDidOccur(setShake) {
  setShake(true);
  window.navigator.vibrate(60);
}

function handleMouseMove(event, setMouseX, setMouseY) {
  setMouseX(event.clientX);
  setMouseY(event.clientY);
}

let z = 0;
let x = 0;
let y = 0;

function handleOrientation(event, setLocalX, setLocalY, setLocalZ) {
  z = event.alpha; // In degree in the range [-90,90]
  x = event.beta; // In degree in the range [-180,180]
  y = event.gamma; // In degree in the range [-90,90]

  // console.log(x, y);

  setLocalZ(event.alpha);
  setLocalX(event.beta);
  setLocalY(event.gamma);

  // Because we don't want to have the device upside down
  // We constrain the x value to the range [-90,90]
  if (x > 90) {
    setLocalX(90);
  }
  if (x < -90) {
    setLocalX(-90);
  }

  // To make computation easier we shift the range of
  // x and y to [0,180]
  x += 90;
  y += 90;

  // 10 is half the size of the ball
  // It center the positioning point to the center of the ball
}

export default function App() {
  dark.toggle();
  console.log(dark.isActivated());
  const [localZ, setLocalZ] = React.useState(0);
  const [localX, setLocalX] = React.useState(0);
  const [localY, setLocalY] = React.useState(0);
  const [mouseX, setMouseX] = React.useState(0);
  const [mouseY, setMouseY] = React.useState(0);
  const [darkToggle, setDarkToggle] = React.useState(false);
  const [shakeCount, setShakeCount] = React.useState(0);
  const [darkMode, setDarkMode] = React.useState(false);
  let timeout = null;
  const [shake, setShake] = React.useState(false);

  React.useEffect(() => {
    myShakeEvent.start();

    // window.addEventListener("shake", (e) =>
    //   shakeEventDidOccur(e, darkToggle, setDarkToggle)
    // );
    window.addEventListener("shake", () => shakeEventDidOccur(setShake));
    window.addEventListener("deviceorientation", (e) =>
      handleOrientation(e, setLocalX, setLocalY, setLocalZ)
    );
    window.addEventListener("mousemove", (e) =>
      handleMouseMove(e, setMouseX, setMouseY)
    );
    return () => {
      window.removeEventListener("deviceorientation", (e) =>
        handleOrientation(e, setLocalX, setLocalY, setLocalZ)
      );
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("shake", () => shakeEventDidOccur(setShake));
    };
  }, []);

  React.useEffect(() => {
    console.log(`shakeCount is : ${shakeCount}`);
    if (shake) {
      if (shakeCount !== 2) {
        setShakeCount(shakeCount + 1);
        setShake(false);
      }
      timeout = setTimeout(() => {
        setShakeCount(0);
      }, 600);
    }
  }, [shake]);

  React.useEffect(() => {
    console.log("applying count", shakeCount);
    if (shakeCount === 2) {
      setDarkToggle(!darkToggle);
      setShake(false);
      setShakeCount(0);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [shakeCount]);

  React.useEffect(() => {
    // if (localX * localY <= -1) {
    if (!darkToggle) {
      dark.toggle();

      // darkreader.enable({
      //   brightness: 100,
      //   contrast: 100,
      //   sepia: 0,
      //   mode: 1
      // });
      setDarkMode(true);
    } else if (darkToggle) {
      dark.toggle();
      // darkreader.enable({
      //   brightness: 100,
      //   contrast: 500,
      //   sepia: 0,
      //   mode: 0
      // });
      setDarkMode(false);
    }
    // }
  }, [darkToggle]);

  React.useEffect(() => {
    if (mouseY > 440) setDarkToggle(true);
    else setDarkToggle(false);
  }, [mouseY]);

  const content = () => (
    <div className="d-flex flex-wrap w-max justify-content-center">
      <div className="card">
        <h1 className="card-header text-light">
          A small react Library to Toggle Dark Mode on Shake or Flip
        </h1>
      </div>

      <div
        className="animatedText d-flex flex-column align-items-center w-75"
        style={{
          transform: `translateX(calc(${
            (localZ > 180 ? localZ * 1000 : localZ * -100) |
            ((mouseX - 200) / 10)
          }px))`,
          transitionDuration: "200ms"
        }}
      >
        <h2 className="d-flex justify-content-center">
          Shake your mobile device{" "}
          <span class="card-header mx-1"> twice ( x 2 ) </span> to switch to
        </h2>
        <div className="card card-body d-flex justify-content-center align-items-center">
          <legend>{darkMode ? "White" : "Black"}</legend>
        </div>
        <h4 className="d-flex justify-content-center">
          Beta: {localX?.toFixed(2)} | Gamma: {localY?.toFixed(2)} | Alpha:{" "}
          {localZ?.toFixed(2)}
        </h4>
        {darkToggle}
      </div>

      {/* <pre className="output">
        Localbeta: {localX.toFixed(2)} | LocalGamma: {localY.toFixed(2)} |
        LocalAlpha: {localZ.toFixed(2)}
      </pre> */}
      <pre className="output">
        mouseX: {mouseX} | mouseY: {mouseY}
      </pre>
    </div>
  );
  return content();
}
