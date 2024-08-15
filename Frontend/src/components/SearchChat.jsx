import { SearchIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Input,
  Box,
  Text,
  InputRightElement,
  InputGroup,
  WrapItem,
  Avatar,
  AvatarBadge,
  Spinner,
  Image,
  useColorMode,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import useShowToast from "../hooks/useShowToast";
import { Link, Link as RouterLink } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useRecoilState } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";

const SearchChat = ({ followers }) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { onlineUsers } = useSocket();
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const colorMode = useColorMode();
  const [conversations, setConversations] = useRecoilState(conversationsAtom);

  useEffect(() => {
    if (searchText === "") {
      setSearchResults([]);
    } else {
      setLoading(true);

      const lowercasedSearchText = searchText.toLowerCase();
      const filteredResults = followers.filter(
        (follower) =>
          follower.name.toLowerCase().includes(lowercasedSearchText) ||
          follower.username.toLowerCase().includes(lowercasedSearchText)
      );

      setSearchResults(filteredResults);
      setLoading(false);
    }
  }, [searchText, followers]);

  return (
    <Flex direction="column" alignItems="center">
      <form>
        <Flex alignItems={"center"} w={"290px"} m={"auto"}>
          <InputGroup>
            <Input
            id="search"
              placeholder="Search for users"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <InputRightElement>
              <Button size="sm" variant="ghost" isLoading={loading}>
                <SearchIcon />
              </Button>
            </InputRightElement>
          </InputGroup>
        </Flex>
      </form>

      {loading && <Spinner />}
      {!loading && searchText.length > 0 && (
        <Flex
          direction="column"
          alignItems="left"
          w={" 290px"}
          maxH={"290px"}
          overflowY={"scroll"}
          position={"absolute"}
          mt={10}
          zIndex={9999}
          bg={"rgba(16, 16, 16)"}
        >
          {searchResults.length > 0 ? (
            searchResults.map((user, index) => (
              <WrapItem
                flexDirection={"row"}
                key={user._id}
                alignItems="left"
                borderTop={index > 0 ? "1px solid gray" : "none"}
                width="90%"
                m={2}
                cursor={"pointer"}
                onClick={() => {
                  document.getElementById("search").value = "";
                  setSearchText("");
                  // if user is already in conversation
                  const conversationAlreadyExists = conversations.find(
                    (conversation) =>
                      conversation.participants[0]._id === user._id
                  );
                  if (conversationAlreadyExists) {
                    setSelectedConversation({
                      _id: conversationAlreadyExists._id,
                      userID: user._id,
                      username: user.username,
                      userProfilePic: user.profilePic,
                      mock: conversationAlreadyExists.mock,
                    });
                    return;
                  }
                  const mockConversation = {
                    mock: true,
                    lastMessage: {
                      text: "",
                      sender: "",
                    },
                    _id: Date.now(),
                    participants: [
                      {
                        _id: user._id,
                        username: user.username,
                        profilePic: user.profilePic,
                      },
                    ],
                  };
                  setConversations((prevConvs) => [
                    ...prevConvs,
                    mockConversation,
                  ]);
                  setSelectedConversation({
                    _id: user._id,
                    userID: user._id,
                    userProfilePic: user.profilePic,
                    username: user.username,
                    mock: true,
                  });
                  
                }}
              >
                <Avatar
                  size={"md"}
                  src={user.profilePic}
                  mt={3}
                  cursor={"pointer"}
                >
                  {onlineUsers.includes(user._id) ? (
                    <AvatarBadge boxSize="1em" bg="green.500" />
                  ) : (
                    ""
                  )}
                </Avatar>
                <Box flexDirection={"column"} mt={2} ml={2}>
                  <Flex alignItems="center">
                    <Text mr={2}>{user.username}</Text>{" "}
                    <Image src="/verified.png" boxSize="15px" />
                  </Flex>

                  <Text fontSize={"sm"} color={"gray.light"}>
                    {user.name}
                  </Text>
                </Box>
              </WrapItem>
            ))
          ) : (
            <Text mt={4}>No results found</Text>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default SearchChat;
