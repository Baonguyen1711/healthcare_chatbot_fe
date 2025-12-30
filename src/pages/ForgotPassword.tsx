import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const authService = new AuthService()
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic will be implemented by user
    const getFortgotPassword = async () => {
      try {
        const response = await authService.forgotPassword({
          userName: email,
        });

        if (response.status == 200) {
          toast({
            title: "Reset code sent",
            description: "Please check your email for the reset code.",
            variant: "default",
          });

          navigate("/confirm-forgot-password");
        }
      } catch (error) {
        console.error("Error sending forgot password request:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to send reset code.",
          variant: "destructive",
        });
      }
    };

    getFortgotPassword();
    console.log("Forgot password submitted:", email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
          <CardDescription>Enter your email to receive a reset code</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send Reset Code
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
