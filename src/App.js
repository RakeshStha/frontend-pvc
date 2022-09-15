import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
// import {Home} from "./components/pages"
import "./assets/css/main.css"
import './assets/css/fontawesome.min.css'
import './assets/css/fontawesome.css'
import Dumy from "./components/pages/Home/Dumy";

const ENDPOINT = `http://${window.location.hostname}:4001`;

function App() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", data => {
      setResponse(data);
    });
  }, []);

  return (
    <>
      {/* It's <time dateTime={response}>{response}</time> */}
      {/* <Home/> */}
      <Dumy/>
    </>
  );
}

export default App;