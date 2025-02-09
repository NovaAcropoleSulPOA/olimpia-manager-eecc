
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { PhilosopherQuotes } from '@/components/auth/PhilosopherQuotes';

export default function Login() {
  return (
    <div className="min-h-screen bg-olimpics-background">
      <div className="container mx-auto p-6">
        <Tabs defaultValue="register" className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-olimpics-green-primary/10">
            <TabsTrigger 
              value="register"
              className="data-[state=active]:bg-olimpics-green-primary data-[state=active]:text-white"
            >
              Inscreva-se
            </TabsTrigger>
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-olimpics-green-primary data-[state=active]:text-white"
            >
              Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <SignUpForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <LoginForm />
              </CardContent>
            </Card>
            <PhilosopherQuotes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
