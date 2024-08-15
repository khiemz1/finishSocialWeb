import React from 'react'
import SignupCard from '../components/SignupCard'
import LoginCard from '../components/LoginCard.jsx'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import  authScreenAtom  from '../atoms/authAtom.js'

const AuthPage = () => {
  const authScreenState = useRecoilValue(authScreenAtom);
  return (
    <>
        {authScreenState === "signup" ? <SignupCard /> : <LoginCard />}
    </>
  )
}

export default AuthPage