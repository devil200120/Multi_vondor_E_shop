import React from "react";
import styles from "../../styles/styles";

const sponsors = [
  {
    name: "Sony",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png",
    url: "https://www.sony.com/",
  },
  {
    name: "Dell",
    logo: "https://logos-world.net/wp-content/uploads/2020/08/Dell-Logo-1989-2016.png",
    url: "https://www.dell.com/",
  },
  {
    name: "LG",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/2560px-LG_logo_%282015%29.svg.png",
    url: "https://www.lg.com/",
  },
  {
    name: "Apple",
    logo: "https://www.vectorlogo.zone/logos/apple/apple-ar21.png",
    url: "https://www.apple.com/",
  },
  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    url: "https://www.microsoft.com/",
  },
];

const Sponsored = () => {
  return (
    <div
      className={`${styles.section} hidden sm:block bg-gradient-to-br from-primary-50 to-secondary-100 py-14 px-8 mb-16 rounded-2xl shadow-unacademy-lg animate-fadeIn`}
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-600 font-Inter mb-2">
          Trusted by Leading Brands
        </h2>
        <p className="text-lg text-text-muted font-Inter">
          Our partners help us deliver the best experience for you
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.name}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.card} ${styles.card_padding} flex flex-col items-center justify-center w-48 h-40 hover_lift transition-all duration-200 group bg-white`}
            title={sponsor.name}
          >
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              className="w-32 h-20 object-contain mb-3 group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-base font-semibold text-primary-500 group-hover:text-primary-600 font-Inter">
              {sponsor.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Sponsored;
