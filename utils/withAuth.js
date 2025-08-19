import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "./supabaseClient";

export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkSession = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/");
        } else {
          setLoading(false);
        }
      };

      checkSession();
    }, []);

    if (loading) return null; 

    return <Component {...props} />;
  };
}
