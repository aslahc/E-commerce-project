function openEditModal(categoryId, categoryName) {
  // Clear any previous error messages
  document.getElementById("nameError").innerText = "";

  // Set the category ID and name in the modal form
  document.getElementById("editCategoryId").value = categoryId;
  document.getElementById("editCategoryName").value = categoryName;

  // Show the edit modal
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();
}

// Add this function to validate the form before submission
function validateEditForm() {
  const categoryName = document.getElementById("editCategoryName").value;
  if (!categoryName.trim()) {
    document.getElementById("nameError").innerText =
      "Category name is required";
    return false;
  }
  return true;
}
