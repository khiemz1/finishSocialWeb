import { Avatar, Divider, Flex, Text } from "@chakra-ui/react";
import CommentAction from "./commentAction";
import { formatDistanceToNow } from "date-fns";

const Comment = ({ reply, lastReply }) => {
  console.log(reply);

  return (
    <>
      <Flex gap={4} py={2} my={2} w={"full"}>
        <Avatar src={reply.userProfilePic} size={"sm"} />
        <Flex gap={1} w={"full"} flexDirection={"column"}>
          <Flex
            w={"full"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {reply.username}
            </Text>
            <Text
          fontSize={"xs"}
          width={36}
          textAlign={"right"}
          color={"gray.light"}
          ml={"auto"}
        >
          {formatDistanceToNow(new Date(reply.updatedAt))} ago
        </Text>
          </Flex>
          <Text>{reply.text}</Text>
        </Flex>
      </Flex>
      <Flex ml={7}>
        <CommentAction />
      </Flex>
      {lastReply ? <Divider /> : null}
    </>
  );
};

export default Comment;
