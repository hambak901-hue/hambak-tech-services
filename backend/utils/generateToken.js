import jwt from "jsonwebtoken";

/* =========================
GENERATE JWT TOKEN
========================= */

const generateToken = (userId, role) => {

return jwt.sign(

{
id:userId,
role:role
},

process.env.JWT_SECRET,

{
expiresIn:
process.env.JWT_EXPIRE
}

);

};

export default generateToken;