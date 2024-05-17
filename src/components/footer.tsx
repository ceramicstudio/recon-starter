// Navbar.js
import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white rounded-lg shadow dark:bg-gray-800 w-full h-24">
    <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
      <div className="dark:text-gray-200 flex flex-col">
        <p className="text-lg text-left">The Amazing Race</p>
        <p className="text-md text-gray-400 mt-2 text-left">by ADM</p>
    </div>
    <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
        <li>
            <a href="#" className="hover:underline me-4 md:me-6">Website</a>
        </li>
        <li>
            <a href="#" className="hover:underline me-4 md:me-6">Points Docs</a>
        </li>
        <li>
            <a href="#" className="hover:underline me-4 md:me-6">Twitter</a>
        </li>
        <li>
            <a href="#" className="hover:underline me-4 md:me-6">Discord</a>
        </li>
        <li>
            <a href="#" className="hover:underline me-4 md:me-6">YouTube</a>
        </li>
    </ul>
    </div>
</footer>
  );
};

export default Footer;
