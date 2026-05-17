"use client"

import { useEffect, useState } from "react";
import { get1Word } from "@/data/get1Word";
import { useRouter } from "next/navigation";

export default function Home() {
  const [term, setTerm] = useState("読み込み中...");
  const [meaning, setMeaning] = useState("");
  const router = useRouter();

  const handleAccount = async () => {
    router.push("/account");
  };

  useEffect(() => {
    const handle1Word = async () => {
      try {
        console.log("単語を取得開始...");
        const [nextTerm, nextMeaning] = await get1Word();
        console.log("取得成功:", nextTerm, nextMeaning);
        setTerm(nextTerm);
        setMeaning(nextMeaning);
      } catch (error) {
        console.error("単語取得エラー:", error);
        setTerm("取得エラー");
        setMeaning("単語を読み込めませんでした。バックエンドが起動しているか確認してください。");
      }
    };

    handle1Word();
  }, []);

  return (
    <div>
      <h1>単語帳アプリ</h1>
      <h2>{term}</h2>
      <p>{meaning}</p>
      <button type="button" onClick={handleAccount}>
        アカウントページへ
      </button>
    </div>
  );
}
