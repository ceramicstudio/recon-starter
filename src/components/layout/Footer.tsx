import { footerLinks } from "@/data/footerLinks";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="pt-10">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="space-y-6 sm:mx-auto sm:max-w-md sm:text-center"></div>
        <div className="mt-10 items-center justify-between border-t py-10 sm:flex">
          {/* <p>© 2024 Some Company. All rights reserved.</p> */}
          <ul className="mt-6 flex flex-wrap items-center gap-4 sm:mt-0 sm:text-sm">
            {footerLinks.map((item: { href: string; label: string }) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
