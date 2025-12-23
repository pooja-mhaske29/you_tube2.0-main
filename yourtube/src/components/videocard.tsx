"use client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function VideoCard({ video }: any) {
  // Get backend URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // Get thumbnail URL - if thumbnail exists, use it, otherwise use default
  const getThumbnailUrl = () => {
    if (video?.thumbnail) {
      // If thumbnail is already a full URL
      if (video.thumbnail.startsWith('http')) {
        return video.thumbnail;
      }
      // If thumbnail is a relative path
      return `${backendUrl}${video.thumbnail}`;
    }
    
    // Default thumbnail
    return `${backendUrl}/uploads/thumbnails/default.jpg`;
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <Link href={`/watch/${video?._id || '1'}`} className="group block">
      <div className="space-y-3">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={thumbnailUrl} 
            alt={video.videotitle || 'Video thumbnail'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // If thumbnail fails to load, use a fallback
              e.currentTarget.src = `https://via.placeholder.com/320x180/3B82F6/FFFFFF?text=${encodeURIComponent(video.videotitle?.substring(0, 20) || 'Video')}`;
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
            10:24
          </div>
        </div>
        
        {/* Video Info */}
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
            {video?.videochanel?.[0]?.toUpperCase() || 'Y'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {video?.videotitle || 'Untitled Video'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {video?.videochanel || 'Unknown Channel'}
            </p>
            <p className="text-sm text-gray-600">
              {video?.views?.toLocaleString() || '0'} views •{" "}
              {video?.createdAt 
                ? formatDistanceToNow(new Date(video.createdAt)) + ' ago'
                : 'Recently'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}