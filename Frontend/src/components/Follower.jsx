import {
  Avatar,
  AvatarBadge,
  Text,
  useColorMode,
  WrapItem,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";

const Follower = ({ follower, isOnline }) => {
  const user = follower;
  const currentUser = useRecoilValue(userAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const colorMode = useColorMode();
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const startCoversation = () => {
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
    setConversations((prevConvs) => [...prevConvs, mockConversation]);
    setSelectedConversation({
      _id: mockConversation._id,
      userID: user._id,
      userProfilePic: user.profilePic,
      username: user.username,
      mock: true,
    });
    console.log(selectedConversation);
  };
  return (
    <WrapItem flexDirection={"column"} key={"followerItem::" + follower._id}>
      <Avatar
        size={{
          base: "xs",
          sm: "sm",
          md: "md",
        }}
        src={follower.profilePic}
        m={1}
        cursor={"pointer"}
        onClick={startCoversation}
      >
        {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
      </Avatar>
      <Text m={"auto"}>{user.username}</Text>
    </WrapItem>
  );
};

export default Follower;
