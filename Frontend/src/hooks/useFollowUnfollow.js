import React, { useState } from 'react'
import useShowToast from './useShowToast';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

const useFollowUnfollow = (user) => {
    const currentUser = useRecoilValue(userAtom);
    const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
    const [updating, setUpdating] = useState(false);
    const showToast = useShowToast();
    const [followersNumber, setFollowersNumber] = useState(user.followers.length);
    const [followingNumber, setFollowingNumber] = useState(user.following.length);
    const handleFollowUnfollow = async () => {
        if (!currentUser) {
          showToast("Error", "You must be logged in to follow", "error");
          return;
        }
        if (updating) return;
        setUpdating(true);
        try {
          const res = await fetch(`/api/users/follow/${user._id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
        })
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        // console.log(data.message);
        setFollowing(!following);
        showToast("Success", data.message, "success");
        console.log(data);
        setFollowersNumber(data.followersNumber);
        setFollowingNumber(data.followingNumber);
        } catch (error) {
          showToast("Error", error, "error");
        } finally {
          setUpdating(false);
        }
      }

    return {handleFollowUnfollow, updating, following, followersNumber, followingNumber}

}

export default useFollowUnfollow