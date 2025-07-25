import axios from "axios";
export const axiosInstance = axios.create({
   baseURL:" https://quickchat-server-gzrh.onrender.com/api",
   withCredentials:true // to send cookies
})