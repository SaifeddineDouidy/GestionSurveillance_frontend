"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, KeyRound } from "lucide-react";

export default function ProfileUpdatePage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
        console.error("Aucun jeton trouvé");
      }
    } catch (error) {
      console.error("Erreur lors du décodage du jeton :", error);
    }
  };

  const handleUpdateEmail = async () => {
    setLoading(true);
    const token = localStorage.getItem("jwt");
    try {
      const response = await fetch("http://localhost:8088/api/v1/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Votre email a été mis à jour avec succès !");
      } else {
        alert("Échec de la mise à jour de l'email. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'email :", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
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
          repeatPassword: confirmPassword,
        }),
      });

      if (response.ok) {
        alert("Votre mot de passe a été mis à jour avec succès !");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorMessage = await response.text();
        alert(errorMessage || "Échec de la mise à jour du mot de passe. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="bg-gray-50 p-12">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6">Mettre à jour le profil</h1>

            {/* Email Update */}
            <section className="mb-10">
              <Card>
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-xl font-semibold">
                    Mettre à jour votre email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-700" />
                    <Input
                      type="email"
                      placeholder="Entrer un nouveau email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={handleUpdateEmail}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  >
                    {loading ? "Mise à jour..." : "Confirmer"}
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Password Update */}
            <section>
              <Card>
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-xl font-semibold">
                    Mettre à jour votre mot de passe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-5 h-5 text-gray-700" />
                    <Input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-5 h-5 text-gray-700" />
                    <Input
                      type="password"
                      placeholder="Confirmer le nouveau mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  >
                    {loading ? "Mise à jour..." : "Confirmer"}
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function jwtDecode(token: string): { email: string } {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  return JSON.parse(jsonPayload);
}
