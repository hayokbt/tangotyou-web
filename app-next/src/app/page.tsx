"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const handleAccount = async () => {
    if (!isLoggedIn) {
      router.push("/account");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/account/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setIsLoggedIn(false);
      } else {
        console.error("logout failed", await res.text());
      }
    } catch (error) {
      console.error("logout error:", error);
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/account/me", { credentials: "include" });
        if (!res.ok) {
          setIsLoggedIn(false);
          return;
        }
        const data = await res.json();
        setIsLoggedIn(Boolean(data?.loggedIn));
      } catch (error) {
        console.error("login check error:", error);
        setIsLoggedIn(false);
      }
    };

    checkLogin();
  }, []);

  return (
    <div>
      <h1>単語帳アプリ</h1>
      <button type="button" onClick={handleAccount} disabled={isLoggedIn}>
        アカウントページへ
      </button>
      {isLoggedIn && (
        <>
          <button type="button" onClick={handleLogout} style={{ marginLeft: 12 }}>
            ログアウト
          </button>
          <p style={{ color: "green", marginTop: 12 }}>
            現在ログイン状態です
          </p>
        </>
      )}
    </div>
  );
}
