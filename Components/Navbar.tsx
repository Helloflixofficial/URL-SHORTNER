import Image from "next/image";
import Link from "next/link";
export const Navbar = () => {
  return (
    <>
      <nav className="bg-blue">
        <div>
          <Link href="/">
            <h2>
            </h2>
            <Image className="col" src="./logo.svg" width={80} height={30} alt="flexibble" />
          </Link>
        </div>
      </nav>
    </>
  );
};
