"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

import { Loader2Icon } from "lucide-react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    await authClient.signIn.magicLink({ email, callbackURL: "/dashboard" });
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        {!sent ? (
          <form onSubmit={handleSubmit} className="md:w-[400px]">
            <Card className="max-w-md rounded-none">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Enter your email below to login to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      value={email}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2Icon size={16} className="animate-spin" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        ) : (
          <p>Check your email for a login link</p>
        )}
      </div>
    </div>
  );
}
