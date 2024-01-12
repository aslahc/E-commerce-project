function validate() {
  const productName = document.getElementById("product_title");
  const brand = document.getElementById("product_brand");
  const regPrice = document.getElementById("product_regPrice");

  const size = document.getElementById("product_size");
  const description = document.getElementById("prod_description");
  const stock = document.getElementById("prod_stock");

  // Error feilds
  const productNameError = document.getElementById("nameError");
  const brandError = document.getElementById("randError");
  const regPriceError = document.getElementById("regPriceError");

  const sizeError = document.getElementById("sizeError");
  const descriptionError = document.getElementById("descError");
  const stockError = document.getElementById("sotckError");

  // Regex
  const productNameRegex = /^[a-zA-Z0-9\s]+$/;
  const brandRegex = /^[a-zA-Z\s]+$/;
  const regPriceRegex = /^\d+(\.\d{1,2})?$/;
  const salePriceRegex = /^\d+(\.\d{1,2})?$/;
  const sizeRegex = /^(S|M|XL|XXL)$/;
  const descriptionRegex = /^.{11,}$/;
  const stockrRegex = /^[0-9]+$/;

  //name feild
  if (productName.value.trim() === "") {
    productNameError.innerHTML = "Product name is required";
    setTimeout(() => {
      productNameError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!productNameRegex.test(productName.value)) {
    productNameError.innerHTML = "Invalid product name";
    setTimeout(() => {
      productNameError.innerHTML = "";
    }, 5000);
    return false;
  }

  // email feild
  if (brand.value.trim() === "") {
    brandError.innerHTML = "Brand is required";
    setTimeout(() => {
      brandError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!brandRegex.test(brand.value)) {
    brandError.innerHTML = "Invalid brand name";
    setTimeout(() => {
      brandError.innerHTML = "";
    }, 5000);
    return false;
  }

  // password feild
  if (regPrice.value.trim() === "") {
    regPriceError.innerHTML = "Regular price is required";
    setTimeout(() => {
      regPriceError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!regPriceRegex.test(regPrice.value)) {
    regPriceError.innerHTML = "Invalid regular price";
    setTimeout(() => {
      regPriceError.innerHTML = "";
    }, 5000);
    return false;
  }

  //mobile feild

  if (size.value.trim() === "") {
    sizeError.innerHTML = "Size is required";
    setTimeout(() => {
      sizeError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!sizeRegex.test(size.value)) {
    sizeError.innerHTML = "Invalid size";
    setTimeout(() => {
      sizeError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (description.value.trim() === "") {
    descriptionError.innerHTML = "Description is required";
    setTimeout(() => {
      descriptionError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!descriptionRegex.test(description.value)) {
    descriptionError.innerHTML = "  Your description is 11 characters or more";
    setTimeout(() => {
      descriptionError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (stock.value.trim() === "") {
    stockError.innerHTML = "Stock quantity is required";
    setTimeout(() => {
      stockError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!stockrRegex.test(stock.value)) {
    stockError.innerHTML = "Invalid stock quantity";
    setTimeout(() => {
      stockError.innerHTML = "";
    }, 5000);
    return false;
  }
  return true;
}

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
