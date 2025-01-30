import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInForm() {
  return (
    <form className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" className="border rounded-md" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Enter your password" className="border rounded-md" />
      </div>
      <Button className="w-full bg-[#1B7A3E] hover:bg-[#156032]">Sign In</Button>
    </form>
  );
}
