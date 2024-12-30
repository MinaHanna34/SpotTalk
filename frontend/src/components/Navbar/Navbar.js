import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="w-full border-b border-gray-200 px-8 py-4 flex justify-between items-center bg-white">
      {/* Left Section: About Link */}
      <div className="flex items-center">
        
      </div>

      {/* Center Section: Title */}
      <div className="flex justify-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
        Canbyr
        </Link>
      </div>

      {/* Right Section: Contact and Login/Signup */}
      <div className="flex items-center space-x-6">
        <Link href="/contact" className="text-gray-800 hover:text-blue-600">
          Contact
        </Link>
        <Link href="/login" className="text-gray-800 hover:text-blue-600">
          Log in
        </Link>
        <Link
          href="/auth/signup"
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
