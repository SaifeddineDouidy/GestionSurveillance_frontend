"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KeyRound, Mail } from "lucide-react";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ProfileUpdatePage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = () => {
    try {
      const token = localStorage.getItem("jwt");
      if (token) {
        const decodedToken = jwtDecode(token);
        setEmail(decodedToken.email); // Assuming 'email' is stored in the token
      } else {
        console.error("No token found");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem("jwt");
    try {
      const response = await fetch("http://localhost:8088/api/v1/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          email,
          password: currentPassword,
        }),
      });
  
      if (response.ok) {
        const data = await response.json(); // Get the response body
  
        // Extract the new token from the response
        const newToken = data.token;
  
        // Store the new JWT token in localStorage
        localStorage.setItem("jwt", newToken);
  
        alert("Email updated successfully! New token is now stored.");
      } else {
        alert("Failed to update email. Please try again.");
      }
    } catch (error) {
      console.error("Error updating email:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8088/api/v1/user/changePassword/${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify({
          password: newPassword,
          repeatPassword: confirmPassword
        }),
      });

      if (response.ok) {
        alert("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorMessage = await response.text();
        alert(errorMessage || "Failed to update password. Please try again.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-14 ml-2 w-auto"
              />
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FontAwesomeIcon icon={faUser} className="text-lg" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <ul className="py-1 text-sm text-gray-700">
                    <li>
                      <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                        Profile
                      </a>
                    </li>
                    <li>
                      <a href="/settings" className="block px-4 py-2 hover:bg-gray-100">
                        Settings
                      </a>
                    </li>
                    <li>
                      <a href="/login" className="block px-4 py-2 text-red-600 hover:bg-gray-100">
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 max-w-lg mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Update Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Update Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <Input 
                type="email" 
                placeholder="Enter new email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleUpdateProfile} 
              disabled={loading}
              variant="blue"
            >
              {loading ? "Updating Email..." : "Update Email"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              <Input 
                type="password" 
                placeholder="New password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              <Input 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handlePasswordChange} 
              disabled={loading}
              variant="blue"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function jwtDecode(token: string): { email: string } {
  // This is a simple implementation. You might need to use a library like jwt-decode for a real implementation.
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}
