import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  const jwtToken = response.data.token;
  localStorage.setItem('jwtToken',jwtToken);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  const jwtToken = response.data.token;
  localStorage.setItem('jwtToken',jwtToken);
  return response.data;
};
export const logout = async () => {
  localStorage.removeItem('jwtToken');
sessionStorage.removeItem('jwtToken');
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const jwtToken = localStorage.getItem('jwtToken');
    const res = await axiosInstance.get("/auth/me",{headers:{Authorization: `Bearer ${jwtToken}`}, withCredentials:true});
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  console.log(userData);
  const jwtToken = localStorage.getItem('jwtToken');
  const response = await axiosInstance.post("/auth/update", userData);
  return response.data;
};

export async function getUserFriends() {
  const jwtToken = localStorage.getItem('jwtToken');
  const response = await axiosInstance.get("/users/friends",{headers:{Authorization: `Bearer ${jwtToken}`}, withCredentials:true});
  return response.data;
}


export async function getOutgoingFriendReqs() {
  const jwtToken = localStorage.getItem('jwtToken');
  const response = await axiosInstance.get("/users/outgoing-friend-requests",{headers:{Authorization: `Bearer ${jwtToken}`}, withCredentials:true});
  return response.data;
}

export async function sendFriendRequest(userId,myId) {
  const jwtToken = localStorage.getItem('jwtToken');
  const response = await axiosInstance.post(`/users/friend-request/${userId}`,myId);
  return response.data;
}

export async function getFriendRequests() {
  const jwtToken = localStorage.getItem('jwtToken');
  const response = await axiosInstance.get("/users/friend-requests",{headers:{Authorization: `Bearer ${jwtToken}`}, withCredentials:true});
  return response.data;
}
export async function findFriend(ref){
  const jwtToken = localStorage.getItem('jwtToken');
    const response = await axiosInstance.post("/users/find-friend",ref,{headers:{Authorization: `Bearer ${jwtToken}`}, withCredentials:true});
    console.log(response,response.data);
    return response.data;

}
export async function acceptFriendRequest(requestId) {
  const jwtToken = localStorage.getItem('jwtToken');
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`,{headers:{Authorization: `Bearer ${jwtToken}`}, withCredentials:true});
  return response.data;
}

export async function getStreamToken() {
  const jwtToken = localStorage.getItem('jwtToken');
  const response = await axiosInstance.get("/chat/token",{headers:{Authorization: `Bearer ${jwtToken}`}, withCredentials:true});
  return response.data;
}