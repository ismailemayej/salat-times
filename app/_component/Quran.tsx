"use client";
import { useState, useEffect } from "react";
import {
  FaSearch,
  FaBookmark,
  FaRegBookmark,
  FaArrowLeft,
} from "react-icons/fa";
import { Surah, Ayah, QuranResponse } from "@/types/Type";

const QuranReader = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [banglaTranslation, setBanglaTranslation] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>([]);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/quran");
        const data: QuranResponse = await response.json();

        if (data.code === 200) {
          setSurahs(data.data);
        } else {
          setError("Failed to fetch Surahs");
        }
      } catch (err) {
        setError(`An error occurred while fetching Surahs ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();

    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem("quranBookmarks");
    if (savedBookmarks) {
      setBookmarkedAyahs(JSON.parse(savedBookmarks));
    }
  }, []);

  const fetchSurah = async (surahNumber: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quran?surah=${surahNumber}`);
      const data = await response.json();
      if (data.surah && data.translation) {
        setCurrentSurah(data.surah);
        setBanglaTranslation(data.translation.ayahs);
      } else {
        setError("Failed to fetch Surah details");
      }
    } catch (err) {
      setError(`An error occurred while fetching Surah details${err}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (ayahNumber: number) => {
    let updatedBookmarks: number[];
    if (bookmarkedAyahs.includes(ayahNumber)) {
      updatedBookmarks = bookmarkedAyahs.filter((num) => num !== ayahNumber);
    } else {
      updatedBookmarks = [...bookmarkedAyahs, ayahNumber];
    }
    setBookmarkedAyahs(updatedBookmarks);
    localStorage.setItem("quranBookmarks", JSON.stringify(updatedBookmarks));
  };

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.englishNameTranslation
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading && !currentSurah) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="lg:px-16 px-4 bg-gray-100 py-8 ">
      {!currentSurah ? (
        <div>
          <div className="  flex justify-between items-center mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Surah..."
                className="pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg"
            >
              {showBookmarks ? "Show All" : "Show Bookmarks"}
            </button>
          </div>

          {showBookmarks ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Bookmarked Ayahs</h2>
              {bookmarkedAyahs.length === 0 ? (
                <p>No bookmarked ayahs</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarkedAyahs.map((ayahNumber) => {
                    return (
                      <div key={ayahNumber} className="border p-4 rounded-lg">
                        Ayah {ayahNumber}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className=" border-amber-200 p-2 rounded-xl shadow-2xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.number}
                  onClick={() => fetchSurah(surah.number)}
                  className="relative shadow-xl text-black bg-gradient-to-l from-green-400 to-red-300  p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:opacity-90"
                >
                  <span className="absolute top-[-12px] left-[45%] w-8 h-8 bg-white rounded-full shadow-xl flex justify-center items-center text-sm text-black">
                    {surah.number}
                  </span>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{surah.englishName}</h3>
                      <p className="text-black">
                        {surah.englishNameTranslation}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="arabic text-2xl text-black font-arabic">
                        {surah.name}
                      </span>
                      <p className="text-sm text-black">
                        Ayahs: {surah.numberOfAyahs}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setCurrentSurah(null)}
              className="flex items-center gap-2 lg:text-lg text-sm px-4 py-2 bg-gray-300 rounded-lg"
            >
              <FaArrowLeft /> Back
            </button>
            <h1 className="text-2xl font-bold text-center arabic">
              {currentSurah.englishName} ({currentSurah.name})
            </h1>
            <div className="w-24"></div>
          </div>
          <div className="bg-white p-6 items-center shadow-2xl lg:w-[450px] mx-auto rounded-2xl">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-semibold">
                {currentSurah.englishNameTranslation}
              </h2>
              <p className="text-gray-600">
                {currentSurah.revelationType} - {currentSurah.numberOfAyahs}{" "}
                Ayahs
              </p>
            </div>
            <div className="space-y-6">
              {currentSurah.ayahs.map((ayah, index) => (
                <div
                  key={ayah.number}
                  className="border-b pb-6 last:border-b-0 p-2  mx-auto rounded-2xl bg-green-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-green-100 shadow-xl text-green-800 rounded-full w-8 h-8 flex items-center justify-center">
                      {ayah.numberInSurah}
                    </span>
                    <button onClick={() => toggleBookmark(ayah.number)}>
                      {bookmarkedAyahs.includes(ayah.number) ? (
                        <FaBookmark className="text-yellow-500" />
                      ) : (
                        <FaRegBookmark className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className=" arabic text-2xl font-arabic text-right mb-2 leading-loose">
                    {ayah.text}
                  </p>
                  <p className="bangla text-gray-700 text-xl">
                    {banglaTranslation[index]?.text || "Loading translation..."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuranReader;
