const jwt = require("jsonwebtoken");
const BlacklistTokenModel = require("../models/blacklistToken.model");
const authMiddleware = (role) => {
    //token gives access to do operations in the system, by using the token in the header section, so block it
    return async (req, res, next) => {
        let decoded;
        try {
            let token = req.headers?.authorization?.split(" ")[1];
            //check if the token is blacklisted?   
            let blacklistTokenCheck = await BlacklistTokenModel.exists({token})
            //this exists will give document or null   
            console.log(blacklistTokenCheck)
            console.log(token)
            if(blacklistTokenCheck){
                res.json({msg : "wrong token, please login again"})
                return
            }
            if (token && !blacklistTokenCheck) {
                decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                console.log(decoded, "i am decoded");

                console.log("Passed through auth middleware");
            } else {
                res.status(400).json({ message: "token not found, please login again" })
            }
        } catch (err) {
            if (err.message == "jwt expired") {
                // we need to generate new access token with the help of refresh token 
                //check the validity of refresh token  and issue new access token
                let refreshToken = req.headers?.refreshtoken?.split(" ")[1];
                let refreshTokenDecoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
                if(refreshTokenDecoded){
                    console.log("Access token expired, new token generated")
                    //userId and role from refreshTokenDecoded
                    let newAccessToken = jwt.sign({ userID: refreshTokenDecoded.userId, role: refreshTokenDecoded.role }, process.env.JWT_SECRET_KEY, {expiresIn : 1800});
                    decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET_KEY);
                }else{
                    res.status(403).json({ message: "token expired, login again" })
                }
            } else {
                res.status(500).json({ message: "something went wrong" })
            }
        }
        if (decoded) {
            //attach the decrypted data to the request
            //  if (role == decoded.role) for giving access to multiple roles
            if (role.includes(decoded.role)) {
                req.user = decoded.userId || decoded.userID;
                console.log(req.user, "is this correct")
                next();
            } else {
                res.status(401).json({ msg: "role is not matching" })
            }
        } else {
            res.status(403).json({ message: "login failed please login again" })
        }
    }
}

module.exports = authMiddleware;