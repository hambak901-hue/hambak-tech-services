/* =========================
API BASE URL
========================= */

const API_URL =
"http://localhost:5000/api";

/* =========================
SAVE TOKEN
========================= */

const saveToken = (token) => {

localStorage.setItem(
"hambak_token",
token
);

};

/* =========================
GET TOKEN
========================= */

const getToken = () => {

return localStorage.getItem(
"hambak_token"
);

};

/* =========================
REMOVE TOKEN
========================= */

const logoutUser = () => {

localStorage.removeItem(
"hambak_token"
);

window.location.href =
"login.html";

};

/* =========================
REGISTER USER
========================= */

const registerUser = async (userData) => {

try{

const response = await fetch(

`${API_URL}/auth/register`,

{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(userData)

}

);

const data =
await response.json();

return data;

}catch(error){

console.log(error);

}

};

/* =========================
LOGIN USER
========================= */

const loginUser = async (userData) => {

try{

const response = await fetch(

`${API_URL}/auth/login`,

{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(userData)

}

);

const data =
await response.json();

if(data.token){

saveToken(data.token);

}

return data;

}catch(error){

console.log(error);

}

};

/* =========================
GET CURRENT USER
========================= */

const getCurrentUser = async () => {

try{

const response = await fetch(

`${API_URL}/auth/me`,

{
headers:{
Authorization:
`Bearer ${getToken()}`
}

}

);

const data =
await response.json();

return data;

}catch(error){

console.log(error);

}

};

/* =========================
GET SERVICES
========================= */

const getServices = async () => {

try{

const response = await fetch(

`${API_URL}/services`

);

const data =
await response.json();

return data;

}catch(error){

console.log(error);

}

};