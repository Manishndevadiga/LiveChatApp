import axios from "axios";

const API_URL = "http://localhost:4000/api";

const callApi = async (path:any, method = "GET", data = {}) => {
  try {
    const config = {
      withCredentials: true,
    };

    let response;

    console.log("API Call:", method, `${API_URL}${path}`, data);

    switch (method) {
      case "POST":
        response = await axios.post(
          `${API_URL}${path}`,
          data,
          config
        );
        break;

      case "PUT":
        response = await axios.put(
          `${API_URL}${path}`,
          data,
          config
        );
        break;

      case "DELETE":
        response = await axios.delete(
          `${API_URL}${path}`,
          config
        );
        break;

      case "GET":
      default:
        response = await axios.get(
          `${API_URL}${path}`,
          {
            ...config,
            params: data,
          }
        );
        break;
    }

     console.log("test:", response);

     return response?.data;


  } catch (error:any) {
    console.error("API Error:", error);

    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Something went wrong",
    };
  }
};

export default callApi;