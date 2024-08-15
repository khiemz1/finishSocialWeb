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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import useShowToast from "../hooks/useShowToast";
import { Link, Link as RouterLink } from "react-router-dom";


const SearchPage = () => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useShowToast();

  const getSearchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users/search/" + searchText);
      const data = await res.json();
      if (data.error) {
        setSearchResults([]);
        return;
      }

      setSearchResults(data);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchText === "") {
      setSearchResults([]);
    } else {
      getSearchData();
    }
  }, [searchText]);

  return (
    <Flex direction="column" alignItems="center">
      <form>
        <Flex alignItems={"center"} gap={1} w={"400px"} m={"auto"}>
          <InputGroup>
            <Input
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
          w={" 400px"}
          maxH={"400px"}
          overflowY={"scroll"}
          mt={2}
        >
          {searchResults.length > 0 ? (
            searchResults.map((user, index) => (
              <Link as ={RouterLink} to={`/${user.username}`}
              key={"searchItem::" + user._id}
              >
                <WrapItem
                  flexDirection={"row"}
                  alignItems="left"
                  borderTop={index > 0 ? "1px solid gray" : "none"}
                  width="96%"
                  m={2}
                >
                  <Avatar
                    size={"md"}
                    src={user.profilePic}
                    mt={3}
                    cursor={"pointer"}
                  />
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
              </Link>
            ))
          ) : (
            <Text mt={4}>No results found</Text>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default SearchPage;
