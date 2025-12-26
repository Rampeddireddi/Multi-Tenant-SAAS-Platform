import axios from 'axios';
const api=axios.create({
    baseURL:'http://localhost:5000/api'
});
api.interceptors.request.use((req)=>{
const token=localStorage.getItem('token');
if(token){
    req.headers.Authorization=`Bearer ${token}`;
}
return req;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      toast.error("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "/";
    }

    if (status === 403) {
      toast.error("You are not authorized to perform this action");
    }

    return Promise.reject(error);
  }
);

export default api;
