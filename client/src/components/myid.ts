import axios from "axios";
import { createContext } from "react";
let id: number;
axios.get("/api/users/me", {
    withCredentials: true,
}).then((res)=> {
   id  = res.data.id
});
export const uid = createContext<any>(id!);
