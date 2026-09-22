
/* =========================================
   BIGMI FINDS — MYSTERY SCOOP JS
   Separate Mystery Scoop System
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* -----------------------------------------
     SCOOP PRICES
  ----------------------------------------- */

  const scoopData = {
    mini: {
      name: "Mini",
      price: 299,
      shipping: 29
    },

    medium: {
      name: "Medium",
      price: 499,
      shipping: 0
    },

    large: {
      name: "Large",
      price: 699,
      shipping: 0
    }
  };


  /* -----------------------------------------
     VARIABLES
  ----------------------------------------- */

  let quantity = 1;

  const quantityDisplay = document.getElementById("quantity");
  const decreaseButton = document.getElementById("decrease-qty");
  const increaseButton = document.getElementById("increase-qty");

  const totalPrice = document.getElementById("total-price");

  const summaryScoop = document.getElementById("summary-scoop");
  const summarySize = document.getElementById("summary-size");
  const summaryQuantity = document.getElementById("summary-quantity");

  const bookButton = document.getElementById("book-scoop");


  /* -----------------------------------------
     GET SELECTED SCOOP TYPE
  ----------------------------------------- */

  function getSelectedScoopType() {

    const selected = document.querySelector(
      'input[name="scoop-type"]:checked'
    );

    if (!selected) {
      return null;
    }

    const names = {
      mix: "Mix",
      accessories: "Accessories",
      stationery: "Stationery"
    };

    return names[selected.value] || selected.value;
  }


  /* -----------------------------------------
     GET SELECTED SIZE
  ----------------------------------------- */

  function getSelectedSize() {

    const selected = document.querySelector(
      'input[name="scoop-size"]:checked'
    );

    if (!selected) {
      return null;
    }

    return scoopData[selected.value]
      ? {
          key: selected.value,
          ...scoopData[selected.value]
        }
      : null;
  }


  /* -----------------------------------------
     UPDATE SUMMARY & TOTAL
  ----------------------------------------- */

  function updateSummary() {

    const scoopType = getSelectedScoopType();
    const size = getSelectedSize();

    /* Quantity */
    quantityDisplay.textContent = quantity;
    summaryQuantity.textContent = quantity;


    /* Scoop type */
    if (scoopType) {
      summaryScoop.textContent = scoopType;
    } else {
      summaryScoop.textContent = "Not selected";
    }


    /* Size */
    if (size) {
      summarySize.textContent = size.name;
    } else {
      summarySize.textContent = "Not selected";
    }


    /* Total */
    if (!size) {
      totalPrice.textContent = "—";
      return;
    }

    const productTotal = size.price * quantity;
    const shippingTotal = size.shipping;

    const grandTotal = productTotal + shippingTotal;

    totalPrice.textContent =
      `₹${grandTotal.toLocaleString("en-IN")}`;
  }


  /* -----------------------------------------
     QUANTITY — DECREASE
  ----------------------------------------- */

  decreaseButton.addEventListener("click", () => {

    if (quantity > 1) {
      quantity--;

      updateSummary();
    }

  });


  /* -----------------------------------------
     QUANTITY — INCREASE
  ----------------------------------------- */

  increaseButton.addEventListener("click", () => {

    /* Maximum 10 scoops per booking */
    if (quantity < 10) {
      quantity++;

      updateSummary();
    }

  });


  /* -----------------------------------------
     SCOOP TYPE CHANGE
  ----------------------------------------- */

  document
    .querySelectorAll('input[name="scoop-type"]')
    .forEach(input => {

      input.addEventListener("change", () => {
        updateSummary();
      });

    });


  /* -----------------------------------------
     SIZE CHANGE
  ----------------------------------------- */

  document
    .querySelectorAll('input[name="scoop-size"]')
    .forEach(input => {

      input.addEventListener("change", () => {
        updateSummary();
      });

    });


  /* -----------------------------------------
     BOOK MYSTERY SCOOP
  ----------------------------------------- */

  bookButton.addEventListener("click", () => {

    const scoopType = getSelectedScoopType();
    const size = getSelectedSize();

    /* Check scoop type */
    if (!scoopType) {

      alert("Please choose your scoop type ✨");

      return;
    }


    /* Check size */
    if (!size) {

      alert("Please choose your scoop size 💕");

      return;
    }


    /* Get preferences */
    const colorPreference =
      document
        .getElementById("color-preference")
        .value
        .trim();


    const specialRequest =
      document
        .getElementById("special-request")
        .value
        .trim();


    const collaboration =
      document.querySelector(
        'input[name="collaboration"]:checked'
      );


    /* -----------------------------------------
       TEMPORARY BOOKING DATA
       
       This is NOT the normal cart.
       It is only used to carry the Mystery
       Scoop details to its separate checkout.
    ----------------------------------------- */

    const bookingData = {

      scoopType: scoopType,

      size: {
        key: size.key,
        name: size.name,
        price: size.price,
        shipping: size.shipping
      },

      quantity: quantity,

      colorPreference: colorPreference,

      specialRequest: specialRequest,

      collaboration: collaboration
        ? collaboration.value
        : "",

      productTotal: size.price * quantity,

      shipping: size.shipping,

      grandTotal:
        (size.price * quantity) + size.shipping

    };


    /* -----------------------------------------
       SAVE ONLY MYSTERY SCOOP DATA
    ----------------------------------------- */

    localStorage.setItem(
      "mysteryScoopBooking",
      JSON.stringify(bookingData)
    );


    /* -----------------------------------------
       GO TO SEPARATE CHECKOUT
    ----------------------------------------- */

    window.location.href =
      "mystery-scoop-checkout.html";

  });


  /* -----------------------------------------
     INITIAL STATE
  ----------------------------------------- */

  updateSummary();

});

