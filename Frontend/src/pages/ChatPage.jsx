import { SearchIcon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Spinner,
  Text,
  useColorMode,
  useColorModeValue,
  WrapItem,
} from "@chakra-ui/react";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";
import Follower from "../components/Follower";
import SearchChat from "../components/SearchChat";

const ChatPage = () => {
  // const [searchingUser, setsearchingUser] = useState(false);
  // const [searchText, setSearchText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const currentUser = useRecoilValue(userAtom);
  const [followers, setFollowers] = useState([]);
  const showToast = useShowToast();
  const { socket, onlineUsers } = useSocket();
  const { colorMode} = useColorMode();


  const getFollowers = async () => {
    try {
      setLoadingFollowers(true);
      const res = await fetch("/api/users/getFollowers");
      const data = await res.json();
      if (data.error) {
        setFollowers([]);
        return;
      }

      setFollowers(data);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoadingFollowers(false);
    }
  };

  useEffect(() => {
    socket?.on("messageSeen", ({ conversationId }) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === conversationId) {
            return {
              ...conversation,
              lastMessage: {
                ...conversation.lastMessage,
                seen: true,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });
  }, [socket, setConversations]);

  useEffect(() => {
    // console.log(selectedConversation);
    setSelectedConversation(false);

    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        setConversations(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingConversations(false);
      }
    };
    getConversations();
    getFollowers();
  }, [showToast, setConversations]);

  // const handleConversationSearch = async (e) => {
  //   e.preventDefault();
  //   if (!searchText) return;
  //   setsearchingUser(true);
  //   try {
  //     const res = await fetch(`/api/users/profile/${searchText}`);
  //     const searchedUser = await res.json();
  //     if (searchedUser.error) {
  //       showToast("Error", searchedUser.error, "error");
  //       return;
  //     }

  //     // if user try to search themself
  //     const messageYourself = searchedUser._id === currentUser._id;
  //     if (messageYourself) {
  //       showToast("Error", "You cannot message yourself", "error");
  //       return;
  //     }

  //     // if user is already in conversation
  //     const conversationAlreadyExists = conversations.find(
  //       (conversation) => conversation.participants[0]._id === searchedUser._id
  //     );
  //     if (conversationAlreadyExists) {
  //       setSelectedConversation({
  //         _id: conversationAlreadyExists._id,
  //         userID: searchedUser._id,
  //         username: searchedUser.username,
  //         userProfilePic: searchedUser.profilePic,
  //       });
  //       return;
  //     }

  //     const mockConversation = {
  //       mock: true,
  //       lastMessage: {
  //         text: "",
  //         sender: "",
  //       },
  //       _id: Date.now(),
  //       participants: [
  //         {
  //           _id: searchedUser._id,
  //           username: searchedUser.username,
  //           profilePic: searchedUser.profilePic,
  //         },
  //       ],
  //     };
  //     setConversations((prevConvs) => [...prevConvs, mockConversation]);
  //   } catch (error) {
  //     showToast("Error", error.message, "error");
  //   } finally {
  //     setsearchingUser(false);
  //   }
  // };

  return (
    <Box
      position={"absolute"}
      left={"50%"}
      w={{ base: "100%", md: "80%", lg: "70%" }}
      p={4}
      transform={"translateX(-50%)"}
    >
      <Flex
        gap={4}
        flexDirection={{ base: "column", md: "row" }}
        maxW={{ sm: "400px", md: "full" }}
        mx={"auto"}
      >
        <Flex
          flex={30}
          gap={2}
          flexDirection={"column"}
          maxW={{ sm: "250px", md: "full" }}
          mx={"auto"}
        >
          <Text
            fontSize={"lg"}
            fontWeight={700}
            color={useColorModeValue("gray.600", "gray.400")}
          >
            Chats
          </Text>
          {/* <form onSubmit={handleConversationSearch}>
            <Flex alignItems={"center"} gap={2}>
              <Input
                placeholder="Search for users"
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                size={"sm"}
                onClick={handleConversationSearch}
                isLoading={searchingUser}
              >
                <SearchIcon />
              </Button>
            </Flex>
          </form> */}
          <SearchChat followers={followers} />

          <Flex flexDirection={"row"} overflowX={"auto"} gap={1} w={"280px"}>
            {loadingFollowers && <Spinner />}
            {!loadingFollowers &&
              followers.map((follower) => (
                <Follower
                  isOnline={onlineUsers.includes(follower._id)}
                  key={"Follower::" + follower._id}
                  follower={follower}
                />
              ))}
          </Flex>
          {conversations.length !== 0 && (
            <Text
              fontSize={"md"}
              fontWeight={700}
              mt={1}
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Recents Chat
            </Text>
          )}
          {loadingConversations &&
            [0, 1, 2, 4, 5, 6].map((i) => (
              <Flex
                key={i}
                gap={4}
                alignItems={"center"}
                p={"1"}
                borderRadius={"md"}
              >
                <Box>
                  <SkeletonCircle size={"10"} />
                </Box>
                <Flex w={"full"} flexDirection={"column"} gap={3}>
                  <Skeleton h={"10px"} w={"80px"} />
                  <Skeleton h={"10px"} w={"90%"} />
                </Flex>
              </Flex>
            ))}
          {/* {!loadingConversations &&
            conversations.map((conversation) => (
              <Conversation
                isOnline={onlineUsers.includes(
                  conversation.participants[0]._id
                )}
                key={conversation._id}
                conversation={conversation}
              />
            ))} */}
          {!loadingConversations &&
            conversations.map((conversation) =>
              conversation && conversation.participants[0] ? (
                <Conversation
                  isOnline={onlineUsers.includes(
                    conversation.participants[0]._id
                  )}
                  key={conversation._id}
                  conversation={conversation}
                />
              ) : null
            )}
        </Flex>

        {!selectedConversation && (
          <Flex
            flex={70}
            borderRadius={"md"}
            p={2}
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"400px"}
          >
            <GiConversation size={100} />
            <Text fontSize={20}>Select a conversation to start messaging</Text>
          </Flex>
        )}

        <Box display={selectedConversation._id ? "block" : "none"} flex={70}>
          <MessageContainer />
        </Box>
      </Flex>
    </Box>
  );
};

export default ChatPage;
