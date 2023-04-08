import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://odugrrpozfqjsygravev.supabase.co",
  "CHAVE DO SUPABASEKEY"
);
