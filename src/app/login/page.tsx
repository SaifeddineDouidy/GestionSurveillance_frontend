"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Schema for form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// TypeScript type for form inputs
type LoginFormInputs = z.infer<typeof loginSchema>;

export default function AuthenticationPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // Handle form submission
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8088/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Login failed. Please check your credentials."
        );
      }

      const token = await response.text(); // Read response as plain text
      localStorage.setItem("jwt", token);
      router.push("/session");
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
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/bg.png')",
      }}
    >
      <div className="animated-border w-11/12 sm:w-3/4 lg:w-1/3 flex justify-center items-center px-4 py-6 rounded-lg">
        <Card className="w-full bg-white rounded-lg shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold mb-6 text-black text-center">
              Se Connecter
            </h1>
          </CardHeader>
          <CardContent>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Adresse e-mail :
                </label>
                <Input
                  type="email"
                  {...register("email")}
                  className={`w-full px-3 py-2 text-gray-700 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Entrez votre e-mail"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Mot de passe :
                </label>
                <Input
                  type="password"
                  {...register("password")}
                  className={`w-full px-3 py-2 text-gray-700 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Entrez votre mot de passe"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } text-white font-medium rounded-md`}
              >
                {loading ? "Connexion en cours..." : "Connexion"}
              </Button>
            </form>

            <div className="text-center mt-4">
              <a
                className="text-sm text-blue-500 hover:underline cursor-pointer"
                onClick={() => router.push("/forgot-password")}
              >
                Mot de passe oublié ?
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      <style jsx>{`
        .animated-border {
          position: relative;
          background: linear-gradient(
            90deg,
            white,
            #2463eb,
            #fdaf4d,
            #f8826e,
            #8f4818
          );
          background-size: 300% 300%;
          animation: animatedGradient 20s linear infinite;
          border-radius: 16px;
        }

        .animated-border::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
          background-color: rgba(
            255,
            255,
            255,
            0.1
          ); /* Transparent background */
          border-radius: inherit;
        }

        @keyframes animatedGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
