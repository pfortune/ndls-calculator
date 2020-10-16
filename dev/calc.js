document.addEventListener("DOMContentLoaded", function () {
  const calcButton = document.querySelector("#calc form button");
  const licenceCheckbox = document.querySelector("#calc .licence");
  const error = document.querySelector("#calc .display .error");
  const results = document.querySelector("#calc .display .results");

  let LearningPermitExtensions = {
    firstExtensionInMonths: 8,
    secondExtensionInMonths: 4,
  };
  let DrivingLicenceExtensions = {
    firstExtensionInMonths: 7,
    secondExtensionInMonths: 7,
  };

  function getLicence() {
    return document.querySelector('#calc input[name="type"]:checked').value;
  }
  /**
   * Update the licence type name at top of calculator and in the paragraph
   */

  function updateTitle() {
    let LicenceType = getLicence();
    const title = document.querySelector("#calc .intro h2");
    const description = document.querySelector("#calc .intro p");
    title.innerHTML = titleCase(LicenceType);

    if (LicenceType === "learner permit") {
      description.innerHTML = `Please enter the expiry date as it appears in 4b of your ${LicenceType} card.`;
    }

    if (LicenceType === "driving licence") {
      description.innerHTML = `Please enter the expiry date as it appears in 4b on your ${LicenceType} card or in the third column alongside the categories on your paper driving licence.`;
    }

    clearDisplay();
  }
  /**
   * Is called when calculate button is pressed
   */

  function handle(e) {
    e.preventDefault();
    let expiryDate = document.querySelector("#calc #expiry");

    if (!expiryDate.value || expiryDate.value === "dd/mm/yyyy") {
      displayError("Please enter an expiry date.");
    } else {
      let renewalDates = getRenewalDates(expiryDate.value, getLicence());
      displayResults(renewalDates);
    }
  }
  /**
   * Output messages to error or results divs
   */

  function displayResults(result) {
    clearDisplay();
    localStorage.setItem("calculatorUsed", true);
    results.style.display = "block";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    if (result.extension) {
      results.innerHTML = "\n      <p>New Expiry Date: ".concat(
        result.extension.toLocaleString("en-IE", options),
        "</p>"
      );
    }

    if (result.renewal) {
      results.innerHTML += "\n      <p>Earliest Renewal: ".concat(
        result.renewal.toLocaleString("en-IE", options),
        "</p>"
      );
    }

    if (result.message) {
      results.innerHTML += "<p>".concat(result.message, "</p>");
    }

    console.log(result.shouldRenew);

    if (result.shouldRenew) {
      results.innerHTML +=
        "<p>You need to renew now. <a href='/booking-service.html'>Click here to continue to the booking service page</a></p>";
    } else {
      results.innerHTML +=
        "<p>You do not need to renew. There is no need to make an appointment. It will be refused.</p>";
    }
  }
  /**
   * Output errors to area with error class.
   */

  function displayError(message) {
    error.style.display = "block";
    error.innerHTML = message;
  }
  /**
   * Return a given string in Title Case (Camel Case)
   */

  function titleCase(str) {
    let strLowerCase = str.toLowerCase();
    let wordArr = strLowerCase.split(" ").map(function (currentValue) {
      return currentValue[0].toUpperCase() + currentValue.substring(1);
    });
    return wordArr.join(" ");
  }
  /**
   *
   */

  function getRenewalDates(expiry, licence) {
    let dates = {};

    if (licence == "learner permit") {
      dates = calculateLearnerPermitDates(expiry, LearningPermitExtensions);
    }

    if (licence == "driving licence") {
      dates = calculateDrivingLicenceDates(expiry, DrivingLicenceExtensions);
    }

    dates.shouldRenew = withinRenewalWindow(dates.renewal);

    localStorage.setItem("shouldRenew", dates.shouldRenew);

    return dates;
  }
  /**
   *
   */

  function calculateLearnerPermitDates(expiryDate, licence) {
    var expiry = getExpiryDate(expiryDate);
    var March = new Date("March 01, 2020").getTime();
    var June = new Date("June 30, 2020").getTime();
    var July = new Date("July 01, 2020").getTime();
    var October = new Date("October 31, 2020").getTime();

    if (expiry < March) {
      return {
        message:
          "Expired more than 3 months ago. Renewal required immediately.",
      };
    }

    var June28 = new Date("June 28, 2020").getTime();
    var July1 = new Date("July 1, 2020").getTime();

    if (expiry > June28 && expiry < July1) {
      return {
        extension: new Date("February 28, 2021"),
        renewal: addMonths(
          addDays(expiry, 1),
          licence.firstExtensionInMonths - 3
        ),
      };
    }

    if (expiry >= March && expiry <= June) {
      return {
        extension: addMonths(expiry, licence.firstExtensionInMonths),
        renewal: addMonths(
          addDays(expiry, 1),
          licence.firstExtensionInMonths - 3
        ),
      };
    }

    if (expiry >= July && expiry <= October) {
      return {
        extension: addMonths(expiry, licence.secondExtensionInMonths),
        renewal: addMonths(
          addDays(expiry, 1),
          licence.secondExtensionInMonths - 3
        ),
      };
    }

    if (expiry > October) {
      return {
        extension: "No extension applies.",
        renewal: addMonths(addDays(expiry, 1), -3),
      };
    }
  }

  function calculateDrivingLicenceDates(expiryDate, licence) {
    var expiry = getExpiryDate(expiryDate);
    var March = new Date("March 01, 2020").getTime();
    var June = new Date("June 30, 2020").getTime();
    var July = new Date("July 01, 2020").getTime();
    var September = new Date("September 01, 2020").getTime();

    if (expiry < March) {
      return {
        message:
          "Expired more than 3 months ago. Renewal required immediately.",
      };
    }

    if (expiry >= March && expiry <= June) {
      return {
        extension: addMonths(expiry, licence.firstExtensionInMonths),
        renewal: addMonths(
          addDays(expiry, 1),
          licence.firstExtensionInMonths - 3
        ),
      };
    }

    var July29 = new Date("July 29, 2020").getTime();
    var August1 = new Date("August 1, 2020").getTime();

    if (expiry > July29 && expiry < August1) {
      return {
        extension: new Date("February 28, 2021"),
        renewal: addMonths(
          addDays(expiry, 1),
          licence.firstExtensionInMonths - 3
        ),
      };
    }

    if (expiry >= July && expiry < September) {
      return {
        extension: addMonths(expiry, licence.secondExtensionInMonths),
        renewal: addMonths(
          addDays(expiry, 1),
          licence.secondExtensionInMonths - 3
        ),
      };
    }

    if (expiry >= September) {
      return {
        extension: "No extension applies.",
        renewal: addMonths(addDays(expiry, 1), -3),
      };
    }
  }

  function getExpiryDate(date) {
    if (isModernBrowser()) {
      var expiry = new Date(date);
      return expiry.getTime();
    } else {
      const parts = date.split("/");
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      var expiry = new Date(year, month, day);
      return expiry.getTime();
    }
  }

  /** Check if today is within the earliest renewal date **/
  function withinRenewalWindow(earliestRenewalDate) {
    let today = new Date();

    if (
      today > earliestRenewalDate ||
      typeof earliestRenewalDate === "undefined"
    ) {
      return true;
    }

    return false;
  }

  function isModernBrowser() {
    return Modernizr.inputtypes.date ? true : false;
  }

  if (isModernBrowser() === false) {
    $("#expiry").keypress(function (e) {
      return false;
    });
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + Number(days));
    return result;
  }

  function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + Number(months));
    return result;
  }

  function clearDisplay() {
    error.style.display = "none";
    results.style.display = "none";
    error.innerHTML = "";
    results.innerHTML = "";
  }

  licenceCheckbox.addEventListener("click", updateTitle);
  calcButton.addEventListener("click", handle);
});
