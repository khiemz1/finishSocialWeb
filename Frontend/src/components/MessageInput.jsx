import {
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import useShowToast from "../hooks/useShowToast";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { BsFillImageFill } from "react-icons/bs";
import usePreviewImg from "../hooks/usePreviewImg";
import { FaRegFileVideo } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { FaRegSmile } from "react-icons/fa";
import usePreviewVideo from "../hooks/usePreviewVideo";
import { HiGif } from "react-icons/hi2";


const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const showToast = useShowToast();
  const { handleVideoChange, videoUrl, setVideoUrl } = usePreviewVideo();
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const setConversations = useSetRecoilState(conversationsAtom);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { onClose } = useDisclosure();

  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imgUrl && !videoUrl) return;
    if (isSending) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedConversation.userID,
          img: imgUrl,
          video: videoUrl,
        }),
      });
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      setMessages((messages) => [...messages, data]);

      setConversations((prevConvs) => {
        const updatedConversations = prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            if (conversation.mock) {
              return {
                ...conversation,
                lastMessage: {
                  text: data.text,
                  sender: data.sender,
                  img: data.img,
                  video: data.video,
                  seen: data.seen,
                },
                _id: data.conversationId,
                mock: false,
              };
            }
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
                img: data.img,
                video: data.video,
                seen: data.seen,
              },
            };
          }
          return conversation;
        });

        // Move updated conversation to the top
        const selectedConvIndex = updatedConversations.findIndex(
          (conv) => conv._id === selectedConversation._id
        );

        if (selectedConvIndex !== -1) {
          const [selectedConv] = updatedConversations.splice(
            selectedConvIndex,
            1
          );
          updatedConversations.unshift(selectedConv);
        }

        return updatedConversations;
      });

      setMessageText("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
      setImgUrl("");
      setVideoUrl("");
    }
  };

  const onEmojiClick = (emojiData, event) => {
    setMessageText((prevText) => prevText + emojiData.emoji);
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

  return (
    <Flex gap={2} alignItems={"center"}>
      <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
        <InputGroup>
          <Input
            w={"full"}
            placeholder="Type a message"
            onChange={(e) => setMessageText(e.target.value)}
            value={messageText}
          />
          <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
            <IoSendSharp />
          </InputRightElement>
        </InputGroup>
      </form>
      <Flex flex={5} cursor={"pointer"} m={"auto"}>
        <BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
        <Input
          type={"file"}
          hidden
          ref={imageRef}
          onChange={handleImageChange}
        />
        <FaRegFileVideo
          style={{ marginLeft: "10px", cursor: "pointer" }}
          size={20}
          onClick={() => videoRef.current.click()}
        />
        <Input type="file" hidden ref={videoRef} onChange={handleVideoChange} />
        <FaRegSmile
          style={{ marginLeft: "5px", cursor: "pointer" }}
          size={22}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        />
        {showEmojiPicker && (
          <div
            style={{
              right: "10px",
              top: "50px",
              position: "absolute",
              zIndex: "1000",
            }}
            ref={emojiPickerRef}
          >
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
        {/* <HiGif style={{ marginLeft: "5px", cursor: "pointer" }} size={22} /> */}
       
      </Flex>
      <Modal
        isOpen={imgUrl || videoUrl}
        onClose={() => {
          onClose();
          setImgUrl("");
          setVideoUrl("");
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mt={5} w={"full"}>
              {imgUrl && <Image src={imgUrl} />}
              {videoUrl && (
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
              )}
            </Flex>
            <Flex justifyContent={"flex-end"} my={2}>
              {!isSending ? (
                <IoSendSharp
                  size={24}
                  cursor={"pointer"}
                  onClick={handleSendMessage}
                />
              ) : (
                <Spinner size={"md"} />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MessageInput;
