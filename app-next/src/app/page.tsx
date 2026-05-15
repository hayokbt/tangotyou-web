import { get1Word } from "@/data/get1Word";

export default async function Home() {
  const [ term, meaning ] = await get1Word();

  return (
    <div>
      <h1>単語帳アプリ</h1>
      <h2>{term} {meaning}</h2>    
    </div>
  );
}
