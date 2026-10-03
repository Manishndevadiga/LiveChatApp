import { Router } from "express";
import {
    userLogin, userSignup, checkAuth, userLogout, subscribeUser
} from "../controllers/users.controllers.js";
import { authUser } from "../middlewares/users.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/checkAuth").get(checkAuth);
router.route("/userSignup").post(userSignup);
router.route("/login").post(userLogin);
router.route("/logout").post(authUser, userLogout);

router.route("/subscribe").post(authUser, subscribeUser);

// router.route("/editProfile/:id").put(authUser, editUserProfile);

export default router;






