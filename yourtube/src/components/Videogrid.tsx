import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const Videogrid = () => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);

  // Mock data for testing
  const mockVideos = [
    {
      _id: "1",
      videotitle: "Amazing Nature Documentary",
      filename: "nature-doc.mp4",
      filetype: "video/mp4",
      filepath: "/videos/nature-doc.mp4",
      filesize: "500MB",
      videochanel: "Nature Channel",
      Like: 1250,
      views: 45000,
      uploader: "nature_lover",
      createdAt: new Date().toISOString(),
      thumbnail: "https://picsum.photos/seed/nature/320/180"
    },
    {
      _id: "2",
      videotitle: "Cooking Tutorial: Perfect Pasta",
      filename: "pasta-tutorial.mp4",
      filetype: "video/mp4",
      filepath: "/videos/pasta-tutorial.mp4",
      filesize: "300MB",
      videochanel: "Chef's Kitchen",
      Like: 890,
      views: 23000,
      uploader: "chef_master",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      thumbnail: "https://picsum.photos/seed/cooking/320/180"
    },
    // Add more mock videos as needed
  ];

  useEffect(() => {
    const fetchvideo = async () => {
      try {
        // Try real API first
        const res = await axiosInstance.get("/video/getall");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setvideo(res.data);
        } else {
          // Fallback to mock data if API returns empty
          setvideo(mockVideos);
          console.log("Using mock data for development");
        }
      } catch (error) {
        console.log("API failed, using mock data:", error);
        setvideo(mockVideos); // Use mock data on error
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {loading ? (
        <>Loading...</>
      ) : videos.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <p>No videos available</p>
        </div>
      ) : (
        videos.map((video: any) => <Videocard key={video._id} video={video} />)
      )}
    </div>
  );
};

export default Videogrid;
