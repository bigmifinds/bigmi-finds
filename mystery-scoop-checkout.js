/* =========================================
   BIGMI FINDS — MYSTERY SCOOP CHECKOUT
   Separate Order System
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwbRVa_9TxCi6BJXOUQ9lkpoVO2ehKjgm_BSV6uE1co_4QuTGHNEEWdDImO_gK9xKyYUQ/exec";


  /* =========================
     BOOKING DATA
  ========================= */

  const booking =
    JSON.parse(
      localStorage.getItem("mysteryScoopBooking")
    );

  if (!booking) {
    alert("Mystery Scoop booking details not found.");
    window.location.href = "mystery-scoop.html";
    return;
  }


  /* =========================
     ELEMENTS
  ========================= */

  const fullName =
    document.getElementById("full-name");

  const phone =
    document.getElementById("phone");

  const email =
    document.getElementById("email");

  const address =
    document.getElementById("address");

  const city =
    document.getElementById("city");

  const pinCode =
    document.getElementById("pin-code");

  const paymentScreenshot =
    document.getElementById("payment-screenshot");

  const prepaidSection =
    document.getElementById("prepaid-section");

  const codNote =
    document.getElementById("cod-note");

  const placeOrderButton =
    document.getElementById("place-mystery-order");


  /* =========================
     SUMMARY
  ========================= */

  document.getElementById("checkout-scoop").textContent =
    booking.scoopType || "—";

  document.getElementById("checkout-size").textContent =
    booking.size?.name || "—";

  document.getElementById("checkout-quantity").textContent =
    booking.quantity || "—";

  document.getElementById("checkout-colors").textContent =
    booking.colorPreference || "No preference";

  document.getElementById("checkout-collaboration").textContent =
    booking.collaboration || "No";

  document.getElementById("checkout-request").textContent =
    booking.specialRequest || "None";


  document.getElementById("product-total").textContent =
    `₹${Number(booking.productTotal).toLocaleString("en-IN")}`;

  document.getElementById("shipping-total").textContent =
    booking.shipping > 0
      ? `₹${Number(booking.shipping).toLocaleString("en-IN")}`
      : "FREE";

  document.getElementById("grand-total").textContent =
    `₹${Number(booking.grandTotal).toLocaleString("en-IN")}`;


  /* =========================
     COD CITY CHECK
  ========================= */

  function isCODAvailable(cityName) {

    const normalizedCity =
      cityName.trim().toLowerCase();

    return (
      normalizedCity === "berhampur" ||
      normalizedCity === "brahmapur"
    );
  }


  function updatePaymentOptions() {

    const cityValue =
      city.value.trim();

    const codOption =
      document.querySelector(
        'input[name="payment"][value="cod"]'
      );

    const codLabel =
      codOption
        ? codOption.closest(".payment-option")
        : null;


    /* City empty → COD visible */

    if (!cityValue) {

      if (codLabel) {
        codLabel.style.display = "flex";
      }

      if (codNote) {
        codNote.style.display = "none";
      }

      return;
    }


    /* Berhampur / Brahmapur */

    if (isCODAvailable(cityValue)) {

      if (codLabel) {
        codLabel.style.display = "flex";
      }

      if (codNote) {
        codNote.style.display = "block";
      }

    }

    /* Other cities */

    else {

      if (codLabel) {
        codLabel.style.display = "none";
      }

      if (codNote) {
        codNote.style.display = "none";
      }

      if (codOption && codOption.checked) {
        codOption.checked = false;
      }

      if (prepaidSection) {
        prepaidSection.style.display = "none";
      }
    }
  }


  /* =========================
     PAYMENT DISPLAY
  ========================= */

  function updatePrepaidSection() {

    const selectedPayment =
      document.querySelector(
        'input[name="payment"]:checked'
      );

    if (
      selectedPayment &&
      selectedPayment.value === "prepaid"
    ) {

      prepaidSection.style.display = "block";

    } else {

      prepaidSection.style.display = "none";

    }
  }


  document
    .querySelectorAll('input[name="payment"]')
    .forEach(input => {

      input.addEventListener(
        "change",
        updatePrepaidSection
      );

    });


  city.addEventListener(
    "input",
    updatePaymentOptions
  );


  /* Initial state */

  updatePaymentOptions();
  updatePrepaidSection();


  /* =========================
     FILE → BASE64
  ========================= */

  function fileToBase64(file) {

    return new Promise(
      (resolve, reject) => {

        const reader =
          new FileReader();

        reader.onload = () => {

          const base64 =
            reader.result.split(",")[1];

          resolve(base64);

        };

        reader.onerror =
          () => reject(
            new Error(
              "Unable to read screenshot."
            )
          );

        reader.readAsDataURL(file);

      }
    );
  }


  /* =========================
     PLACE ORDER
  ========================= */

  placeOrderButton.addEventListener(
    "click",
    async () => {

      /* Required details */

      if (!fullName.value.trim()) {
        alert("Please enter your full name.");
        fullName.focus();
        return;
      }

      if (!phone.value.trim()) {
        alert("Please enter your phone number.");
        phone.focus();
        return;
      }

      if (!address.value.trim()) {
        alert("Please enter your delivery address.");
        address.focus();
        return;
      }

      if (!city.value.trim()) {
        alert("Please enter your city.");
        city.focus();
        return;
      }

      if (!pinCode.value.trim()) {
        alert("Please enter your PIN code.");
        pinCode.focus();
        return;
      }


      /* Payment */

      const selectedPayment =
        document.querySelector(
          'input[name="payment"]:checked'
        );

      if (!selectedPayment) {

        alert(
          "Please select a payment method."
        );

        return;
      }


      const paymentMethod =
        selectedPayment.value;


      /* COD validation */

      if (
        paymentMethod === "cod" &&
        !isCODAvailable(city.value)
      ) {

        alert(
          "Cash on Delivery is available only for Berhampur / Brahmapur."
        );

        return;
      }


      /* Prepaid screenshot */

      let screenshot = null;

      if (paymentMethod === "prepaid") {

        if (
          !paymentScreenshot.files ||
          !paymentScreenshot.files[0]
        ) {

          alert(
            "Please upload your payment screenshot."
          );

          return;
        }


        const file =
          paymentScreenshot.files[0];

        try {

          const base64 =
            await fileToBase64(file);

          screenshot = {

            name: file.name,

            type:
              file.type || "image/jpeg",

            data: base64

          };

        } catch (error) {

          alert(
            "Unable to read the payment screenshot."
          );

          return;
        }
      }


      /* =========================
         ORDER DATA
      ========================= */

      const orderData = {

        fullName:
          fullName.value.trim(),

        phone:
          phone.value.trim(),

        email:
          email.value.trim(),

        address:
          address.value.trim(),

        city:
          city.value.trim(),

        pinCode:
          pinCode.value.trim(),

        scoopType:
          booking.scoopType,

        size:
          booking.size?.name || "",

        quantity:
          booking.quantity,

        colorPreference:
          booking.colorPreference || "",

        collaboration:
          booking.collaboration || "",

        specialRequest:
          booking.specialRequest || "",

        productTotal:
          booking.productTotal,

        shipping:
          booking.shipping,

        grandTotal:
          booking.grandTotal,

        payment:
          paymentMethod,

        screenshot:
          screenshot

      };


      /* =========================
         BUTTON STATE
      ========================= */

      placeOrderButton.disabled = true;

      const originalText =
        placeOrderButton.textContent;

      placeOrderButton.textContent =
        "Placing Order...";


      /* =========================
         SEND TO GOOGLE SHEET
      ========================= */

      try {

        const response =
          await fetch(
            SCRIPT_URL,
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "text/plain;charset=utf-8"
              },

              body:
                JSON.stringify(orderData)

            }
          );


        const result =
          await response.json();


        if (
          result.result === "success"
        ) {

          localStorage.removeItem(
            "mysteryScoopBooking"
          );

          window.location.href =
            "mystery-scoop-success.html";

        } else {

          throw new Error(
            result.message ||
            "Order submission failed."
          );

        }


      } catch (error) {

        console.error(
          "Mystery Scoop order error:",
          error
        );

        alert(
          "Something went wrong while placing your order. Please try again."
        );

        placeOrderButton.disabled =
          false;

        placeOrderButton.textContent =
          originalText;

      }

    }
  );

});