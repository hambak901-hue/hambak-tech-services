const chatBody =
document.getElementById("chatBody");

const questionInput =
document.getElementById("questionInput");

function askAI(){

const question =
questionInput.value.trim();

if(question === "") return;

addMessage(question,"user");

questionInput.value = "";

showTyping();

setTimeout(()=>{

removeTyping();

const response =
generateResponse(question);

addMessage(response,"ai");

},1200);

}

function addMessage(message,type){

const div =
document.createElement("div");

div.className =
`chat-message ${type}`;

div.innerHTML = `
<p>${message}</p>
`;

chatBody.appendChild(div);

chatBody.scrollTop =
chatBody.scrollHeight;

}

function showTyping(){

const typing =
document.createElement("div");

typing.className =
"chat-message ai";

typing.id = "typing";

typing.innerHTML = `
<p>Typing...</p>
`;

chatBody.appendChild(typing);

chatBody.scrollTop =
chatBody.scrollHeight;

}

function removeTyping(){

const typing =
document.getElementById("typing");

if(typing){
typing.remove();
}

}

function generateResponse(question){

question =
question.toLowerCase();

/* =========================
GREETINGS
========================= */

if(
question.includes("hello") ||
question.includes("hi") ||
question.includes("hey")
){
return `
Hello 👋 Welcome to HAMBAK TECH & SERVICES.

How can I assist you today?
`;
}

/* =========================
WEB DEVELOPMENT
========================= */

if(
question.includes("web") ||
question.includes("website") ||
question.includes("frontend") ||
question.includes("backend")
){
return `
We offer professional web development training covering:

✔ HTML
✔ CSS
✔ JavaScript
✔ Node.js
✔ Express.js
✔ MongoDB

Training is available for beginners and advanced students.
`;
}

/* =========================
NIN
========================= */

if(
question.includes("nin")
){
return `
Our NIN services include:

✔ NIN Enrolment
✔ NIN Modification
✔ NIN Validation
✔ NIN Reprint
✔ Tracking ID Assistance

Visit HAMBAK TECH & SERVICES office for processing.
`;
}

/* =========================
WAEC
========================= */

if(
question.includes("waec")
){
return `
WAEC registration and result checking services are available.

Required documents usually include:

✔ Passport Photograph
✔ Personal Information
✔ Valid Phone Number
`;
}

/* =========================
JAMB
========================= */

if(
question.includes("jamb")
){
return `
JAMB registration services are available.

We also assist with:

✔ CAPS
✔ Admission Printing
✔ Result Checking
✔ Change of Institution
`;
}

/* =========================
NECO
========================= */

if(
question.includes("neco")
){
return `
NECO registration and result checking services are available at HAMBAK TECH & SERVICES.
`;
}

/* =========================
GRAPHICS
========================= */

if(
question.includes("graphics") ||
question.includes("design")
){
return `
Graphics design services include:

✔ Flyer Design
✔ Banner Design
✔ Business Card Design
✔ Social Media Design
✔ Branding
`;
}

/* =========================
PRINTING
========================= */

if(
question.includes("print") ||
question.includes("photocopy")
){
return `
Printing services available:

✔ Black & White Printing
✔ Color Printing
✔ Photocopy
✔ Lamination
✔ Typing & Printing
`;
}

/* =========================
VTU
========================= */

if(
question.includes("vtu") ||
question.includes("airtime") ||
question.includes("data")
){
return `
Our VTU services support:

✔ Airtime Recharge
✔ Data Subscription
✔ Cable TV Payment
✔ Electricity Payment

Available for MTN, Airtel, GLO and 9mobile.
`;
}

/* =========================
TRAINING
========================= */

if(
question.includes("training") ||
question.includes("course") ||
question.includes("learn")
){
return `
Our ICT training programs include:

✔ Basic ICT
✔ Web Development
✔ Graphics Design
✔ Computer Operations
✔ Internet Training

Certificates are issued after completion.
`;
}

/* =========================
CONTACT
========================= */

if(
question.includes("contact") ||
question.includes("phone") ||
question.includes("address")
){
return `
HAMBAK TECH & SERVICES

📞 09127469686
📱 WhatsApp: 09155104724
📧 hambak901@gmail.com

📍 First building, inside Origanrigan II Cele Bustop, Ibeju-Lekki, Lagos Nigeria.
`;
}

/* =========================
DEFAULT
========================= */

return `
Sorry, I could not fully understand your question.

Please ask about:

✔ ICT Training
✔ NIN Services
✔ VTU
✔ Printing
✔ Graphics Design
✔ WAEC/JAMB
✔ Web Development
✔ Business Services
`;

}