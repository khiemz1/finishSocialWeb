import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  position,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import usePreviewImg from "../hooks/usePreviewImg";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { useParams } from "react-router-dom";
import { FaRegFileVideo } from "react-icons/fa";
import usePreviewVideo from "../hooks/usePreviewVideo";
import EmojiPicker from "emoji-picker-react";
import { FaRegSmile } from "react-icons/fa";

const MAX_CHAR = 500;

const CreatPost = () => {
  const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure();
  const [postText, setPostText] = useState("");
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const { handleVideoChange, videoUrl, setVideoUrl } = usePreviewVideo();
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR);
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const [loading, setloading] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const username = useParams();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleTextChange = (e) => {
    const inputText = e.target.value;

    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.substring(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChars(0);
    } else {
      setPostText(inputText);
      setRemainingChars(MAX_CHAR - inputText.length);
    }
  };

  const onEmojiClick = (emojiData, event) => {
    setPostText((prevText) => prevText + emojiData.emoji);
  };
  const handleCreatPost = async () => {
    if (!postText && !imgUrl && !videoUrl) {
      return;
    }
    setloading(true);
    try {
      const res = await fetch("api/posts/creat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postedBy: user._id,
          text: postText,
          img: imgUrl,
          video: videoUrl,
        }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Post created successfully!", "success");
      if (username.username === user.username) {
        setPosts([data, ...posts]);
      }

      onClose();
      setPostText("");
      setImgUrl("");
      setVideoUrl("");
    } catch (error) {
      showToast("Error", error, "error");
      console.log(error);
    } finally {
      setloading(false);
    }
  };
  const onClose = () => {
    setPostText("");
    setImgUrl("");
    setVideoUrl("");
    setRemainingChars(MAX_CHAR);
    originalOnClose(); // Call the original onClose function
  };
  const handleClickOutside = (event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  if (username.username === user.username) {
    return (
      <>
        <Button
          position={"fixed"}
          bottom={10}
          right={5}
          bg={useColorModeValue("gray.300", "gray.dark")}
          onClick={onOpen}
          size={{ base: "sm", sm: "md" }}
        >
          <AddIcon />
        </Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />

          <ModalContent>
            <ModalHeader>Creat Post</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <Textarea
                  placeholder="Post content goes here"
                  onChange={handleTextChange}
                  value={postText}
                />
                <Text
                  fontSize={"sm"}
                  fontWeight={"bold"}
                  textAlign={"right"}
                  m={"1"}
                  color={"gray.800"}
                >
                  {remainingChars}/{MAX_CHAR}
                </Text>

                <Input
                  type="file"
                  hidden
                  ref={imageRef}
                  onChange={handleImageChange}
                />

                <Flex flexDirection={"row"}>
                  {!imgUrl && !videoUrl && (
                    <BsFillImageFill
                      style={{ marginLeft: "5px", cursor: "pointer" }}
                      size={28}
                      onClick={() => imageRef.current.click()}
                    />
                  )}
                  <Input
                    type="file"
                    hidden
                    ref={videoRef}
                    onChange={handleVideoChange}
                  />

                  {!imgUrl && !videoUrl && (
                    <FaRegFileVideo
                      style={{ marginLeft: "10px", cursor: "pointer" }}
                      size={26}
                      onClick={() => videoRef.current.click()}
                    />
                  )}
                  <FaRegSmile
                    style={{ marginLeft: "10px", marginBottom:"10px", cursor: "pointer" }}
                    size={26}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  />
                </Flex>

                {showEmojiPicker && (
                  <div style={{marginTop: "20px", position: "absolute", zIndex: "1000" }} ref={emojiPickerRef}>
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                )}
              </FormControl>

              {imgUrl && (
                <Flex mt={"s"} w={"full"} position={"relative"}>
                  <Image src={imgUrl} alt="Selected image" />
                  <CloseButton
                    onClick={() => setImgUrl("")}
                    bg={"gray.800"}
                    position={"absolute"}
                    top={2}
                    right={2}
                  />
                </Flex>
              )}
              {videoUrl && (
                <Flex mt={"s"} w={"full"} position={"relative"}>
                  <video
                    src={videoUrl}
                    alt="Selected video"
                    controls
                    style={{
                      width: "100%",
                    height: "auto",
                    maxHeight: "300px",
                    objectFit: "contain",
                    }}
                  />
                  <CloseButton
                    onClick={() => setVideoUrl("")}
                    bg={"gray.800"}
                    position={"absolute"}
                    top={2}
                    right={2}
                  />
                </Flex>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={handleCreatPost}
                isLoading={loading}
              >
                Post
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }
};

export default CreatPost;
