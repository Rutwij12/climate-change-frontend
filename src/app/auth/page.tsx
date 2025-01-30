"use client";
import React from "react";
import { useState } from "react";
import Header from "@/components/Header";
import AuthOption from "@/components/AuthOption";
import SignInForm from "@/components/SignInForm";
import SignUpForm from "@/components/SignUpForm";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container max-w-4xl mx-auto p-10 space-y-6 flex flex-col items-center">
        <div className="space-y-4 text-center w-full">
          <h2 className="text-3xl font-bold">Welcome</h2>
          <p className="text-muted-foreground text-lg">Please sign in or create an account to continue</p>
        </div>

        <div className="grid gap-8 w-full">
          <Card className="w-full">
            <CardContent className="p-8">
              <AuthOption title="Sign In" isActive={isLogin} onClick={() => setIsLogin(true)} />
              {isLogin && <SignInForm />}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardContent className="p-8">
              <AuthOption title="Create Account" isActive={!isLogin} onClick={() => setIsLogin(false)} />
              {!isLogin && <SignUpForm />}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
