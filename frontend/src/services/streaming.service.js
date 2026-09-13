import axios from "axios";
import { STREAMING_API_URL, STREAMING_PUBLIC_URL } from "../config/env";

const streamingApi = axios.create({
  baseURL: STREAMING_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

streamingApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

streamingApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
const buildPlaybackUrl = (value) => {
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/api/streaming/")) {
    return `${window.location.origin}${value}`;
  }

  if (value.startsWith("/stream/")) {
    return `${window.location.origin}/api/streaming${value}`;
  }

  return `${window.location.origin}/api/streaming/${value.replace(/^\/+/, "")}`;
};

export const streamingService = {
  async getFeaturedVideos() {
    const { data } = await streamingApi.get("/videos/featured");
    return data.videos || [];
  },

  async getVideos(params = {}) {
    const { data } = await streamingApi.get("/videos", { params });
    return data.videos || [];
  },

  async getVideoDetails(videoId) {
    const { data } = await streamingApi.get(`/videos/${videoId}`);
    return data.video;
  },

  getPlaybackUrl(videoOrPath) {
    if (!videoOrPath) return "";

    if (typeof videoOrPath === "string") {
      if (
        videoOrPath.startsWith("http://") ||
        videoOrPath.startsWith("https://")
      ) {
        return videoOrPath;
      }

      return buildPlaybackUrl(videoOrPath);
    }

    if (videoOrPath.streamUrl) {
      return videoOrPath.streamUrl;
    }

    if (videoOrPath.streamPath) {
      return buildPlaybackUrl(videoOrPath.streamPath);
    }

    return `${window.location.origin}/api/streaming/stream/${videoOrPath._id}`;
  },
};
