import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ALINKS — Mini websites for Indian businesses",
    short_name: "ALINKS",
    description: "India-first mobile mini-website platform for salons, clinics, and shops.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf9f7",
    theme_color: "#5b21b6",
    icons: [
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}