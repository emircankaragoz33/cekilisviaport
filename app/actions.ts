"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};


// actions.ts
// actions.ts dosyasının başında Kazanan arayüzünü tanımlayın

interface Kazanan {
  id: number;
  createdAt: string;  // Timestamp
  hesap_adi: string;
  ad_soyad: string;
  tel: string;
  adres: string;
  not: string;
}


// Kazanan ekleme
export const addKazanan = async (formData: Omit<Kazanan, 'id' | 'createdAt'>) => {
  try {
    const res = await fetch('/api/kazananlar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (res.ok) {
      return data; // Başarılı ekleme sonucu döndür
    } else {
      throw new Error(data.message || 'Bir hata oluştu');
    }
  } catch (error) {
    console.error('Hata:', error);
    throw error;
  }
};

// Kazanan güncelleme
export const updateKazanan = async (id: number, formData: Omit<Kazanan, 'createdAt'>) => {
  try {
    const res = await fetch('/api/kazananlar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, id }),  // `id`'yi `formData`'ya ekledik
    });
    const data = await res.json();
    if (res.ok) {
      return data; // Başarılı güncelleme sonucu döndür
    } else {
      throw new Error(data.message || 'Bir hata oluştu');
    }
  } catch (error) {
    console.error('Hata:', error);
    throw error;
  }
};

// Kazanan silme
export const deleteKazanan = async (id: number) => {
  try {
    const res = await fetch(`/api/kazananlar?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      return { message: 'Kazanan silindi.' }; // Başarılı silme sonucu döndür
    } else {
      const data = await res.json();
      throw new Error(data.message || 'Bir hata oluştu');
    }
  } catch (error) {
    console.error('Hata:', error);
    throw error;
  }
};

// Kazananları listeleme
export const fetchKazananlar = async () => {
  try {
    const res = await fetch('/api/kazananlar');
    const data = await res.json();
    if (res.ok) {
      return data; // Kazananlar verisini döndür
    } else {
      throw new Error(data.message || 'Veri çekilemedi');
    }
  } catch (error) {
    console.error('Hata:', error);
    throw error;
  }
};
