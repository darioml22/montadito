import { Link } from "react-router-dom";
import Logo from "../../public/assets/and+dk.png";
import Text_logo from "../../public/assets/d+n_bullshitlogo-removebg-preview.png";

export default function Navbar() {
  return (
    <nav className="bg-[#F0E491] text-white flex justify-start items-center gap-10 shadow-lg">
      <img src="/montadito/assets/and+dk.png" alt="Logo" className="h-24 w-24 object-contain ml-6 py-4" />
      <div className="text-[#658C58] flex gap-15 justify-end underline text-2xl ml-10">
        <Link to="/" className="hover:text-blue-400">Food</Link>
        <Link to="/dates" className="hover:text-blue-400">Dates</Link>
        <Link to="/trips" className="hover:text-blue-400">Trips</Link>
      </div>
      <img src="/montadito/assets/d+n_bullshitlogo-removebg-preview.png" alt="Text Logo" className="h-25 w-auto object-contain ml-auto" />
    </nav>
  );
}