import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className="bg-gray-700 p-4 text-white">
      <div className="lg:px-16 px-4  flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold">
            {" "}
            <span className="text-amber-500">Quran</span> Reader
          </h1>
        </Link>
        <div className="flex justify-between items-center lg:space-x-8 space-x-3">
          <Link href="/" className=" hover:text-amber-200 hover:scale-105 ">
            <ul>
              <li>Home</li>
            </ul>
          </Link>
          <Link
            href="/quran-reader"
            className=" hover:text-amber-200 hover:scale-105 "
          >
            <ul>
              <li>Quran</li>
            </ul>
          </Link>
          <Link href="/" className=" hover:text-amber-200 hover:scale-105 ">
            <ul>
              <li>Contact</li>
            </ul>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
