import jwt from "jsonwebtoken";

// Function to generate a token
export const generateToken = ({ payload, secretkey = 'secretkey' }) => {
    return jwt.sign(payload, secretkey, { expiresIn: '1h' }); 
};

// Function to verify the token
export const verifyToken = (token, secretkey = 'secretkey') => {
    try {
        return jwt.verify(token, secretkey); // Returns the decoded payload if valid
    } catch (error) {
        console.error('Token verification failed:', error.message);
        
    }
};