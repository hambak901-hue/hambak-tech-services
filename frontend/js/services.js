/* =========================
API URL
========================= */

const API_URL =
"http://localhost:5000/api/services";

/* =========================
LOAD SERVICES
========================= */

async function loadServices(){

try{

const response =
await fetch(API_URL);

const data =
await response.json();

const servicesContainer =
document.getElementById(
"servicesContainer"
);

servicesContainer.innerHTML = "";

if(data.success){

data.services.forEach(service => {

servicesContainer.innerHTML += `

<div class="service-card glass">

<div class="service-image">

<img
src="${
service.image ||
'https://via.placeholder.com/400x250'
}"
alt="${service.name}"
>

</div>

<h3>
${service.name}
</h3>

<p>
${service.description}
</p>

<div class="service-price">

₦${service.price}

</div>

<button
class="service-btn"
>

View Service

</button>

</div>

`;

});

}else{

servicesContainer.innerHTML =
"<p>No services found</p>";

}

}catch(error){

console.log(error);

}

}

/* =========================
LOAD ON START
========================= */

loadServices();