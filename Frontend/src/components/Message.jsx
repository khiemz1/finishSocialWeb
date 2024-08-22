import { Avatar, Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";

const Message = ({ ownMessage, message }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={"flex-end"}>
          {message.text && (
            <Flex bg={"green.800"} p={1} borderRadius={"md"}>
              <Text color={"white"} maxW={"200px"} pr={2}>
                {message.text}
              </Text>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
          {message.img && !imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="Message image"
                borderRadius={4}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {message.img && imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image src={message.img} alt="Message image" borderRadius={4} />
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
          {message.video && !videoLoading && (
            <Flex mt={5} w={"200px"}>
              <video
                src={message.video}
                alt="Selected video"
                controls
                onLoadedMetadata={() => setVideoLoading(true)}
                style={{
                  width: "50%",
                  maxHeight: "200px",
                  objectFit: "cover",
                  marginLeft: "auto",
                }}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {message.video && videoLoading && (
            <Flex mt={5} w={"300px"}>
              <video
                src={message.video}
                alt="Selected video"
                controls
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
              />
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}

          <Avatar src={user.profilePic} w="7" h={7} />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar src={selectedConversation.userProfilePic} w="7" h={7} />

          {message.text && (
            <Text
              maxW={"200px"}
              p={1}
              bg={"gray.400"}
              borderRadius={"md"}
              color={"black"}
            >
              {message.text}
            </Text>
          )}
          {message.img && !imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="Message image"
                borderRadius={4}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {message.img && imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image src={message.img} alt="Message image" borderRadius={4} />
            </Flex>
          )}
          {message.video && !videoLoading && (
            <Flex mt={5} w={"300px"}>
              <video
                src={message.video}
                alt="Selected video"
                controls
                onLoadedMetadata={() => setVideoLoading(true)}
                style={{
                  width: "50%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  marginRight: "auto",
                }}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {message.video && videoLoading && (
            <Flex mt={5} w={"300px"}>
              <video
                src={message.video}
                alt="Selected video"
                controls
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
              />
            </Flex>
          )}
        </Flex>
      )}
    </>
  );
};

export default Message;
