import Image from "next/image";
import Link from "next/link";
export const Navbar = () => {
  return (
    <>
      <nav className="flexBetween navbar bg-white">
        <div>
          <Link href="/">
            <h2 className="text-justify text-3xl whitespace-pre font-semibold  BOBY">
              ShArma<span className="JI">Ji</span>
            </h2>
           <div className="LOGO"><p className="Logo">URL-SHORTNER</p></div>
            {/* <Image src="./logo.svg" width={80} height={30} alt="flexibble" /> */}
          </Link>
          <ul className="xl:flex hidden text-small gap-7"></ul>
        </div>
      </nav>
    </>
  );
};
