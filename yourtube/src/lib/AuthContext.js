import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { useState, useEffect, useContext, createContext } from "react";
import { auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Configure Google Auth Provider to force account selection
  const getGoogleProvider = () => {
    const provider = new GoogleAuthProvider();
    
    // CRITICAL: This forces account selection every time
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Add additional scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    return provider;
  };
  
  const login = (userdata) => {
    setUser(userdata);
    if (typeof window !== 'undefined') {
      localStorage.setItem("user", JSON.stringify(userdata));
    }
    console.log("User logged in:", userdata?.email);
  };

  const logout = async () => {
    console.log("Logging out...");
    setUser(null);
    setAuthError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      sessionStorage.clear(); // Clear session storage
    }
    try {
      if (auth) {
        await signOut(auth);
        console.log("Firebase sign out successful");
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handlegooglesignin = async () => {
    try {
      console.log("handlegooglesignin called");
      
      // Check if auth is available
      if (!auth) {
        const error = new Error("Firebase authentication is not initialized.");
        console.error(error.message);
        setAuthError(error.message);
        throw error;
      }
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        const error = new Error("Cannot sign in during server-side rendering");
        console.error(error.message);
        throw error;
      }
      
      // IMPORTANT: Clear any existing auth state before showing popup
      await signOut(auth);
      
      // Set persistence to SESSION to avoid automatic sign-in
      await setPersistence(auth, browserSessionPersistence);
      
      // Get provider with forced account selection
      const provider = getGoogleProvider();
      
      console.log("Attempting Google sign in with forced account selection...");
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      
      console.log("✅ Google sign-in successful!");
      console.log("User email:", result.user.email);
      
      const firebaseuser = result.user;
      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };
      
      console.log("Sending user data to backend:", payload);
      const response = await axiosInstance.post("/user/login", payload);
      console.log("Backend response:", response.data);
      
      if (response.data && response.data.result) {
        login(response.data.result);
        setAuthError(null);
        return response.data.result;
      } else {
        throw new Error("Invalid response from server.");
      }
      
    } catch (error) {
      console.error("❌ Google sign-in error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      let userMessage = error.message;
      
      if (error.code === 'auth/popup-blocked') {
        userMessage = "Sign-in popup was blocked. Please allow popups for this site.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        userMessage = "Sign-in was cancelled.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Try again with a small delay
        setTimeout(() => {
          handlegooglesignin();
        }, 1000);
        return;
      }
      
      setAuthError(userMessage);
      throw new Error(userMessage);
    }
  };

  useEffect(() => {
    console.log("AuthContext useEffect running");
    
    if (!auth) {
      console.error("⚠️ Firebase auth is not available.");
      setAuthError("Firebase authentication is not configured.");
      setLoading(false);
      return;
    }
    
    console.log("✅ Setting up auth state listener");
    
    // Set persistence to SESSION initially
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log("Session persistence set");
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });

    // Check localStorage for existing user
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("📦 Found user in localStorage:", parsedUser.email);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }

    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
      console.log("🔄 Firebase auth state changed:", firebaseuser ? `User: ${firebaseuser.email}` : "No user");
      
      if (firebaseuser) {
        try {
          console.log("🔄 Syncing with backend...");
          const payload = {
            email: firebaseuser.email,
            name: firebaseuser.displayName,
            image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          };
          
          const response = await axiosInstance.post("/user/login", payload);
          
          if (response.data && response.data.result) {
            console.log("✅ User synced with backend:", response.data.result.email);
            login(response.data.result);
            setAuthError(null);
          } else {
            console.error("Backend response missing user data");
          }
        } catch (error) {
          console.error("❌ Error syncing user with backend:", error);
        }
      } else {
        // No Firebase user
        console.log("👤 No user signed in to Firebase");
        // Check if we should clear local user
        if (typeof window !== 'undefined' && !localStorage.getItem("user")) {
          setUser(null);
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error("❌ Error in auth state listener:", error);
      setAuthError(error.message);
      setLoading(false);
    });

    // Set a timeout for loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Auth loading timeout");
        setLoading(false);
      }
    }, 10000);

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      handlegooglesignin,
      loading,
      authError
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
