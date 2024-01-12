const name = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const mobile = document.getElementById("mobile");

//Add event lisnter on container

const submit = document.getElementsByClassName("form-contact")[0];

submit.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Clicked");
});

Email.send({
  Host: "smtp.elasticemail.com",
  Username: "username",
  Password: "4f78fdbe-d130-49b1-890e-e1416fab9507",
  To: "aslahcholasseri@gmail.com",
  From: "aslahcq@gmail.com",
  Subject: "testing email",
  Body: "And this is the body",
}).then((message) => alert(message));
