function validate() {
  const category_name = document.getElementById("category_name");

  const nameError = document.getElementById("nameError");

  const brandRegex = /^[a-zA-Z\s]+$/;

  if (category_name.value.trim() === "") {
    nameError.innerHTML = "category name is required";
    setTimeout(() => {
      nameError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!brandRegex.test(category_name.value)) {
    nameError.innerHTML = "Invalid product name";
    setTimeout(() => {
      nameError.innerHTML = "";
    }, 5000);
    return false;
  }
  return true;
}
function editCatvalidate() {
  const category_name = document.getElementById("editCategoryName");
  const editnameError = document.getElementById("editnameError");
  const brandRegex = /^[a-zA-Z\s]+$/;

  if (category_name.value.trim() === "") {
    editnameError.innerHTML = "category name is required";
    setTimeout(() => {
      editnameError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!brandRegex.test(category_name.value)) {
    editnameError.innerHTML = "Invalid category name";
    setTimeout(() => {
      editnameError.innerHTML = "";
    }, 5000);
    return false;
  }
  return true;
}
