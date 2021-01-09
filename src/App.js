import React, { useRef } from "react";
import "./styles.css";
import Shake from "shake.js";
import Darkmode from "darkmode-js";

const dark = new Darkmode();

let myShakeEvent = new Shake({
  threshold: 3.5, // optional shake strength threshold
  timeout: 210 // optional, determines the frequency of event generation
});

//function to call when shake occurs
function shakeEventDidOccur(setShake) {
  new Promise((res, _) => {
    res(navigator.vibrate([100]));
  }).then(() => {
    console.log("vibration:", navigator.vibrate([60]));
    console.log("integration Test");
    setShake(true);
  });
}

function handleMouseMove(event, setMouseX, setMouseY) {
  setMouseX(event.clientX);
  setMouseY(event.clientY);
}

let z = 0;
let x = 0;
let y = 0;

function handleOrientation(event, setLocalX, setLocalY, setLocalZ) {
  x = event.beta; // In degree in the range [-180,180]
  y = event.gamma; // In degree in the range [-90,90]
  z = event.alpha | 0; // In degree in the range [-90,90]

  // console.log(x, y);

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

  setLocalX(x);
  setLocalY(y);
  setLocalZ(z);
}

export default function App() {
  const [localZ, setLocalZ] = React.useState(0);
  const [localX, setLocalX] = React.useState(0);
  const [localY, setLocalY] = React.useState(0);
  const [mouseX, setMouseX] = React.useState(0);
  const [mouseY, setMouseY] = React.useState(0);
  const [darkToggle, setDarkToggle] = React.useState(false);
  const [shakeCount, setShakeCount] = React.useState(0);
  const [darkMode, setDarkMode] = React.useState(false);
  const timeout = useRef(null);
  const [shake, setShake] = React.useState(false);

  React.useEffect(() => {
    console.log(navigator.vibrate(0));
    myShakeEvent.start();
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
      clearTimeout(timeout.current);
    };
  }, []);

  React.useEffect(() => {
    console.log(`shakeCount is : ${shakeCount}`);
    if (shake) {
      setShakeCount((shakeC) => shakeC + 1);
      console.log("logging shake", shake);
      setShake(false);
      timeout.current = setTimeout(() => {
        setShakeCount(0);
      }, 740);
    }
  }, [shake]);

  React.useEffect(() => {
    if (shakeCount === 0) {
      console.log("timeout count", shakeCount);
    } else {
      console.log("applying count", shakeCount);
    }
    if (shakeCount === 2) {
      setDarkToggle((dToggle) => !dToggle);
      setShake(false);
      setShakeCount(0);
    }

    return () => {
      // clearTimeout(timeout.current);
    };
  }, [shakeCount]);

  React.useEffect(() => {
    // if (localX * localY <= -1) {
    if (!darkToggle) {
      dark.toggle();
      setDarkMode(true);
    } else if (darkToggle) {
      dark.toggle();

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
          A small react Library to Toggle Dark Mode on Shake or Twist
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
          <span className="card-header mx-1"> twice ( x 2 ) </span> to switch to
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
      <pre className="output">
        mouseX: {mouseX} | mouseY: {mouseY}
      </pre>
    </div>
  );
  return content();
}
