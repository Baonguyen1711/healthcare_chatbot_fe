import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/services/auth"; 
import { useNavigate } from "react-router-dom";

const ConfirmEmail = () => {
  const authService = new AuthService()
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("registeredEmail");
    if(email) {
      setFormData((prev) => ({ ...prev, email }));
    }
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    code: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.confirmCode({
        userName: formData.email,
        code: formData.code,
      });
      
      if(response.status == 200) {
        alert("Email confirmed successfully! You can now log in.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error confirming email:", error);
    }
  };

  const handleResendCode = () => {
    // Logic will be implemented by user
    console.log("Resend code for:", formData.email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Confirm your email</CardTitle>
          <CardDescription>Enter the verification code sent to {formData.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="Enter 6-digit code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                maxLength={6}
              />
            </div>
            <Button type="submit" className="w-full">
              Verify Email
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendCode}
            >
              Resend Code
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            <Link to="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmEmail;
