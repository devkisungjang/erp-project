import axios from "axios";

const headers = {
  "Content-Type": "application/json;charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  Authorization: null,
  "Refresh-Token": null,
};

const instance = axios.create({
  baseURL: `${process.env.REACT_APP_LOCAL_SERVER}`, // 예: http://localhost:4000
  headers,
});

export default instance;
