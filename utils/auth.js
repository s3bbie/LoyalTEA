import { supabase } from "./authClient";

// Register new user
export async function registerUsernamePin(username, pin) {
  const email = `${username}@loyaltea.com`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pin,
  });
  if (error) throw error;
  return data;
}

// Login existing user
export async function loginUsernamePin(username, pin) {
  const email = `${username}@loyaltea.com`;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pin,
  });
  if (error) throw error;
  return data;
}

// Logout
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
