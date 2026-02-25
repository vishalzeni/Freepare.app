import { useEffect, useState } from "react";
import { Home, Search, UserCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";
import User from "../pages/Authentication/User";
import Logo from "../Assets/Freepare_Logo.png";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(true);
  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setShowSearch(location.pathname === "/");
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setIsTokenExpired(true);
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const expiryTime = decodedToken.exp * 1000;
      setIsTokenExpired(expiryTime <= Date.now());
    } catch (error) {
      console.error("Invalid JWT token:", error);
      setIsTokenExpired(true);
    }
  }, [location]);

  const toggleSearch = () => {
    window.dispatchEvent(new CustomEvent("toggleSearch"));
  };

  const handleAuthButtonClick = () => {
    if (isTokenExpired) window.open("/login", "_blank");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 py-2 sm:px-4">
          <Link to="/" className="min-w-[110px] max-w-[190px] flex-1">
            <img src={Logo} alt="FREEPARE Logo" className="h-auto w-full object-contain" />
          </Link>

          {showSearch && (
            <button
              type="button"
              onClick={toggleSearch}
              className="rounded-lg p-2 text-[#066C98] transition hover:bg-slate-100"
              aria-label="Toggle search"
            >
              <Search size={20} />
            </button>
          )}

          {location.pathname !== "/" && (
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#066C98] transition hover:bg-slate-100"
            >
              <Home size={16} />
              Home
            </Link>
          )}

          {location.pathname !== "/admin" && (
            <div className="ml-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-[#066C98] transition hover:bg-slate-100"
              >
                {userImage && !isTokenExpired ? (
                  <img
                    src={userImage}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-sky-100"
                  />
                ) : (
                  <UserCircle2 size={30} />
                )}
                <span className="hidden text-sm font-semibold sm:inline">{userName || ""}</span>
              </button>

              {isTokenExpired && (
                <button
                  type="button"
                  onClick={handleAuthButtonClick}
                  className="rounded-lg bg-[#066C98] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#045472]"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <User
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onUpdateImage={(imageUrl, firstName) => {
          setUserImage(imageUrl);
          setUserName(firstName);
        }}
      />
    </>
  );
};

export default Navbar;

