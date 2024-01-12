// // Function to handle file input change
// document.getElementById("imageInput").addEventListener("change", handleFileSelect);

// function handleFileSelect(event) {
//   const addedImagesContainer = document.getElementById("imagePreviewContainer");
//   addedImagesContainer.innerHTML = ""; // Clear previous content

//   const files = event.target.files;

//   // Display the existing images
//   const existingImageContainer = document.getElementById("existingImageContainer");
//   existingImageContainer.style.display = "block"; // Show the existing image container

//   // Loop through existing images and create HTML elemen
//  (let i = 0; i < product.images.length; i++) {
//     const existingImage = document.createElement("div");
//     existingImage.innerHTML = `
//       <div class="mb-4">
//         <div class="col-12">
//           <img class="rounded" style="width: 50px; height: 60px;" src="/admin/assets/imgs/catogary/<%= product.images[i] %>" alt="image">
//         </div>
//         <div class="col-12">
//           <a href="/api/admin/deleteSingleImage?img=<%= product.images[i] %>&id=<%= product._id %>">
//             <span class="badge rounded-pill alert-danger">Delete</span>
//           </a>
//         </div>
//       </div>
//     `;
//     existingImageContainer.appendChild(existingImage);

//   // Loop through selected files and create HTML elements for preview
//   for (let i = 0; i < files.length; i++) {
//     const file = files[i];

//     const imagePreview = document.createElement("div");
//     imagePreview.innerHTML = `
//       <div class="thumbnail">
//         <img src="${URL.createObjectURL(file)}" alt="thumbnail" style="width: 50px; height: auto;">
//         <span class="remove-icon" onclick="removeImagePreview(this)">&times;</span>
//       </div>
//     `;

//     addedImagesContainer.appendChild(imagePreview);
//   }
// }

// // Function to remove the image preview on icon click
// function removeImagePreview(element) {
//   element.parentElement.remove();
// }
