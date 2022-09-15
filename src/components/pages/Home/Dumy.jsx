import React, { useEffect, useState } from "react";
import { useRef } from 'react';
import socketIOClient from "socket.io-client";
import CallBackground from "../../../assets/img/call-background.jpg";

// const ENDPOINT = `http://${window.location.hostname}:4001`;
const ENDPOINT = "https://pvc-server.herokuapp.com/"

const Dumy = () => {

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const textRef = useRef()
  // const candidates = useRef([])

  const [offerVisible, setOfferVisible] = useState(true)
  const [answerVisible, setAnswerVisible] = useState(false)
  const [status, setStatus] = useState("Make a call")
  
  const pc = useRef(new RTCPeerConnection(null))
  const socket = socketIOClient(ENDPOINT);

  useEffect(() => {


    //Printing the sdp get from the server
    socket.on('sdp', data => {
      console.log(data)
      pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
      textRef.current.value = JSON.stringify(data.sdp)

      if(data.sdp.type === 'offer'){
        setOfferVisible(false)
        setAnswerVisible(true)
        setStatus('Incoming call ...')
      }
      else{
        setStatus('Call established')
      }

    })

    socket.on('candidate', candidate => {
      console.log(candidate)
     // candidates.current = [...candidates.current, candidate]
      pc.current.addIceCandidate(new RTCIceCandidate(candidate))
    })

    const constraints = {
      audio: false,
      video: true,
    }

    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      //display video
   localVideoRef.current.srcObject = stream

   stream.getTracks().forEach(track => {
    _pc.addTrack(track, stream)
   })
    })
    .catch(e => {
      console.log('getUsermedia Error: ', e)
    })

    const _pc = new RTCPeerConnection(null)
    _pc.onicecandidate = (e) => {
      if(e.candidate)
      console.log(JSON.stringify(e.candidate))

      //send to server
      sendToPeer('candidate', e.candidate)

    }
    
    _pc.oniceconnectionstatechange = (e) => {
      console.log(e)
    }

    _pc.ontrack = (e) => {
      // We got remote stream
      remoteVideoRef.current.srcObject = e.streams[0]
    }

    pc.current = _pc

  }, [])

  const sendToPeer = (eventType, payload) => {
        //send the sdp to the server
        socket.emit(eventType, payload)
  }

  const processSDP = (sdp) => {
    console.log(JSON.stringify(sdp))
    pc.current.setLocalDescription(sdp)
     sendToPeer('sdp', { sdp })
  }


  const createOffer = () => {
    pc.current.createOffer({
      offerToReceiveAudio:1,
      offerToReceiveVideo:1,
    }).then(sdp => {
      //send the sdp to the server
      processSDP(sdp)
      setOfferVisible(false)
      setStatus('Calling...')
    }).catch(e => console.log(e))
  }

  const createAnswer = () => {
    pc.current.createAnswer({
      offerToReceiveAudio:1,
      offerToReceiveVideo:1,
    }).then(sdp => {
      //sending the answer to the offer peer
      processSDP(sdp)
      setAnswerVisible(false)
      setStatus('Call established')
    }).catch(e => console.log(e))
  }

const showHideButtons = () => {
  if(offerVisible){
    return(
      <div>
        <button className="text-docaration-none buttonTransparent" onClick={() => createOffer()}><i class="fa fa-phone fs-1 m-3" aria-hidden="true"></i></button>
        {/* <button onClick={() => createOffer()}>Call</button> */}
      </div>
    )
  }
  else if(answerVisible) {
    return(
      <div>
        <button className="text-docaration-none buttonTransparent" onClick={() => createAnswer()}><i class="fa fa-phone fs-1 m-3 text-success"  aria-hidden="true"></i></button>
      </div>
    )
  }
}
  function onStop(){
      // videoRef.current.destroy()
  }



  return (
    <div className="container-fluid m-0 p-0 position-relative">
     <div className="d-flex">
     <video className="fullHeight" ref={localVideoRef}  autoPlay/>
      <video className="fullHeight" ref={remoteVideoRef}  autoPlay/>
     </div>
        <div className="position-absolute bottom-0 start-50 end-50">
          <div className="d-flex align-items-center justify-content-around">
            {/* <button className="text-docaration-none buttonTransparent"><i class="fa fa-phone fs-1 m-3" aria-hidden="true"></i></button>
            <button className="text-docaration-none buttonTransparent" > <i class="fa fa-video-camera fs-1 m-3" aria-hidden="true"></i></button>
            <button className="text-docaration-none buttonTransparent" onClick={() => onStop()}><i class="fa fa-times-circle fs-1 m-3" aria-hidden="true"></i></button>   */}
            <br></br>
            <br></br> <br></br> <br></br> <br></br>
            <br></br> <br></br> <br></br> <br></br> <br></br>
          </div>
      </div>
     
          {/* <button onClick={() => createOffer()}>Create Offer</button>
          <button onClick={() => createAnswer()}>Create Answer</button> */}
          { showHideButtons()}
          <div>{status}</div>
          {/* <br></br>
          <button onClick={() => setRemoteDescription()}>Set Remote description</button>
          <button onClick={() => addCandidate()}>Add candidates</button> */}
          <br></br>
      <textarea ref={textRef}></textarea>
    </div>
  );
};

export default Dumy;