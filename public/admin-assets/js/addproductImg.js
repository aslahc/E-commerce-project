// Function to handle file input change
document
  .getElementById("imageInput")
  .addEventListener("change", handleFileSelect);

function handleFileSelect(event) {
  const addedImagesContainer = document.getElementById("addedImagesContainer");
  addedImagesContainer.innerHTML = ""; // Clear previous content

  const files = event.target.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Create thumbnail element
    const thumbnail = document.createElement("div");
    thumbnail.classList.add("thumbnail");

    // Create image element
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = "thumbnail";

    // Set a fixed width for the image
    img.style.width = "50px"; // Adjust the width as needed
    img.style.height = "auto";

    // Create remove icon
    const removeIcon = document.createElement("span");
    removeIcon.classList.add("remove-icon");
    removeIcon.innerHTML = "&times;"; // Multiplication symbol as a cross

    // Event listener to remove the image on icon click
    removeIcon.addEventListener("click", function () {
      thumbnail.remove();
    });

    // Append elements to thumbnail
    thumbnail.appendChild(img);
    thumbnail.appendChild(removeIcon);

    // Append thumbnail to the container
    addedImagesContainer.appendChild(thumbnail);
  }
}
