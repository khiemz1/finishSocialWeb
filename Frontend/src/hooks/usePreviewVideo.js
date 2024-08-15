import { useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewVideo = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const showToast = useShowToast();

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setVideoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      showToast("Invalid file type", "Please select a video file", "error");
      setVideoUrl(null);
    }
  };

  return { handleVideoChange, videoUrl, setVideoUrl };
};

export default usePreviewVideo;