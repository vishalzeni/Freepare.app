import { useEffect } from "react";

const DisableCapture = () => {
  useEffect(() => {
    // Function to blur the screen
    const blurScreen = () => {
      document.body.style.filter = "blur(15px)"; // Apply blur
      document.body.style.pointerEvents = "none"; // Disable interactions
      setTimeout(() => {
        document.body.style.filter = "none"; // Remove blur
        document.body.style.pointerEvents = "auto"; // Restore interactions
      }, 1000); // Blur lasts for 1 second
    };

    // Disable right-click (context menu)
    const disableRightClick = (e) => {
      e.preventDefault();
      blurScreen();
    };

    // Disable copy
    const disableCopy = (e) => {
      e.preventDefault();
      e.clipboardData.setData("text/plain", ""); // Clear clipboard
      blurScreen();
    };

    // Disable text selection
    const disableSelect = (e) => e.preventDefault();

    // Disable common keyboard shortcuts
    const disableShortcuts = (e) => {
      // Ctrl+C (Copy), Ctrl+S (Save), Ctrl+P (Print), PrintScreen, Alt+PrintScreen
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "s" || e.key === "p")) ||
        e.key === "PrintScreen" ||
        (e.altKey && e.key === "PrintScreen") ||
        e.key === "Meta" || // Mac Command key
        e.key === "F12" || // Developer tools
        (e.ctrlKey && e.shiftKey && e.key === "I") // Dev tools shortcut
      ) {
        e.preventDefault();
        e.stopPropagation();
        blurScreen();
        return false;
      }
    };

    // Disable print (Ctrl+P or Cmd+P)
    const disablePrint = (e) => {
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        blurScreen();
      }
    };

    // Attempt to detect and deter screenshots
    const detectScreenshot = () => {
      if (document.hidden) {
        // Blur content and add overlay when tab is not in focus
        document.body.style.filter = "blur(15px)";
        document.body.style.pointerEvents = "none";
        const overlay = document.createElement("div");
        overlay.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.9); color: white; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          text-align: center; font-size: 24px;
        `;
        overlay.innerHTML = "Content capture is not allowed by Freepare.";
        document.body.appendChild(overlay);

        setTimeout(() => {
          document.body.style.filter = "none";
          document.body.style.pointerEvents = "auto";
          overlay.remove();
        }, 2000); // Longer duration for screenshot attempt
      }
    };

    // Block beforeprint event (triggered by Ctrl+P or Print dialog)
    const blockPrint = (e) => {
      e.preventDefault();
      blurScreen();
    };

    // Add event listeners
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("copy", disableCopy);
    document.addEventListener("selectstart", disableSelect);
    document.addEventListener("keydown", disableShortcuts);
    document.addEventListener("keypress", disablePrint);
    document.addEventListener("visibilitychange", detectScreenshot);
    window.addEventListener("beforeprint", blockPrint);

    // CSS protections
    document.body.style.userSelect = "none"; // Disable text selection
    document.body.style.webkitUserSelect = "none"; // Safari
    document.body.style.MozUserSelect = "none"; // Firefox
    document.body.style.msUserSelect = "none"; // IE/Edge

    // Prevent image dragging
    document.querySelectorAll("img").forEach((img) => {
      img.setAttribute("draggable", "false");
      img.addEventListener("dragstart", (e) => e.preventDefault());
    });

    // Cleanup on unmount
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("copy", disableCopy);
      document.removeEventListener("selectstart", disableSelect);
      document.removeEventListener("keydown", disableShortcuts);
      document.removeEventListener("keypress", disablePrint);
      document.removeEventListener("visibilitychange", detectScreenshot);
      window.removeEventListener("beforeprint", blockPrint);

      // Reset styles
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.body.style.MozUserSelect = "";
      document.body.style.msUserSelect = "";
      document.body.style.filter = "";
      document.body.style.pointerEvents = "";
    };
  }, []);

  return null; // This component doesn't render anything
};

export default DisableCapture;