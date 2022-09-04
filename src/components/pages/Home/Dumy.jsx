import React, { useEffect } from 'react';
import { useRef } from 'react';



const OpenCamers = () =>{
    const videoRef = useRef(null);

    useEffect(() => {
      getVideo();
    }, [videoRef]);
  
    const getVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 300 } })
        .then(stream => {
          let video = videoRef.current;
          video.srcObject = stream;
          video.play();
        })
        .catch(err => {
          console.error("error:", err);
        });
    };
  

    function onStop(){
        videoRef.current.destroy()
    }



    return (
      <div>
        <div>
          <button>Take a photo</button>
          <video ref={videoRef} />
        </div>
      </div>
    );
  };
  


export default OpenCamers