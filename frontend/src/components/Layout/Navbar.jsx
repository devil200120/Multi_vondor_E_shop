import React from "react";
import { Link } from "react-router-dom";
import { navItems } from "../../static/data";

const Navbar = ({ active }) => {
  return (
    <div className="flex flex-col 800px:flex-row 800px:items-center 800px:gap-5 space-y-2 800px:space-y-0">
      {navItems.map((item, index) => (
        <Link
          key={index}
          to={item.url}
          className={`${
            active === index + 1
              ? "text-primary-500 800px:border-b-2 800px:border-primary-500"
              : "text-gray-700 hover:text-primary-500"
          } block px-4 py-3 800px:px-0 800px:py-0 text-[13px] font-medium transition-colors duration-200 800px:pb-1 whitespace-nowrap`}
        >
          {item.title}
        </Link>
      ))}
    </div>
  );
};

export default Navbar;
