import React, { useEffect, useState } from "react";
import { useRef } from 'react';
import socketIOClient from "socket.io-client";
import CallBackground from "../../../assets/img/call-background.jpg";
import Calling from '../../../assets/audio/calling.mp3'
import Incoming from '../../../assets/audio/incoming.mp3'

// const ENDPOINT = `http://${window.location.hostname}:4001`;
const ENDPOINT = "https://pvc-server.herokuapp.com/"

const Home = () => {

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const textRef = useRef()


  const callingAudio = new Audio(Calling)
  const incomingAudio = new Audio(Incoming)
  callingAudio.loop = true
  incomingAudio.loop = true

  // const candidates = useRef([])

  const [Microphone, setMicrophone] = useState(true)
  const [Video, setVideo] = useState(true)

  const [offerVisible, setOfferVisible] = useState(true)
  const [answerVisible, setAnswerVisible] = useState(false)
  const [status, setStatus] = useState("Click on call button to make a call")
  const [cancel, setCancel] = useState(false)
  
  const _pc = new RTCPeerConnection(null)
  const pc = useRef(new RTCPeerConnection(null))
  const socket = socketIOClient(ENDPOINT);


  useEffect(() => {
    const constraints = {
      audio: true,
      video: true,
    }
    // console.log("@data",  constraints)

    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      //display video
      // console.log("@data", stream)
   localVideoRef.current.srcObject = stream

   stream.getTracks().forEach(track => {
    _pc.addTrack(track, stream)
   })
    })
    .catch(e => {
      console.log('getUsermedia Error: ', e)
    })

    //Printing the sdp get from the server
    socket.on('sdp', data => {
      console.log(data)
      pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
      textRef.current.value = JSON.stringify(data.sdp)

      if(data.sdp.type === 'offer'){
        setOfferVisible(false)
        setAnswerVisible(true)
        setStatus('Incoming call ...')
        incomingAudio.loop = true
        incomingAudio.play()
      }
      else{
        incomingAudio.loop=false
        incomingAudio.pause()
        callingAudio.loop=false
        callingAudio.pause()
        setStatus('Congratulation your are connected successfully')
     
      }

    })

    socket.on('candidate', candidate => {
      console.log(candidate)
     // candidates.current = [...candidates.current, candidate]
      pc.current.addIceCandidate(new RTCIceCandidate(candidate))
    })

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
      setCancel(true)
      callingAudio.loop = true
      callingAudio.play()
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
      setCancel(true)
      incomingAudio.loop=false
      incomingAudio.pause()
      callingAudio.loop=false
      callingAudio.pause()
      setStatus('Congratulation your are connected successfully')
    }).catch(e => console.log(e))
  }

const showHideButtons = () => {
  if(offerVisible){
    return(
      <>
        <button className="text-docaration-none buttonTransparent" onClick={() => createOffer()}><i class="fa fa-phone fs-1 m-3" aria-hidden="true"></i></button>
      </>
    )
  }
  else if(answerVisible) {
    return(
      <button className="text-docaration-none buttonTransparent" onClick={() => createAnswer()}><i class="fa fa-phone fs-1 m-3 text-success"  aria-hidden="true"></i></button>
    )
  }
}
  function onStop(){
    alert('here')
    socket.emit('disconnect')
    localVideoRef.current.destroy()
  }


  const DisableMicrophone = () => {
    setMicrophone(!Microphone)
    localVideoRef.current.srcObject.getAudioTracks().forEach(track => track.enabled = !track.enabled);

  }

  const DisableVideo = () => {
    setVideo(!Video)
    localVideoRef.current.srcObject.getVideoTracks().forEach(track => track.enabled = !track.enabled);
  }

  // function disableVideo(){
  //   let stream = localVideoRef.current.srcObject 
  //   const tracks = stream.getTracks();

  // tracks.forEach((track) => {
  //   track.stop();
  // });
  // localVideoRef.current.srcObject = null;
  // }

  return (
    <div className="container-fluid m-0 p-0">
           {/* <div className="alert alert-dark alert-dismissible fade show m-0 text-center" role="alert">
         <h5><b>{status}</b></h5>
         <button type="button" class="btn-small btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div> */}
     <div className="row d-flex row align-items-center bg-dark">
     <div className="col-sm-6">
     <video className="fullHeight" ref={localVideoRef}  autoPlay/>
     </div>
      <div className="col-sm-6">
      <video className="fullHeight" ref={remoteVideoRef}  autoPlay/>
      </div>
     </div>
          <div className="d-flex align-items-center justify-content-center">   
          <button className="text-docaration-none buttonTransparent" onClick={() => DisableMicrophone()}> <i className={`${Microphone ? 'fa fa-microphone' : 'fas fa-microphone-slash text-danger'} fs-1 m-3`} aria-hidden="true"></i></button>
          <button className="text-docaration-none buttonTransparent" onClick={()=> DisableVideo()}> <i className={`${Video ? 'fas fa-video' : 'fas fa-video-slash text-danger'} fs-1 m-3`} aria-hidden="true"></i></button>
          { showHideButtons()}
         {cancel ?  <button className="text-docaration-none buttonTransparent text-danger" onClick={() => onStop()}><i class="fa fa-times-circle fs-1 m-3" aria-hidden="true"></i></button> : null}
          </div>
      <textarea className="d-none" ref={textRef}></textarea>
    </div>
  );
};

export default Home;
