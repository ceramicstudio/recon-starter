import Link from "next/link";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/data/navLinks";
import { useState, useRef } from "react";
import { useClickAway } from "react-use";
import { ThemeChanger } from "@/components/ui/Theme-changer";
import { Squash as Hamburger } from "hamburger-react";

const NavMobile = () => {
  const [isOpen, setOpen] = useState(false);
  const ref = useRef(null);

  useClickAway(ref, () => setOpen(false));

  return (
    <div ref={ref} className="md:hidden ">
      <Hamburger toggled={isOpen} size={20} toggle={setOpen} />
      {isOpen && (
        <ul className="mt-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <li key={link.title}>
              <Link href={link.href}>{link.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="bg-background/30 py-4 backdrop-blur-sm">
      <div className="container flex flex-row items-center justify-between">
        <div className="container flex flex-row items-center justify-start">
          <Link href="/" className="hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* <img src="/logo.png" alt="logo" className="h-8" /> */}
            <p className="text-lg font-bold text-white">LOGO</p>
          </Link>
          <ul className="ml-8 hidden flex-row justify-between gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.title}>
                <Link href={link.href}>{link.title}</Link>
              </li>
            ))}
          </ul>
          <NavMobile />
        </div>
        <div className="flex flex-row justify-end space-x-2">
          <ThemeChanger />
          {/* <Button onClick={() => (window.location.href = "/quiz")}>
            Get Started
          </Button> */}
          <div className="flex w-full items-center justify-end">
            <w3m-button size="sm" balance="hide" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
