import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Eye, EyeOff, Shield } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHostLogin, setIsHostLogin] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isHostLogin) {
        // Admin login through backend API
        // console.log('Attempting admin login with:', { email, password: '***' });
        
        const response = await fetch('http://localhost:5000/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        // console.log('Admin login response status:', response.status);
        // console.log('Admin login response headers:', response.headers);

        if (response.ok) {
          const data = await response.json();
          // console.log('Admin login success data:', { ...data, token: '***' });
          // Store JWT token securely
          localStorage.setItem("adminToken", data.token);
          localStorage.setItem("adminEmail", email);
          toast.success("Host login successful!");
          navigate("/admin");
        } else {
          const errorData = await response.json();
          // console.log('Admin login error data:', errorData);
          toast.error(errorData.message || "Invalid host credentials");
        }
      } else {
        // Regular user login
        await login(email, password);
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleHostLogin = () => {
    setIsHostLogin(!isHostLogin);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
        <Link to="/" className="text-xl sm:text-2xl font-bold text-primary">
          StayFinder
        </Link>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-foreground">
            {isHostLogin ? "Host Access" : "Welcome Back"}
          </h1>
          {isHostLogin && (
            <p className="text-sm text-center text-muted-foreground">
              Enter host credentials to access admin dashboard
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="email" className="text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={isHostLogin ? "Enter host email" : "Enter your email"}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={isHostLogin ? "Enter host password" : "Enter your password"}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold shadow hover:from-teal-600 hover:to-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : (isHostLogin ? "Access Host Dashboard" : "Log in")}
            </Button>
          </form>
          
          {/* Host Login Toggle */}
          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={toggleHostLogin}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto"
            >
              <Shield className="h-4 w-4" />
              {isHostLogin ? "Switch to User Login" : "Host Login"}
            </Button>
          </div>

          {!isHostLogin && (
            <p className="mt-3 sm:mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
