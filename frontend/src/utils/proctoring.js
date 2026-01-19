export const enableProctoring = (onViolation) => {
  const blurHandler = () => onViolation("Tab switch detected");
  const copyHandler = (e) => e.preventDefault();
  const keyHandler = (e) => {
    if (e.ctrlKey || e.key === "PrintScreen") e.preventDefault();
  };

  window.addEventListener("blur", blurHandler);
  document.addEventListener("copy", copyHandler);
  document.addEventListener("contextmenu", copyHandler);
  document.addEventListener("keydown", keyHandler);

  return () => {
    window.removeEventListener("blur", blurHandler);
    document.removeEventListener("copy", copyHandler);
    document.removeEventListener("contextmenu", copyHandler);
    document.removeEventListener("keydown", keyHandler);
  };
};
