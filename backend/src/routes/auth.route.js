import express from "express"
import { checkAuth, signin, signout, signup, updateProfile, updateProfileName} from "../controllers/auth.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/signup", signup );

router.post("/signin", signin );

router.post("/signout", protectRoute, signout );

router.put("/update-profile", protectRoute, updateProfile );

router.put("/update-profile-name", protectRoute, updateProfileName );

router.get("/check", protectRoute, checkAuth);

export default router;