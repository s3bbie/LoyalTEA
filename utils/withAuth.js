import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "./authClient";

export default function withAuth(Component) {
  return function Guarded(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          router.replace("/login");
        } else {
          setLoading(false);
        }
      });
    }, [router]);

    if (loading) return null; // or a spinner
    return <Component {...props} />;
  };
}
