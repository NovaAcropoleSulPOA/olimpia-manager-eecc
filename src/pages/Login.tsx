import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await signIn(email, password);
    } else {
      // TODO: Implement registration form
      await signUp({
        email,
        password,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-primary text-center">
            Olimpíadas Estaduais RS 2025
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? 'Faça login para continuar' : 'Crie sua conta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="login"
                onClick={() => setIsLogin(true)}
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                onClick={() => setIsLogin(false)}
              >
                Cadastro
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-olimpics-primary hover:bg-olimpics-primary/90">
                  Entrar
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <p className="text-center text-sm text-gray-500">
                Formulário de cadastro em desenvolvimento...
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            onClick={() => console.log('Implementar recuperação de senha')}
            className="text-olimpics-primary"
          >
            Esqueceu sua senha?
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;