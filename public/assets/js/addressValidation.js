function validate() {
  // Get form fields
  const fullName = document.getElementById("fullName");
  const mobile = document.getElementById("mobile");
  const region = document.getElementById("region");
  const pinCode = document.getElementById("pinCode");
  const addressLine = document.getElementById("addressLine");
  const areaStreet = document.getElementById("areaStreet");
  const landmark = document.getElementById("landmark");
  const townCity = document.getElementById("townCity");
  const state = document.getElementById("state");
  const addressType = document.getElementById("addressType");

  // Get error fields
  const fullNameError = document.getElementById("fullNameError");
  const mobileError = document.getElementById("mobileError");
  const regionError = document.getElementById("regionError");
  const pinCodeError = document.getElementById("pinCodeError");
  const addressLineError = document.getElementById("addressLineError");
  const areaStreetError = document.getElementById("areaStreetError");
  const landmarkError = document.getElementById("landmarkError");
  const townCityError = document.getElementById("townCityError");
  const stateError = document.getElementById("stateError");
  const addressTypeError = document.getElementById("addressTypeError");

  // Regex
  const nameRegex = /^[a-zA-Z0-9\s]+$/;
  const mobileRegex = /^\d{10}$/;
  const pinCodeRegex = /^\d{6}$/;

  // Full Name field
  if (fullName.value.trim() === "") {
    fullNameError.innerHTML = "Full name is required";
    setTimeout(() => {
      fullNameError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!nameRegex.test(fullName.value)) {
    fullNameError.innerHTML = "Invalid name";
    setTimeout(() => {
      fullNameError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Mobile field
  if (mobile.value.trim() === "") {
    mobileError.innerHTML = "Mobile number is required";
    setTimeout(() => {
      mobileError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!mobileRegex.test(mobile.value)) {
    mobileError.innerHTML = "Invalid mobile number";
    setTimeout(() => {
      mobileError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Region field
  if (region.value.trim() === "") {
    regionError.innerHTML = "Region is required";
    setTimeout(() => {
      regionError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Pincode field
  if (pinCode.value.trim() === "") {
    pinCodeError.innerHTML = "Pincode is required";
    setTimeout(() => {
      pinCodeError.innerHTML = "";
    }, 5000);
    return false;
  }
  if (!pinCodeRegex.test(pinCode.value)) {
    pinCodeError.innerHTML = "Invalid pincode";
    setTimeout(() => {
      pinCodeError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Address Line field
  if (addressLine.value.trim() === "") {
    addressLineError.innerHTML = "Address Line is required";
    setTimeout(() => {
      addressLineError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Area, Street, Sector, Village field
  if (areaStreet.value.trim() === "") {
    areaStreetError.innerHTML = "Area, Street, Sector, Village is required";
    setTimeout(() => {
      areaStreetError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Landmark field
  if (landmark.value.trim() === "") {
    landmarkError.innerHTML = "Landmark is required";
    setTimeout(() => {
      landmarkError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Town/City field
  if (townCity.value.trim() === "") {
    townCityError.innerHTML = "Town/City is required";
    setTimeout(() => {
      townCityError.innerHTML = "";
    }, 5000);
    return false;
  }

  // State field
  if (state.value.trim() === "") {
    stateError.innerHTML = "State is required";
    setTimeout(() => {
      stateError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Address Type field
  if (addressType.value.trim() === "") {
    addressTypeError.innerHTML = "Address Type is required";
    setTimeout(() => {
      addressTypeError.innerHTML = "";
    }, 5000);
    return false;
  }

  // Add validation logic for other fields...

  return true;
}
