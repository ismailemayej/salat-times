import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const surahNumber = searchParams.get("surah");
  try {
    if (surahNumber) {
      const [arabicRes, banglaRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/bn.bengali`),
      ]);

      if (!arabicRes.ok || !banglaRes.ok) {
        throw new Error("Failed to fetch Quran data");
      }

      const arabicData = await arabicRes.json();
      const banglaData = await banglaRes.json();
      return NextResponse.json({
        surah: arabicData.data,
        translation: banglaData.data,
      });
    } else {
      // Fetch all surahs
      const res = await fetch("https://api.alquran.cloud/v1/surah");

      if (!res.ok) {
        throw new Error("Failed to fetch Surah list");
      }

      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch Quran data${error}` },
      { status: 500 }
    );
  }
}
