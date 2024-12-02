import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container text-center my-4 mx-auto">
      <h1 className="text-3xl mb-4 ">Fancy Home Page</h1>
      <div className="flex gap-2 justify-center">
        <Button>Sign Up</Button>
        <Button>Sign In</Button>
      </div>
    </div>
  );
}
