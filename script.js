/* =====================================================
   BIGMI FINDS - COMPLETE MAIN SCRIPT
   Cart + Product Detail + Checkout + Payment + Google Sheet
   ===================================================== */


/* =====================================================
   SETTINGS
   ===================================================== */

const MINIMUM_ORDER = 199;
const FREE_SHIPPING_LIMIT = 499;
const SHIPPING_PER_PRODUCT = 9;


/* =====================================================
   GOOGLE SHEET
   ===================================================== */

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzXHeFpCckEfPIJBcIBqjZGlUJAuPZ5hoU4QKqJsd2_7fJ8ZiBU4bxiVr6pVer_f8jR/exec";


/* ==============================
   PRODUCT DETAILS
   ============================== */

function openProductDetails(
    product,
    card
) {

    const overlay =
        document.querySelector(
            ".product-details-overlay"
        );

    if (!overlay) return;


    const nameElement =
        overlay.querySelector(
            ".details-product-name"
        );

    const ratingElement =
        overlay.querySelector(
            ".details-product-rating"
        );

    const includedList =
        overlay.querySelector(
            ".details-included-list"
        );


    if (nameElement) {

        nameElement.textContent =
            product.name;

    }


    if (ratingElement) {

        ratingElement.textContent =
            product.rating;

    }


    /*
       अभी Included items
       card के अंदर से पढ़ेंगे.
    */

    if (includedList) {

        includedList.innerHTML = "";

        const includedItems =
            card.querySelectorAll(
                ".product-included li"
            );


        if (includedItems.length > 0) {

            includedItems.forEach(
                function(item) {

                    const li =
                        document.createElement("li");

                    li.textContent =
                        item.textContent.trim();

                    includedList.appendChild(li);

                }
            );

        } else {

            const li =
                document.createElement("li");

            li.textContent =
                "Details coming soon";

            includedList.appendChild(li);

        }

    }


    overlay.classList.add("active");

}

/* =====================================================
   CART
   ===================================================== */

let cart =
    JSON.parse(localStorage.getItem("bigmiCart")) || [];


/* =====================================================
   SAVE CART
   ===================================================== */

function saveCart() {

    localStorage.setItem(
        "bigmiCart",
        JSON.stringify(cart)
    );
}


/* =====================================================
   UPDATE CART COUNT
   ===================================================== */

function updateCartCount() {

    const cartCount =
        document.getElementById("cart-count");

    if (!cartCount) return;

    const totalQuantity =
        cart.reduce(function(total, item) {

            return total +
                Number(item.quantity || 1);

        }, 0);

    cartCount.textContent = totalQuantity;
}


/* ADD PRODUCT TO CART */
function addToCart(product, quantity = 1) {
    if (!product) return false;

    const existingProduct = cart.find(function(item) {
        return item.id === product.id || item.name === product.name;
    });

    if (existingProduct) {
        existingProduct.id = product.id;
        existingProduct.name = product.name;
        existingProduct.price = Number(product.price);
        existingProduct.image = product.image;
        existingProduct.quantity =
            Number(existingProduct.quantity || 1) + Number(quantity);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: Number(quantity)
        });
    }

    saveCart();
    updateCartCount();

    return true;
}


/* =====================================================
   REMOVE FROM CART
   ===================================================== */

function removeFromCart(productId) {

    cart = cart.filter(function(item) {

        return item.id !== productId;

    });

    saveCart();
    updateCartCount();
    displayCart();
}


/* =====================================================
   CHANGE CART QUANTITY
   ===================================================== */

function changeQuantity(productId, change) {

    const product =
        cart.find(function(item) {

            return item.id === productId;

        });

    if (!product) return;

    product.quantity =
        Number(product.quantity || 1) + change;

    if (product.quantity <= 0) {

        cart = cart.filter(function(item) {

            return item.id !== productId;

        });
    }

    saveCart();
    updateCartCount();
    displayCart();
}


/* =====================================================
   CALCULATE SUBTOTAL
   ===================================================== */

function calculateSubtotal() {

    return cart.reduce(function(total, item) {

        return total +
            (
                Number(item.price) *
                Number(item.quantity || 1)
            );

    }, 0);
}


/* ==============================
   SHIPPING CALCULATION
   ============================== */

function calculateShipping(subtotal) {

    /* ₹499+ = FREE */

    if (
        subtotal >= FREE_SHIPPING_LIMIT
    ) {

        return 0;

    }


    /* Below ₹199 */

    if (
        subtotal < MINIMUM_ORDER
    ) {

        return 0;

    }


    /* ₹9 × total quantity */

    const totalQuantity =
        cart.reduce(
            function(total, item) {

                return total +
                    Number(
                        item.quantity || 1
                    );

            },
            0
        );


    return (
        totalQuantity *
        SHIPPING_PER_PRODUCT
    );

}

/* =====================================================
   DISPLAY CART
   ===================================================== */

function displayCart() {

    const cartItems =
        document.getElementById("cart-items");

    const emptyCart =
        document.getElementById("empty-cart");

    const cartSummary =
        document.getElementById("cart-summary");

    if (!cartItems) return;


    /* EMPTY CART */

    if (cart.length === 0) {

        cartItems.innerHTML = "";

        if (emptyCart) {
            emptyCart.style.display = "block";
        }

        if (cartSummary) {
            cartSummary.style.display = "none";
        }

        return;
    }


    /* CART HAS PRODUCTS */

    if (emptyCart) {
        emptyCart.style.display = "none";
    }

    if (cartSummary) {
        cartSummary.style.display = "block";
    }


    cartItems.innerHTML = "";


    cart.forEach(function(item) {

        const cartItem =
            document.createElement("div");

        cartItem.className = "cart-item";


        cartItem.innerHTML = `

            <div class="cart-item-image">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

            </div>


            <div class="cart-item-info">

                <h3>
                    ${item.name}
                </h3>

                <p class="cart-item-price">
                    ₹${Number(item.price)}
                </p>

            </div>


            <div class="cart-quantity">

                <button
                    type="button"
                    onclick="changeQuantity('${item.id}', -1)"
                >
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button
                    type="button"
                    onclick="changeQuantity('${item.id}', 1)"
                >
                    +
                </button>

            </div>


            <button
                type="button"
                class="remove-cart-item"
                onclick="removeFromCart('${item.id}')"
            >
                Remove
            </button>

        `;


        cartItems.appendChild(cartItem);

    });


    updateCartSummary();
}


/* =====================================================
   UPDATE CART SUMMARY
   ===================================================== */

function updateCartSummary() {

    const subtotal =
        calculateSubtotal();

    const shipping =
        calculateShipping(subtotal);

    const total =
        subtotal + shipping;


    const subtotalElement =
        document.getElementById("cart-subtotal");

    const shippingElement =
        document.getElementById("cart-shipping");

    const totalElement =
        document.getElementById("cart-total");

    const shippingMessage =
        document.getElementById("shipping-message");

    const minimumMessage =
        document.getElementById("minimum-order-message");

    const checkoutButton =
        document.getElementById("checkout-button");


    /* SUBTOTAL */

    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${subtotal}`;

    }


    /* SHIPPING */

    if (shippingElement) {

        if (subtotal >= FREE_SHIPPING_LIMIT) {

            shippingElement.textContent =
                "FREE";

        } else {

            shippingElement.textContent =
                `₹${shipping}`;

        }
    }


    /* TOTAL */

    if (totalElement) {

        totalElement.textContent =
            `₹${total}`;

    }


    /* MINIMUM ORDER */

    if (subtotal < MINIMUM_ORDER) {

        const remaining =
            MINIMUM_ORDER - subtotal;


        if (minimumMessage) {

            minimumMessage.textContent =
                `Add ₹${remaining} more to reach the minimum order value of ₹199.`;

        }


        if (checkoutButton) {

            checkoutButton.style.opacity = "0.5";

            checkoutButton.style.pointerEvents =
                "none";

            checkoutButton.textContent =
                "Minimum Order ₹199";

        }

    } else {

        if (minimumMessage) {

            minimumMessage.textContent =
                "Minimum order value: ₹199";

        }


        if (checkoutButton) {

            checkoutButton.style.opacity = "1";

            checkoutButton.style.pointerEvents =
                "auto";

            checkoutButton.textContent =
                "Proceed to Checkout →";

        }
    }


    /* SHIPPING MESSAGE */

    if (shippingMessage) {

        if (subtotal >= FREE_SHIPPING_LIMIT) {

            shippingMessage.textContent =
                "🎉 You unlocked FREE SHIPPING!";

        } else if (subtotal >= MINIMUM_ORDER) {

            shippingMessage.textContent =
                "Shipping charges are calculated according to the products in your cart.";

        } else {

            shippingMessage.textContent =
                "Add more products to reach the minimum order value.";

        }
    }
}


/* PRODUCT CARDS */
function setupProductCards() {

    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach(function(card) {

        const nameElement = card.querySelector(".product-name");
        const priceElement = card.querySelector(".product-price");
        const imageElement = card.querySelector("img");
        const ratingElement = card.querySelector(".product-rating");
        const badgeElement = card.querySelector(".product-badge");
        const quantitySelect = card.querySelector(".quantity-select");
        const addButton = card.querySelector(".add-cart-btn");
        const imageArea = card.querySelector(".product-image");

        if (!nameElement || !priceElement || !imageElement) {
            return;
        }

        const product = {
            id:
                nameElement.textContent
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-"),

            name: nameElement.textContent.trim(),

            price:
                Number(
                    priceElement.textContent.replace(/[^0-9.]/g, "")
                ),

            image: imageElement.getAttribute("src"),

            rating:
                ratingElement
                    ? ratingElement.textContent.trim()
                    : "",

            badge:
                badgeElement
                    ? badgeElement.textContent.trim()
                    : ""
        };

        if (addButton) {

            addButton.addEventListener("click", function() {

                const quantity = quantitySelect
                    ? Number(quantitySelect.value)
                    : 1;

                addToCart(product, quantity);

                alert(product.name + " added to cart 🛒");
            });
        }

        if (imageArea) {

            imageArea.addEventListener("click", function() {
                openProductDetails(card, product);
            });
        }
    });
}

/* PRODUCT DETAILS BOTTOM SHEET */
function openProductDetails(card, product) {

    const overlay =
        document.querySelector(".product-details-overlay");

    if (!overlay) return;

    const name =
        overlay.querySelector(".details-product-name");

    const rating =
        overlay.querySelector(".details-product-rating");

    const price =
        overlay.querySelector(".details-product-price");

    const includedList =
        overlay.querySelector(".details-included-list");

    const included =
        card.querySelectorAll(".product-included li");

    const color =
    overlay.querySelector(".details-color");

const design =
    overlay.querySelector(".details-design");

if (color) {
    color.textContent =
        card.dataset.color || "Not specified";
}

if (design) {
    design.textContent =
        card.dataset.design || "Not specified";
}

    if (name) {
        name.textContent = product.name;
    }

    if (rating) {
        rating.textContent = product.rating;
    }

    if (price) {
        price.textContent = "₹" + product.price;
    }

    if (includedList) {

        includedList.innerHTML = "";

        included.forEach(function(item) {

            const li = document.createElement("li");

            li.textContent = item.textContent;

            includedList.appendChild(li);
        });
    }

    overlay.classList.add("active");
}


/* CLOSE PRODUCT DETAILS */
function closeProductDetails() {

    const overlay =
        document.querySelector(".product-details-overlay");

    if (overlay) {
        overlay.classList.remove("active");
    }
}


/* SETUP PRODUCT DETAILS CLOSE */
function setupProductDetailsClose() {

    const overlay =
        document.querySelector(".product-details-overlay");

    if (!overlay) return;

    const closeButton =
        overlay.querySelector(".details-close");

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeProductDetails
        );
    }

    overlay.addEventListener("click", function(event) {

        if (event.target === overlay) {
            closeProductDetails();
        }

    });
}


/* =====================================================
   CHECKOUT PAGE
   ===================================================== */

function displayCheckout() {

    const checkoutItems =
        document.getElementById("checkout-items");

    if (!checkoutItems) return;


    const subtotal =
        calculateSubtotal();

    const shipping =
        calculateShipping(subtotal);

    const total =
        subtotal + shipping;


    checkoutItems.innerHTML = "";


    cart.forEach(function(item) {

        const itemTotal =
            Number(item.price) *
            Number(item.quantity || 1);


        const product =
            document.createElement("div");

        product.className =
            "checkout-product";


        product.innerHTML = `

            <div class="checkout-product-image">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

            </div>


            <div class="checkout-product-info">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    Quantity: ${item.quantity}
                </p>

            </div>


            <div class="checkout-product-price">

                ₹${itemTotal}

            </div>

        `;


        checkoutItems.appendChild(product);

    });


    const subtotalElement =
        document.getElementById(
            "checkout-subtotal"
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${subtotal}`;

    }


    const shippingElement =
        document.getElementById(
            "checkout-shipping"
        );


    if (shippingElement) {

        if (subtotal >= FREE_SHIPPING_LIMIT) {

            shippingElement.textContent =
                "FREE";

        } else {

            shippingElement.textContent =
                `₹${shipping}`;

        }
    }


    const totalElement =
        document.getElementById(
            "checkout-total"
        );


    if (totalElement) {

        totalElement.textContent =
            `₹${total}`;

    }
}


/* =====================================================
   PAYMENT METHOD
   ===================================================== */

function setupPaymentMethod() {

    const codOption =
        document.getElementById("cod-option");

    const codPayment =
        document.getElementById("cod-payment");

    const prepaidPayment =
        document.getElementById("prepaid-payment");

    const prepaidBox =
        document.getElementById(
            "prepaid-payment-box"
        );

    const paymentScreenshot =
        document.getElementById(
            "payment-screenshot"
        );

    const cityInput =
        document.getElementById(
            "customer-city"
        );


    /* PAYMENT DISPLAY */

    function updatePaymentSection() {

        if (!prepaidBox) return;


        if (
            codPayment &&
            codPayment.checked
        ) {

            prepaidBox.style.display =
                "none";


            if (paymentScreenshot) {

                paymentScreenshot.required =
                    false;

                paymentScreenshot.value =
                    "";

            }

        } else {

            prepaidBox.style.display =
                "block";


            if (paymentScreenshot) {

                paymentScreenshot.required =
                    true;

            }
        }
    }


    /* COD AVAILABILITY */

    function checkCODAvailability() {

        if (!codOption) return;

        if (!cityInput) return;


        const city =
            cityInput.value
                .trim()
                .toLowerCase();


        /*
           COD ONLY FOR BERHAMPUR
        */

        const codCities = [
            "berhampur",
            "brahmapur"
        ];


        const codAvailable =
            codCities.includes(city);


        if (codAvailable) {

            codOption.style.display =
                "flex";

        } else {

            codOption.style.display =
                "none";


            if (
                codPayment &&
                codPayment.checked
            ) {

                if (prepaidPayment) {

                    prepaidPayment.checked =
                        true;

                }
            }
        }


        updatePaymentSection();
    }


    /* PAYMENT CHANGE */

    if (prepaidPayment) {

        prepaidPayment.addEventListener(
            "change",
            updatePaymentSection
        );
    }


    if (codPayment) {

        codPayment.addEventListener(
            "change",
            updatePaymentSection
        );
    }


    /* CITY CHANGE */

    if (cityInput) {

        cityInput.addEventListener(
            "input",
            checkCODAvailability
        );

        cityInput.addEventListener(
            "change",
            checkCODAvailability
        );
    }


    /* INITIAL STATE */

    if (prepaidPayment) {

        prepaidPayment.checked =
            true;

    }


    if (codPayment) {

        codPayment.checked =
            false;

    }


    updatePaymentSection();

    checkCODAvailability();
}


/* =====================================================
   FILE TO BASE64
   ===================================================== */

function fileToBase64(file) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function() {

                    const result =
                        reader.result;


                    const base64 =
                        result.split(",")[1];


                    resolve(base64);

                };


            reader.onerror =
                function(error) {

                    reject(error);

                };


            reader.readAsDataURL(file);

        }
    );
}


/* =====================================================
   SEND ORDER TO GOOGLE SHEET
   ===================================================== */

async function sendOrderToGoogleSheet(
    orderData
) {

    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(
                            orderData
                        )
                }
            );


        const result =
            await response.json();


        if (result.success) {

            /*
               Clear cart after successful order
            */

            localStorage.removeItem(
                "bigmiCart"
            );

            window.location.href =
                "success.html";

        } else {

            alert(
                "Something went wrong while placing your order. Please try again."
            );

        }

    } catch (error) {

        console.error(
            "Google Sheet Error:",
            error
        );


        alert(
            "Unable to place the order right now. Please try again."
        );

    }
}


/* =====================================================
   PLACE ORDER
   ===================================================== */

function setupPlaceOrder() {

    const placeOrderButton =
        document.getElementById(
            "place-order-button"
        );


    if (!placeOrderButton) return;


    placeOrderButton.addEventListener(
        "click",
        async function() {

            /* =========================================
               TERMS
               ========================================= */

            const terms =
                document.getElementById(
                    "agree-terms"
                );


            if (
                terms &&
                !terms.checked
            ) {

                alert(
                    "Please agree to the Terms & Conditions."
                );

                return;
            }


            /* =========================================
               CUSTOMER DETAILS
               ========================================= */

            const fullName =
                document.getElementById(
                    "customer-name"
                )?.value.trim() || "";


            const mobile =
                document.getElementById(
                    "customer-phone"
                )?.value.trim() || "";


            const email =
                document.getElementById(
                    "customer-email"
                )?.value.trim() || "";


            const address =
                document.getElementById(
                    "customer-address"
                )?.value.trim() || "";


            const city =
                document.getElementById(
                    "customer-city"
                )?.value.trim() || "";


            const pinCode =
                document.getElementById(
                    "customer-pincode"
                )?.value.trim() || "";


            /* =========================================
               VALIDATION
               ========================================= */

            if (
                !fullName ||
                !mobile ||
                !email ||
                !address ||
                !city ||
                !pinCode
            ) {

                alert(
                    "Please fill all required customer details."
                );

                return;
            }


            /* =========================================
               PAYMENT METHOD
               ========================================= */

            const selectedPayment =
                document.querySelector(
                    'input[name="payment_method"]:checked'
                );


            const paymentMethod =
                selectedPayment
                    ? selectedPayment.value
                    : "";


            if (!paymentMethod) {

                alert(
                    "Please select a payment method."
                );

                return;
            }


            /* =========================================
               CHECK COD
               ========================================= */

            if (
                paymentMethod === "cod"
            ) {

                const cityLower =
                    city.toLowerCase();


                const codCities = [
                    "berhampur",
                    "brahmapur"
                ];


                if (
                    !codCities.includes(
                        cityLower
                    )
                ) {

                    alert(
                        "COD is available only in Berhampur."
                    );

                    return;
                }
            }


            /* =========================================
               PAYMENT SCREENSHOT
               ========================================= */

            const screenshotInput =
                document.getElementById(
                    "payment-screenshot"
                );


            if (
                paymentMethod === "prepaid" &&
                screenshotInput &&
                screenshotInput.files.length === 0
            ) {

                alert(
                    "Please upload your payment screenshot."
                );

                return;
            }


            /* =========================================
               CART
               ========================================= */

            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;
            }


            /* =========================================
               MINIMUM ORDER
               ========================================= */

            const subtotal =
                calculateSubtotal();


            if (
                subtotal < MINIMUM_ORDER
            ) {

                alert(
                    "Minimum order value is ₹199."
                );

                return;
            }


            /* =========================================
               SHIPPING
               ========================================= */

            const shipping =
                calculateShipping(
                    subtotal
                );

            


            const finalTotal =
                subtotal + shipping;


            /* =========================================
               PRODUCTS
               ========================================= */

            const products =
                cart
                    .map(
                        function(item) {

                            return (
                                (item.name ||
                                    "Product") +
                                " x " +
                                (item.quantity ||
                                    1)
                            );

                        }
                    )
                    .join(", ");


            /* =========================================
               ORDER DATA
               ========================================= */

            const orderData = {

                fullName:
                    fullName,

                mobile:
                    mobile,

                email:
                    email,

                address:
                    address,

                city:
                    city,

                pinCode:
                    pinCode,

                products:
                    products,

                productTotal:
                    subtotal,

                shippingCharge:
                    shipping,

                finalTotal:
                    finalTotal,

                paymentMethod:
                    paymentMethod,

                screenshot:
                    null
            };


            /* =========================================
               BUTTON
               ========================================= */

            placeOrderButton.disabled =
                true;


            placeOrderButton.textContent =
                "Placing Order...";


            /* =========================================
               SCREENSHOT
               ========================================= */

            let screenshotData =
                null;


            if (
                paymentMethod === "prepaid" &&
                screenshotInput &&
                screenshotInput.files.length > 0
            ) {

                const file =
                    screenshotInput.files[0];


                const base64 =
                    await fileToBase64(
                        file
                    );


                screenshotData = {

                    name:
                        file.name,

                    type:
                        file.type,

                    data:
                        base64
                };
            }


            /* =========================================
               ADD SCREENSHOT
               ========================================= */

            orderData.screenshot =
                screenshotData;


            /* =========================================
               SEND ORDER
               ========================================= */

            await sendOrderToGoogleSheet(
                orderData
            );

        }
    );
}


/* =====================================================
   INITIALIZE EVERYTHING
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateCartCount();

        displayCart();

        displayCheckout();

        setupProductCards();
        setupProductDetailsClose();

        setupPaymentMethod();

        setupPlaceOrder();

        setupProductCategories();

    }
);

/* ==============================
   PRODUCT CATEGORY FILTER
   ============================== */

function setupProductCategories() {

    const categoryButtons =
        document.querySelectorAll(".category-item");

    const productCards =
        document.querySelectorAll(".product-card");

        productCards.forEach(function(card) {
            card.style.display = "none";
        });

    categoryButtons.forEach(function(button) {

        button.addEventListener("click", function() {

            const selectedCategory =
                button.dataset.category;

            categoryButtons.forEach(function(btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            productCards.forEach(function(card) {

                const productCategory =
                    card.dataset.category;

                if (
                    selectedCategory === "all" 
                ) {
                    card.style.display = "none";
                } else if (
                    productCategory === selectedCategory
                ) {

                    card.style.display = "";

                } else {

                    card.style.display = "none";

                }

            });

        });

    });

}

document.querySelectorAll(".category-item").forEach(categoryButton => {

    categoryButton.addEventListener("click", function () {

        const selectedCategory = this.getAttribute("data-category");
        const allContent = document.getElementById("all-content");

        if (!allContent) return;

        if (selectedCategory === "all") {
            allContent.style.display = "block";
        } else {
            allContent.style.display = "none";
        }

    });

});