import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "@/modules/auth/view/Login";
import Signin from "@/modules/auth/view/Signin";

export function Index() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      {/* <Tabs defaultValue="login" className="w-[400px]"> */}
      <Tabs defaultValue="login" className="w-100">
        <TabsList>
          <TabsTrigger value="login">LogIn</TabsTrigger>
          <TabsTrigger value="singin">singin</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login />
        </TabsContent>
        <TabsContent value="singin">
          <Signin />
        </TabsContent>
      </Tabs>
    </div>
  );
}
