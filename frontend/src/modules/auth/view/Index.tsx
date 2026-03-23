import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "@/modules/auth/view/Login";
import Signin from "@/modules/auth/view/Signin";

export function Index() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <Tabs defaultValue="login">
        <TabsList>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="singin">Signin</TabsTrigger>
        </TabsList>
        <div className="max-w-md mx-auto p-6 border rounded-lg shadow-sm">
          <TabsContent value="login">
            <Login />
          </TabsContent>
          <TabsContent value="singin">
            <Signin />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
