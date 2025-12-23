import { Bell, Menu, Mic, Search, User, VideoIcon, PlusCircle, Loader2, LogOut } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { toast } from "sonner";

const Header = () => {
  const { user, logout, handlegooglesignin, loading: authLoading, authError } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const router = useRouter();
  
  // Debug: Check user state
  useEffect(() => {
    console.log("Header - Auth loading:", authLoading);
    console.log("Header - User:", user);
  }, [user, authLoading]);

  // Show auth errors as toast notifications
  useEffect(() => {
    if (authError) {
      console.error("Header - Auth error detected:", authError);
      toast.error(`Authentication Error: ${authError}`, {
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => handleSignIn(),
        },
      });
    }
  }, [authError]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as React.FormEvent);
    }
  };
  
  const handleCreateChannel = () => {
    if (!user) {
      toast.error("Please sign in first");
      handleSignIn();
      return;
    }
    setisdialogeopen(true);
  };
  
  const handleChannelCreated = (newChannelData: any) => {
    toast.success("Channel created successfully!");
    console.log("Channel created data:", newChannelData);
    
    // Reload to get updated user from backend
    setTimeout(() => {
      router.reload();
    }, 1000);
  };
  
  const handleChannelError = (error: any) => {
    console.error("Channel creation error:", error);
    toast.error(error.message || "Failed to create channel");
  };

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setShowAccountSelector(true);
      console.log("Sign in clicked - forcing account selection");
      await handlegooglesignin();
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (!error.message?.includes("cancelled")) {
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setIsSigningIn(false);
      setShowAccountSelector(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out successfully!");
      // Clear any cached credentials
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  // Show loading state during initial auth check
  if (authLoading) {
    return (
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b w-full">
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-1">
            <div className="bg-red-600 p-1 rounded">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 max-w-2xl mx-4 min-w-[400px]">
          <div className="flex items-center gap-2">
            <div className="flex flex-1">
              <div className="flex-1 h-10 bg-gray-200 rounded-l-full animate-pulse"></div>
              <div className="w-16 h-10 bg-gray-200 rounded-r-full animate-pulse"></div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>
    );
  }

  // Show auth configuration error message
  if (authError && authError.includes("not configured")) {
    return (
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b w-full min-w-[1200px]">
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Menu className="w-6 h-6" />
          </Button>
          <Link href="/" className="flex items-center gap-1 flex-shrink-0">
            <div className="bg-red-600 p-1 rounded flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <span className="text-xl font-medium whitespace-nowrap">YourTube</span>
            <span className="text-xs text-gray-400 ml-1 whitespace-nowrap">IN</span>
          </Link>
        </div>
        
        <div className="flex-1 max-w-2xl mx-4 min-w-[400px]">
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">⚠️ Firebase Configuration Required</p>
            <p className="text-sm text-yellow-600 mt-1">
              Please enable Google OAuth in Firebase Console to use authentication
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <VideoIcon className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Bell className="w-6 h-6" />
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white border-b w-full min-w-[1200px] sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <Menu className="w-6 h-6" />
        </Button>
        <Link href="/" className="flex items-center gap-1 flex-shrink-0">
          <div className="bg-red-600 p-1 rounded flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="text-xl font-medium whitespace-nowrap">YourTube</span>
          <span className="text-xs text-gray-400 ml-1 whitespace-nowrap">IN</span>
        </Link>
      </div>
      
      {/* Center Section - Always show search */}
      <div className="flex-1 max-w-2xl mx-4 min-w-[400px]">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex flex-1">
            <Input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onKeyPress={handleKeypress}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-l-full border-r-0 focus-visible:ring-0 min-w-[200px]"
              disabled={authLoading || isSigningIn}
            />
            <Button
              type="submit"
              className="rounded-r-full px-6 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-l-0 flex-shrink-0"
              disabled={authLoading || isSigningIn}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0" disabled={authLoading || isSigningIn}>
            <Mic className="w-5 h-5" />
          </Button>
        </form>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Video Upload Button - Always show */}
        <Button variant="ghost" size="icon" className="flex-shrink-0" disabled={authLoading || isSigningIn}>
          <VideoIcon className="w-6 h-6" />
        </Button>
        
        {/* Notifications - Always show */}
        <Button variant="ghost" size="icon" className="flex-shrink-0" disabled={authLoading || isSigningIn}>
          <Bell className="w-6 h-6" />
        </Button>
        
        {/* Create Channel Button (visible when logged in but no channel) */}
        {user && !user.channelname && (
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 flex-shrink-0"
            onClick={handleCreateChannel}
            disabled={authLoading || isSigningIn}
          >
            <PlusCircle className="w-4 h-4" />
            Create Channel
          </Button>
        )}
        
        {/* User dropdown or Sign in button */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full flex-shrink-0"
                disabled={authLoading || isSigningIn}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image} />
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="px-2 py-1.5">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                {user.channelname && (
                  <p className="text-xs text-blue-600 mt-1">@{user.channelname}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              
              {/* Channel options */}
              {user?.channelname ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user._id}`} className="flex items-center gap-2 cursor-pointer">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <VideoIcon className="w-3 h-3" />
                      </div>
                      Your channel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/studio" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <PlusCircle className="w-3 h-3" />
                      </div>
                      YouTube Studio
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem 
                  onClick={handleCreateChannel} 
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Channel
                </DropdownMenuItem>
              )}
              
              {/* Navigation links */}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/subscriptions" className="cursor-pointer">Subscriptions</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/history" className="cursor-pointer">History</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/liked" className="cursor-pointer">Liked videos</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/watch-later" className="cursor-pointer">Watch later</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/playlists" className="cursor-pointer">Playlists</Link>
              </DropdownMenuItem>
              
              {/* Settings & Sign Out */}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="text-red-600 cursor-pointer flex items-center gap-2"
                disabled={authLoading || isSigningIn}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSignIn} 
                className="text-blue-600 cursor-pointer"
                disabled={authLoading || isSigningIn}
              >
                Sign in with different account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            className="flex items-center gap-2 flex-shrink-0 min-w-[100px] justify-center"
            onClick={handleSignIn}
            disabled={authLoading || isSigningIn}
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                Sign in
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Channel Dialog */}
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        onSuccess={handleChannelCreated}
        onError={handleChannelError}
        mode="create"
      />
      
      {/* Show loading overlay when signing in */}
      {isSigningIn && showAccountSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              <p className="text-lg font-medium">Select your Google account</p>
              <p className="text-sm text-gray-500 text-center">
                A popup should appear asking you to select a Google account. 
                If it doesn't appear, check your browser's popup blocker.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsSigningIn(false)}
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
