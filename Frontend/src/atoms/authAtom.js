import { atom } from "recoil";

const authScreenAtom = atom({
    key: "authScreenAtom",
    default: JSON.parse(localStorage.getItem("user-threads")),
});

export default authScreenAtom;