import { useEffect } from "react";

const DisableCopy = () => {
  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();
    const disableCopy = (e) => e.preventDefault();
    const disableSelect = (e) => e.preventDefault();

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("copy", disableCopy);
    document.addEventListener("selectstart", disableSelect);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("copy", disableCopy);
      document.removeEventListener("selectstart", disableSelect);
    };
  }, []);

  return null;
};

export default DisableCopy;
