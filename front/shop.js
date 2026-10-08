// =====================================================
// REMOVE FROM CART - DATABASE
// =====================================================

async function removeFromCart(productId) {

    const currentUser =
        localStorage.getItem("currentUser");

    // User is not logged in
    if (!currentUser) {

        showNotification(
            "Please login first.",
            "error"
        );

        return;
    }

    try {

        const user =
            JSON.parse(currentUser);


        // Delete item from PostgreSQL
        const response = await fetch(
            `http://localhost:5000/api/cart/${user.user_id}/${productId}`,
            {
                method: "DELETE"
            }
        );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to remove item"
            );

        }


        // Remove item from frontend cart
        cart =
            cart.filter(
                item => item.id !== productId
            );


        // Update local copy
        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        // Update screen
        updateCartDisplay();


        showNotification(
            "Product removed from cart!",
            "success"
        );


    } catch (error) {

        console.error(
            "REMOVE CART ERROR:",
            error
        );


        showNotification(
            "Unable to remove product from cart.",
            "error"
        );

    }

}


// =====================================================
// INCREASE CART QUANTITY
// =====================================================

async function increaseQuantity(productId) {

    const currentUser =
        localStorage.getItem("currentUser");


    if (!currentUser) {
        showNotification(
            "Please login first.",
            "error"
        );

        return;
    }


    try {

        const user =
            JSON.parse(currentUser);


        // Find item in frontend cart
        const item =
            cart.find(
                item => item.id === productId
            );


        if (!item) {
            return;
        }


        // Increase quantity by 1
        const newQuantity =
            item.quantity + 1;


        // Update PostgreSQL
        const response = await fetch(
            `http://localhost:5000/api/cart/${user.user_id}/${productId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    quantity: newQuantity
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to update quantity"
            );

        }


        // Update frontend quantity
        item.quantity =
            newQuantity;


        // Save local copy
        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        // Refresh cart display
        updateCartDisplay();


    } catch (error) {

        console.error(
            "INCREASE QUANTITY ERROR:",
            error
        );


        showNotification(
            "Unable to increase quantity.",
            "error"
        );

    }

}


// =====================================================
// DECREASE CART QUANTITY
// =====================================================

async function decreaseQuantity(productId) {

    const currentUser =
        localStorage.getItem("currentUser");


    if (!currentUser) {
        showNotification(
            "Please login first.",
            "error"
        );

        return;
    }


    try {

        const user =
            JSON.parse(currentUser);


        // Find item in frontend cart
        const item =
            cart.find(
                item => item.id === productId
            );


        if (!item) {
            return;
        }


        // Decrease quantity by 1
        const newQuantity =
            item.quantity - 1;


        // If quantity becomes 0,
        // remove the product completely
        if (newQuantity < 1) {

            await removeFromCart(productId);

            return;
        }


        // Update PostgreSQL
        const response = await fetch(
            `http://localhost:5000/api/cart/${user.user_id}/${productId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    quantity: newQuantity
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to update quantity"
            );

        }


        // Update frontend quantity
        item.quantity =
            newQuantity;


        // Save local copy
        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        // Refresh cart display
        updateCartDisplay();


    } catch (error) {

        console.error(
            "DECREASE QUANTITY ERROR:",
            error
        );


        showNotification(
            "Unable to decrease quantity.",
            "error"
        );

    }

}


// =====================================================
// UPDATE CART DISPLAY
// =====================================================

function updateCartDisplay() {

    const cartSummary =
        document.getElementById("cartSummary");


    const cartItems =
        document.getElementById("cartItems");


    const cartTotal =
        document.getElementById("cartTotal");


    if (
        !cartSummary ||
        !cartItems ||
        !cartTotal
    ) {
        return;
    }


    // Empty cart
    if (cart.length === 0) {

        cartSummary.style.display =
            "none";

        return;
    }


    cartSummary.style.display =
        "block";


    cartItems.innerHTML =
        "";


    let total = 0;


    cart.forEach(item => {

        const cartItem =
            document.createElement("div");


        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <div>

                <strong>
                    ${item.name}
                </strong>

                <br>

                <small>
                    ₹${item.price.toFixed(2)}
                    ×
                    ${item.quantity}
                </small>

            </div>


            <div
                style="
                    display: flex;
                    align-items: center;
                    gap: 5px;
                "
            >

                <!-- DECREASE BUTTON -->

                <button
                    onclick="decreaseQuantity(${item.id})"
                    style="
                        background: #ddd;
                        border: none;
                        padding: 5px 9px;
                        border-radius: 4px;
                        cursor: pointer;
                    "
                >
                    −
                </button>


                <!-- CURRENT QUANTITY -->

                <span
                    style="
                        min-width: 25px;
                        text-align: center;
                    "
                >
                    ${item.quantity}
                </span>


                <!-- INCREASE BUTTON -->

                <button
                    onclick="increaseQuantity(${item.id})"
                    style="
                        background: #ddd;
                        border: none;
                        padding: 5px 9px;
                        border-radius: 4px;
                        cursor: pointer;
                    "
                >
                    +
                </button>


                <!-- DELETE BUTTON -->

                <button
                    onclick="removeFromCart(${item.id})"
                    style="
                        background: #ef4444;
                        color: white;
                        border: none;
                        padding: 5px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                    "
                >
                    <i class="fas fa-trash"></i>
                </button>

            </div>

        `;


        cartItems.appendChild(
            cartItem
        );


        total +=
            item.price *
            item.quantity;

    });


    cartTotal.textContent =
        total.toFixed(2);

}