import { useRouter } from "next/router";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { toast } from "sonner"; // Install: npm install sonner

interface ChannelDialogueProps {
  isopen: boolean;
  onclose: () => void;
  channeldata?: any;
  mode: "create" | "edit";
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const Channeldialogue = ({ 
  isopen, 
  onclose, 
  channeldata, 
  mode,
  onSuccess,
  onError
}: ChannelDialogueProps) => {
  const { user, login } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setisSubmitting] = useState(false);
  const [errors, setErrors] = useState<{name?: string}>({});

  // Debug user state
  useEffect(() => {
    console.log("ChannelDialogue - User:", user);
    console.log("ChannelDialogue - User ID:", user?._id);
  }, [user]);

  useEffect(() => {
    if (channeldata && mode === "edit") {
      setFormData({
        name: channeldata.name || "",
        description: channeldata.description || "",
      });
    } else {
      setFormData({
        name: user?.name || "",
        description: "",
      });
    }
  }, [channeldata, mode, user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: {name?: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Channel name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Channel name must be at least 3 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlesubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    // Check if user exists
    if (!user) {
      toast.error("Please sign in to create a channel");
      onclose();
      return;
    }
    
    if (!user._id) {
      toast.error("User ID is missing. Please sign in again.");
      onclose();
      return;
    }
    
    console.log("Submitting channel creation for user ID:", user._id);
    
    const payload = {
      channelname: formData.name,
      description: formData.description,
    };
    
    setisSubmitting(true);
    
    try {
      const response = await axiosInstance.patch(
        `/user/update/${user._id}`,
        payload
      );
      
      console.log("Channel creation response:", response.data);
      
      if (response.data) {
        // Update user context with new data
        login(response.data);
        
        // Show success message
        toast.success(
          mode === "create" 
            ? "Channel created successfully!" 
            : "Channel updated successfully!"
        );
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Navigate to channel page
        if (mode === "create") {
          router.push(`/channel/${user._id}`);
        }
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
      });
      
      // Close dialog
      onclose();
      
    } catch (error: any) {
      console.error("Channel creation failed:", error);
      
      // Show error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to create channel";
      toast.error(errorMessage);
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <Dialog open={isopen} onOpenChange={onclose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create your channel" : "Edit your channel"}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "create" 
              ? "Set up your channel to start uploading content" 
              : "Update your channel information"}
          </p>
        </DialogHeader>

        <form onSubmit={handlesubmit} className="space-y-6">
          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your channel name"
              className={errors.name ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
            <p className="text-xs text-gray-500">
              This name will appear on your channel and videos
            </p>
          </div>
          
          {/* Channel Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Channel Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell viewers about your channel..."
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Optional: Describe what your channel is about
            </p>
          </div>

          {/* Debug info (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-2 bg-gray-100 rounded text-xs">
              <p>User ID: {user?._id || "No user ID"}</p>
              <p>User exists: {user ? "Yes" : "No"}</p>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onclose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !user}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                mode === "create" ? "Create Channel" : "Save Changes"
              )}
            </Button>
          </DialogFooter>
          
          {!user && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="text-yellow-800">
                You need to be signed in to create a channel. Please sign in first.
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Channeldialogue;
