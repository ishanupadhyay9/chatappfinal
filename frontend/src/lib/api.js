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
   localStorage.setItem('jwtToken','');
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
  const response = await axiosInstance.post("/auth/update", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}


export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}
export async function findFriend(ref){
    const response = await axiosInstance.post("/users/find-friend",ref);
    console.log(response,response.data);
    return response.data;

}
export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}