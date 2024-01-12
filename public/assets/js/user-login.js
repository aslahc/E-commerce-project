const passwordInput = document.getElementById("passwordInput");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.classList.toggle("fa-eye-slash");
});
