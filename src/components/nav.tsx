// Navbar.js
import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="w-full border-b border-slate-600 bg-white bg-gradient-to-b from-[#0f0f0f] to-[#1e1e1e] p-4">
      <div className="justify-items-between container mx-auto grid grid-cols-3">
        <div className="flex w-full items-center justify-start">
          <div className="ml-3 text-lg font-bold text-white">
            <Link href="/">LOGO</Link>
          </div>
        </div>
        <div className="flex w-full items-center justify-center">
          <ul className="rounded-lg text-center text-sm font-medium text-gray-500 shadow sm:flex dark:divide-gray-700 dark:text-gray-400">
            <li className="w-1/2 focus-within:z-10">
              <a
                href="#"
                className="active inline-block w-full rounded-s-lg border-r border-gray-200 bg-gray-100 p-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                aria-current="page"
              >
                Home
              </a>
            </li>
            <li className="w-1/2 focus-within:z-10">
              <a
                href="#"
                className="inline-block w-full rounded-e-lg border-s-0 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Rewards
              </a>
            </li>
          </ul>
        </div>
        <div className="flex w-full items-center justify-end">
          <w3m-button size="sm" balance="hide" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
