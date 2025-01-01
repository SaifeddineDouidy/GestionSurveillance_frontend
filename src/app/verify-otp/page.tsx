"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface VerifyOtpInputs {
  email: string;
  otp: number;
}

export default function VerifyOtpPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit } = useForm<VerifyOtpInputs>();

  const onSubmit: SubmitHandler<VerifyOtpInputs> = async (data) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8088/forgotPassword/verifyOTP/${data.otp}/${data.email}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "OTP verification failed.");
      }

      setMessage("OTP verified successfully. You can now reset your password.");
      router.push("/reset-password");
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
            Verifier l'OTP
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
                OTP:
              </label>
              <Input
                type="number"
                {...register("otp", { required: true })}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Entrer OTP"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white font-medium rounded-md`}
            >
              {loading ? "Verifying OTP..." : "Verifier l'OTP"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
