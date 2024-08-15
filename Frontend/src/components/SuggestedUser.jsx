import { Avatar, Box, Button, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'
import useFollowUnfollow from '../hooks/useFollowUnfollow';

const SuggestedUser = ({user}) => {
  const {handleFollowUnfollow, following, updating} = useFollowUnfollow(user);
    
  return (
    <>
    <Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
			{/* left side */}
			<Flex gap={2} as={Link} to={user.username}>
				<Avatar src={user.profilePic} />
				<Box>
					<Text fontSize={"sm"} fontWeight={"bold"}>
                        {user.name}
					</Text>
					<Text  color={"gray.light"} fontSize={"sm"} mr={3}>
                        @{user.username}
					</Text>
				</Box>
			</Flex>
			{/* right side */}
			<Button
				size={"sm"}
				w={"70px"}
				color={following ? "black" : "white"}
				bg={following ? "white" : "blue.400"}
				onClick={handleFollowUnfollow}
				isLoading={updating}
				_hover={{
					color: following ? "black" : "white",
					opacity: ".8",
				}}
			>
				{following ? "Unfollow" : "Follow"}
			</Button>
		</Flex>
    </>
  )
}

export default SuggestedUser