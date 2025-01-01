"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ResetPasswordInputs {
  password: string;
  confirmPassword: string;
  email: string;
}

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { register, handleSubmit } = useForm<ResetPasswordInputs>();

  const onSubmit: SubmitHandler<ResetPasswordInputs> = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8088/forgotPassword/changePassword/${data.email}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: data.password,
            repeatPassword: data.confirmPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Password reset failed.");
      }

      setMessage("Password has been reset successfully.");
      router.push("/login");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url('/bg.png')",
      }}
    >
      <Card className="w-full max-w-lg p-6 bg-white rounded-lg shadow-md">
        <CardHeader>
          <h1 className="text-2xl font-bold mb-6 text-black text-center">
            Réinitialiser le Mot de Passe
          </h1>
        </CardHeader>
        <CardContent>
          {message && <p className="text-sm text-green-500 mb-4">{message}</p>}
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                Votre Email:
              </label>
              <Input
                type="email"
                {...register("email", { required: true })}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Entrer votre email"
              />
            </div>
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                Nouveau Mot de Passe:
              </label>
              <Input
                type="password"
                {...register("password", { required: true })}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Entrer un nouveau mot de passe"
              />
            </div>
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                Confirmer le Mot de Passe:
              </label>
              <Input
                type="password"
                {...register("confirmPassword", { required: true })}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirmer le nouveau mot de passe"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white font-medium rounded-md`}
            >
              {loading ? "En Cours..." : "Réinitialiser le Mot de Passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
