const chatBody = document.getElementById("chatBody");
const questionInput = document.getElementById("questionInput");
const sendBtn = document.getElementById("sendBtn");

// Toggle this variable to true later when your backend ChatGPT integration route is live!
const USE_LIVE_CHATGPT_API = false; 

async function askAI() {
  const question = questionInput.value.trim();
  if (question === "") return;

  // 1. Render User Message
  addMessage(question, "user");
  questionInput.value = "";
  showTyping();

  try {
    let responseText = "";

    if (USE_LIVE_CHATGPT_API) {
      // Future bridge to connect your backend OpenAI/ChatGPT route
      const apiResponse = await fetch("https://hambak-tech-services.onrender.com/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      const apiData = await apiResponse.json();
      responseText = apiData.reply;
    } else {
      // Synchronous Local matrix response fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      responseText = generateLocalResponse(question);
    }

    removeTyping();
    addMessage(responseText, "ai");
  } catch (error) {
    console.error("AI Assistant Error:", error);
    removeTyping();
    addMessage("Connection error. Please check your internet connection.", "ai");
  }
}

function addMessage(message, type) {
  if (!chatBody) return;
  const div = document.createElement("div");
  div.className = `chat-message ${type}`;
  div.innerHTML = `<p>${message}</p>`;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showTyping() {
  if (!chatBody) return;
  const typing = document.createElement("div");
  typing.className = "chat-message ai";
  typing.id = "typing";
  typing.innerHTML = `<p><em>Hambak AI is thinking...</em></p>`;
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

function generateLocalResponse(question) {
  const q = question.toLowerCase();

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return "Hello 👋 Welcome to HAMBAK TECH & SERVICES! How can I assist you with our tech and digital utilities today?";
  }
  if (q.includes("web") || q.includes("website") || q.includes("frontend") || q.includes("backend") || q.includes("node")) {
    return "We offer premium web development training specializing in HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB. Perfect for scaling your business dashboard architectures!";
  }
  if (q.includes("nin")) {
    return "Our local NIN center handles Enrolments, Modifications, Validations, Tracking ID requests, and official Reprints directly at our Lagos office.";
  }
  if (q.includes("waec") || q.includes("neco") || q.includes("jamb")) {
    return "We provide error-free registrations and direct result checks for JAMB (including CAPS, institutional changes, and admission prints), WAEC, and NECO.";
  }
  if (q.includes("graphics") || q.includes("design") || q.includes("brand")) {
    return "We specialize in corporate graphic design, business branding materials, custom prints, flyers, and professional logo creation.";
  }
  if (q.includes("print") || q.includes("photocopy") || q.includes("lamination")) {
    return "High-speed document typing, clean black & white or vibrant color printing, high-volume student photocopying, and document lamination are fully operational at our hub.";
  }
  if (q.includes("vtu") || q.includes("airtime") || q.includes("data") || q.includes("recharge")) {
    return "Get instant automated VTU services via our platform, supporting cheap data bundles and airtime tokens across MTN, Airtel, GLO, and 9mobile.";
  }
  if (q.includes("contact") || q.includes("phone") || q.includes("address") || q.includes("where")) {
    return "📍 **Address:** First building, inside Origanrigan II Cele Bus Stop, Ibeju-Lekki, Lagos, Nigeria.<br>📞 **Phone:** 09127469686<br>📱 **WhatsApp:** 09155104724<br>📧 **Email:** hambak901@gmail.com";
  }

  return "I'm still learning! Feel free to ask me details about our ICT Training, NIN services, VTU automation, Printing, Exam registrations, or Graphics work. Alternatively, visit our contact section to text our helpdesk directly!";
}

// Bind event listeners safely
if (questionInput) {
  questionInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") askAI();
  });
}
if (sendBtn) {
  sendBtn.addEventListener("click", askAI);
}
