
let topButton = document.getElementById("topBtn");

window.onscroll = function () {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        topButton.style.display = "block";
    } else {
        topButton.style.display = "none";
    }
};

function topFunction() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ================= CART COUNTER =================

let cartCount = parseInt(localStorage.getItem("cartCount")) || 0;

const cartBadge = document.getElementById("cart-count");

if (cartBadge) {
    cartBadge.innerText = cartCount;
}

// Quantity + Add to Cart

document.querySelectorAll(".jewellery-card").forEach(card => {

    const plusBtn = card.querySelector(".plus-btn");
    const minusBtn = card.querySelector(".minus-btn");
    const quantityInput = card.querySelector(".quantity");
    const addBtn = card.querySelector(".add-cart-btn");

    // PLUS

    plusBtn.addEventListener("click", () => {

        quantityInput.value = parseInt(quantityInput.value) + 1;

    });

    // MINUS

    minusBtn.addEventListener("click", () => {

        if (parseInt(quantityInput.value) > 1) {

            quantityInput.value = parseInt(quantityInput.value) - 1;

        }

    });

    // ADD TO CART

    addBtn.addEventListener("click", () => {

        let qty = parseInt(quantityInput.value);

        const name = addBtn.dataset.name;
        const price = Number(addBtn.dataset.price);
        const image = addBtn.dataset.image;

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        for (let i = 0; i < qty; i++) {

            cart.push({
                name: name,
                price: price,
                image: image
            });

        }

        localStorage.setItem("cart", JSON.stringify(cart));

        cartCount = cart.length;

        localStorage.setItem("cartCount", cartCount);

        if (cartBadge) {
            cartBadge.innerText = cartCount;
        }

        alert("Product added to cart ❤️");

    });

});
// ================= CART PAGE =================

const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const emptyCart = document.getElementById("empty-cart");
const cartContainer = document.getElementById("cart-container");

if (cartItemsContainer) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {

    if (emptyCart) emptyCart.style.display = "block";
    if (cartContainer) cartContainer.style.display = "none";

} else {

    if (emptyCart) emptyCart.style.display = "none";
    if (cartContainer) cartContainer.style.display = "block";

}

    cartItemsContainer.innerHTML = "";

    let total = 0;
let groupedCart = {};

cart.forEach(product => {

    if(groupedCart[product.name]){

        groupedCart[product.name].quantity++;

    }else{

        groupedCart[product.name] = {

            ...product,

            quantity:1

        };

    }

});

let products = Object.values(groupedCart);
    products.forEach((product, index)=>{

        total += product.price * product.quantity;

        cartItemsContainer.innerHTML += `

        <div class="cart-item">

            <img src="${product.image}" alt="${product.name}" width="80">

            <div class="cart-info">

    <h3>${product.name}</h3>

    <p>Price: ₹${product.price}</p>

    <p>Quantity: ${product.quantity}</p>

    <p><strong>Subtotal: ₹${product.price * product.quantity}</strong></p>

</div>

            <button class="remove-btn" onclick="removeItem(${index})">
                Remove
            </button>

        </div>

        `;

    });

    cartTotal.innerText = total;
    // Minimum Order ₹199

if (checkoutBtn) {

    if (total < 199) {

        checkoutBtn.disabled = true;
        checkoutBtn.innerText = "Minimum Order ₹199";

    } else {

        checkoutBtn.disabled = false;
        checkoutBtn.innerText = "Proceed to Checkout";

    }

}

}

function removeItem(index){

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.splice(index,1);

    localStorage.setItem("cart",JSON.stringify(cart));

    localStorage.setItem("cartCount",cart.length);

    location.reload();

}


// ================= CHECKOUT =================

const paymentMethod = document.getElementById("payment-method");
if (paymentMethod) {

    const upiSection = document.getElementById("upi-section");
    const checkoutTotal = document.getElementById("checkout-total");
    const shippingCharge = document.getElementById("shipping-charge");
    const grandTotal = document.getElementById("grand-total");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(item => {
        total += Number(item.price || 0);
    });

    checkoutTotal.innerText = total;
    let shipping = 9;
    grandTotal.innerText = total + shipping;



    paymentMethod.addEventListener("change", function () {
        

        if (this.value === "cod") {

            upiSection.style.display = "none";

            shippingCharge.innerText = "₹9";

            grandTotal.innerText = total + 9;

        } else if (this.value === "upi") {

            upiSection.style.display = "block";

            shippingCharge.innerText = "FREE";

            grandTotal.innerText = total;

        }

    });

}




// ================= GOOGLE SHEET ORDER =================

const placeOrderBtn = document.getElementById("place-order");

if (placeOrderBtn) {

  placeOrderBtn.addEventListener("click", async function (e) {

    e.preventDefault();

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    let groupedCart = {};
    let totalQty = 0;
    let productTotal = 0;

    cart.forEach(item => {

      if (groupedCart[item.name]) {

        groupedCart[item.name].quantity++;

      } else {

        groupedCart[item.name] = {
          ...item,
          quantity: 1
        };

      }

    });

    let products = "";

    Object.values(groupedCart).forEach(item => {

      products += `${item.name} x ${item.quantity}\n`;

      totalQty += item.quantity;

      productTotal += item.price * item.quantity;

    });

    const payment = document.getElementById("payment-method").value;

    if (payment === "") {
      alert("Please select payment method.");
      return;
    }

    const shipping = payment === "cod" ? 9 : 0;
    const finalTotal = productTotal + shipping;

    const data = {

      name: document.querySelector('input[placeholder="Full Name"]').value,

      phone: document.querySelector('input[placeholder="Phone Number"]').value,

      email: document.querySelector('input[placeholder="Email (Optional)"]').value,

      city: document.querySelector('input[placeholder="City"]').value,

      state: document.querySelector('input[placeholder="State"]').value,

      address: document.querySelector('textarea[placeholder="Delivery Address"]').value,

      pincode: document.querySelector('input[placeholder="PIN Code"]').value,

      instruction: document.querySelector('textarea[placeholder="Special Instructions (Optional)"]').value,

      products: products,

      quantity: totalQty,

      productTotal: productTotal,

      payment: payment,

      grandTotal: finalTotal

    };

    try {

      await fetch("https://script.google.com/macros/s/AKfycbyXLTDvg-E_pHwEai2Nn6tS_ReOD7auTh57WP7tB7sDPRMbbFrFERIOQ-PAgPq7EBX0/exec", {

        method: "POST",

        body: JSON.stringify(data)

      });

      localStorage.removeItem("cart");
      localStorage.removeItem("cartCount");

      window.location.href = "success.html";

    } catch (err) {

      alert("Order failed. Please try again.");

      console.log(err);

    }

  });

}

