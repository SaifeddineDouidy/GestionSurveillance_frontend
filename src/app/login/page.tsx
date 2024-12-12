"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Schema for form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
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
        throw new Error(errorData.message || "Login failed. Please check your credentials.");
      }
  
      const token = await response.text(); // Read response as plain text
      localStorage.setItem("jwt", token);
      router.push("/sessions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h1 className="text-2xl font-semibold text-center">Login</h1>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                {...register("email")}
                className={`border ${errors.email ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message as React.ReactNode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Input
                type="password"
                {...register("password")}
                className={`border ${errors.password ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message as React.ReactNode}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        {/* <CardFooter>
          <p className="text-sm text-center text-gray-500">
            Don’t have an account? <a href="/register" className="text-blue-600 hover:underline">Sign up</a>
          </p>
        </CardFooter> */}
      </Card>
    </div>
  );
}
