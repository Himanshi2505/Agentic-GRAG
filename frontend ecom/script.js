// Replace with your ngrok URL
const API_URL = "https://117f0ef49ffa.ngrok-free.app";

// Function to toggle the chatbot visibility
function toggleChatbot() {
  const chatbotBox = document.getElementById("chatbot-box");
  chatbotBox.classList.toggle("show");
}

// Function to handle sending a message
async function sendMessage() {
  const chatInput = document.getElementById("chat-input");
  const userQuery = chatInput.value.trim();

  if (userQuery === "") return;

  // Add user's message to chat history
  addMessageToChat("user", userQuery);
  chatInput.value = "";

  // Show "thinking..." message from bot
  const botThinkingMsg = addMessageToChat("bot", "Thinking...");

  try {
    const response = await fetch(`${API_URL}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        user_id: "U100", // Using a hardcoded us    er ID for this example
        query: userQuery,
        top_k: 5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const recommendationText = data.recommendation;

    // Update the "thinking..." message with the final response
    botThinkingMsg.remove();
    addMessageToChat("bot", recommendationText);
  } catch (error) {
    console.error("Error:", error);
    botThinkingMsg.remove();
    addMessageToChat("bot", "Sorry, something went wrong. Please try again.");
  }
}

// Function to handle 'Enter' key press in the input field
function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

// Function to add a message to the chat history
function addMessageToChat(sender, message) {
  const chatHistory = document.getElementById("chat-history");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("chat", sender);

  const formattedMessage = message
    .split("\n")
    .map((line) => {
      if (line.trim().startsWith("- ")) {
        const parts = line.split(" - ");
        if (parts.length >= 3) {
          const title = parts[0].replace("- ", "");
          const price = parts[1];
          const reason = parts.slice(2).join(" - ");
          return `<p><strong>${title}</strong> (${price})</p><p>${reason}</p>`;
        } else {
          return `<p>${line}</p>`;
        }
      }
      return `<p>${line}</p>`;
    })
    .join("");

  messageDiv.innerHTML = formattedMessage;
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return messageDiv;
}

// Function to fetch and load product data from the CSV file
async function loadProducts() {
  const productContainer = document.getElementById("product-container");
  try {
    const response = await fetch("products.csv");
    const csvText = await response.text();

    // Simple CSV parsing
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",");
    const products = lines.slice(1).map((line) => {
      const values = line.split(",");
      const product = {};
      headers.forEach((header, i) => {
        product[header.trim()] = values[i].trim();
      });
      return product;
    });

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `
                <img src="https://via.placeholder.com/300x200.png?text=${encodeURIComponent(
                  product.title
                )}" alt="${product.title}" class="product-image">
                <div class="product-details">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-price">₹${product.price}</p>
                    <p class="product-description">${product.description}</p>
                </div>
            `;
      productContainer.appendChild(productCard);
    });
  } catch (error) {
    console.error("Error loading products from CSV:", error);
    productContainer.innerHTML =
      "<p>Could not load products. Make sure products.csv is in the correct directory.</p>";
  }
}

// Load products when the page loads
window.onload = loadProducts;
