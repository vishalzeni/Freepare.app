export const styles = {
  container: {
    py: 2,
  },
  title: {
    mb: 4,
    background: "linear-gradient(90deg, #066C98, #2CACE3)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "500",
    fontSize: "2.5rem",
  },
  entityBox: (level) => ({
    pl: level * 1.5,
    mb: 1.5,
    position: "relative",
  }),
  entityInnerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  entityHeader: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  dragHandle: {
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    mr: 1,
    "&:active": { cursor: "grabbing" },
  },
  entityTypography: (entity, selectedEntity) => ({
    // Flexbox layout properties
    display: 'flex',
    alignItems: 'center',
  
    // Interaction properties
    cursor: 'pointer',
  
    // Border styling based on selection state
    border: selectedEntity === entity ? '2px solid #1976d2' : 'none',
    
    // Spacing and shape
    padding: '6px 10px',
    borderRadius: '4px',
  
    // Positioning
    position: 'relative',
    zIndex: 1,
  
    // Text formatting based on entity type
    textTransform: entity.type === 'exam' ? 'capitalize' : 'none',
    fontWeight: entity.type === 'exam' 
      ? 'bold' 
      : entity.type === 'subject' 
        ? 'medium' 
        : 'normal',
  
    // Shadow effect for selected state
    boxShadow: selectedEntity === entity 
      ? '0px 2px 8px rgba(93, 174, 255, 0.6)' 
      : 'none',
  
    // Hover state styling
    '&:hover': {
      backgroundColor: '#e3f2fd',
    },
  }),
  entityDescription: {
    mt: 1,
  },
  fixedButtonContainer: {
    position: "fixed",
    bottom: 20,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    zIndex: 999,
    mt: 2,
    flexWrap: "wrap",
    gap: 1,
  },
  undoBox: (position) => ({
    // Positioning properties
    position: "fixed",
    top: position?.top ? `${position.top + 20}px` : "20px",
    left: "50%",
    transform: "translateX(-50%)",
  
    // Layering
    zIndex: 9999,
  
    // Light mode professional colors
    backgroundColor: "#FFFFFF", // Clean white background for fresh look
    border: "1px solid #D1D9E6", // Soft grey border for a subtle frame
    borderRadius: "10px", // Smooth rounded corners for a modern touch
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
  
    // Text and spacing
    color: "#2C3E50", // Dark navy text for strong contrast & readability
    padding: "14px 24px", // Balanced spacing for a neat appearance
    fontSize: "16px", // Optimal readability
    fontWeight: 500, // Medium weight for a clean, professional feel
  
    // Smooth transitions
    transition: "all 0.3s ease-in-out",
  
  
    // Enhanced layout & usability
    maxWidth: "420px", // Optimized width
    display: "flex", // Flexbox for structured layout
    alignItems: "center", // Align elements properly
    justifyContent: "space-between", // Evenly spaced text and button
    gap: "16px", // Consistent spacing
  }),
  
  loadingContainer: {
    py: 2,
    textAlign: "center",
  },
  fullScreenOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 1300,
  },
};
