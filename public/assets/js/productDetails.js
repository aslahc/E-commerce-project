const zoomContainer = document.querySelector(".zoom-container");
const zoomImage = document.getElementById("zoom-image");

zoomContainer.addEventListener("mousemove", (e) => {
  const { offsetX, offsetY } = e;
  const { offsetWidth, offsetHeight } = zoomContainer;
  const x = (offsetX / offsetWidth) * 100;
  const y = (offsetY / offsetHeight) * 100;

  zoomImage.style.transform = `translate(-${x}%, -${y}%) scale(2)`;
});

zoomContainer.addEventListener("mouseleave", () => {
  zoomImage.style.transform = "translate(-50%, -50%) scale(1)";
});
