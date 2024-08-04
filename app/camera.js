import React, { useState, useRef } from "react";
import { Camera } from "react-camera-pro";
import { uploadPhoto } from './page.js'; 

const CameraComponent = () => {
  const camera = useRef(null);
  const [image, setImage] = useState(null);

  const handleTakePhoto = async () => {
    const photo = camera.current.takePhoto();
    setImage(photo);

    const url = await uploadPhoto(photo);
    console.log('Uploaded photo URL:', url);
  };

  return (
    <div>
      <Camera ref={camera} />
      <button onClick={handleTakePhoto}>Take photo</button>
      {image && <img src={image} alt='Taken photo'/>}
    </div>
  );
};

export default CameraComponent;

