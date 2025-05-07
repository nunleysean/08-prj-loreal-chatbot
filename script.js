// Get references to the DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const responseContainer = document.getElementById("chatWindow");

// Initialize an array to store the conversation history
let conversationHistory = [
  {
    role: "system",
    content: `You are a friendly beauty professional, specializing in L'Oréal products, routines, and recommendations.

  If a user's query is unrelated L'Oréal, respond by politley stating that the question is outside of your speciality.
  
  Format your responses like this:
• Use bullet points (•) for lists
• Use simple text formatting (no **bold** or _italics_)
• Use short sentences and paragraphs
• Use a friendly and conversational tone
• Highlight important points with CAPS
• Use parentheses for additional tips`,
  },
];

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the form from refreshing the page

  const userQuery = userInput.value; // Get the user's input
  if (!userQuery.trim()) return; // Do nothing if input is empty

  // Add the user's query to the conversation history
  conversationHistory.push({ role: "user", content: userQuery });

  // Display the user's query in the chat window
  const userMessage = document.createElement("div");
  userMessage.classList.add("msg", "user"); // Add classes for styling
  userMessage.textContent = userQuery;
  responseContainer.appendChild(userMessage);

  // Clear the input field
  userInput.value = "";

  // Scroll to the bottom of the chat window
  responseContainer.scrollTop = responseContainer.scrollHeight;

  // Display a temporary loading message
  const thinkingMessage = document.createElement("div");
  thinkingMessage.classList.add("msg", "ai"); // Add classes for styling
  thinkingMessage.textContent = "Hmm...";
  responseContainer.appendChild(thinkingMessage);

  try {
    // Send a POST request to the Cloudflare worker
    const response = await fetch("https://travelbot.nunley-sean.workers.dev/", {
      method: "POST", // We are POST-ing data to the worker
      headers: {
        "Content-Type": "application/json", // Set the content type to JSON
      },
      // Send the conversation history
      body: JSON.stringify({
        model: "gpt-4o",
        messages: conversationHistory,
        temperature: 0.7, // Adjust the temperature for response variability
        frequency_penalty: 0.5, // Adjust the frequency penalty for response diversity
      }),
    });

    // Parse and display the response
    const result = await response.json();
    const aiResponse = result.choices[0].message.content;

    // Add the AI's response to the conversation history
    conversationHistory.push({ role: "assistant", content: aiResponse });

    // Replace the loading message with the AI's response
    thinkingMessage.textContent = aiResponse;

    // Scroll to the bottom of the chat window
    responseContainer.scrollTop = responseContainer.scrollHeight;
  } catch (error) {
    console.error("Error fetching data from the API:", error); // Log the error
    thinkingMessage.textContent =
      "Hmm... Something went wrong. Please try asking me again later."; // Show a user-friendly message
  }
});
