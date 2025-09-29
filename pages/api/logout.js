import { supabase } from "@/utils/authClient";

await supabase.auth.signOut();
router.push("/staff/login");
