function blockOrUnBlockUser(userId) {
  console.log("entering")
  console.log(userId)
  $.ajax({
    type: "PUT",
    url: `/admin/users/${userId}/block`,
    success: function (response) {
      location.reload()
      const buttonText = response.is_block ? "UnBlock" : "Block";
      // Update text of the link inside the corresponding td
      $(`#${userId} a`).text(buttonText); // Fix the jQuery selector here
    },  
    error: function (error) {
      console.error(error);
    },
  });
}