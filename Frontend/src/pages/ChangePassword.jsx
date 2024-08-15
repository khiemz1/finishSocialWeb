import React from 'react'
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    useColorModeValue,
    Avatar,
    Center,
  } from "@chakra-ui/react";
  import { useRef, useState } from "react";
  import { useRecoilState } from "recoil";
  import userAtom from "../atoms/userAtom";
  import usePreviewImg from "../hooks/usePreviewImg";
  import useShowToast from "../hooks/useShowToast";
  import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const showToast = useShowToast();
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userAtom);
  const [input, setInput] = useState({});
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.newPassword || !input.confirmPassword || !input.currentPassword) {
        showToast("Error", "All fields are required", "error");
        return;
    }
    if (input.newPassword !== input.confirmPassword) {
      showToast("Error", "New password and confirm password do not match!!", "error");
      return;
    }
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      setUser(data.user);
      localStorage.setItem("user-threads", JSON.stringify(data.user));
      showToast("Success", data.message, "success");
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setUpdating(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <Flex align={"center"} justify={"center"} my={6}>
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          bg={useColorModeValue("white", "gray.dark")}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
        >
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }} m={"auto"}>
            Change Your Password
          </Heading>
          <FormControl id="current-password">
            <FormLabel>Current Password</FormLabel>
            <Input
              type="password"
              name="currentPassword"
              onChange={(e) =>
                setInput( {...input, currentPassword : e.target.value})
              }
            />
          </FormControl>
          <FormControl id="New-password">
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              name="newPassword"
              onChange={(e) =>
                setInput( {...input, newPassword : e.target.value})
              }/>
          </FormControl>
          <FormControl id="confirm-password">
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              onChange={(e) =>
                setInput( {...input, confirmPassword : e.target.value})
              }/>
          </FormControl>
          <Stack spacing={6} direction={["column", "row"]}>
            <Button
              bg={"red.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "red.500",
              }}

              onClick={() => navigate("/"+ user.username)}
            >
              Back
            </Button>
            <Button
              bg={" green.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "green.500",
              }}
              type="submit"
              isLoading={updating}
            >
              Confirm
            </Button>
          </Stack>
        </Stack>
      </Flex>
      </form>
  )
}

export default ChangePassword