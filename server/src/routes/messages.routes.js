import { Router } from "express";
import {
    loadMessages
} from "../controllers/messages.controllers.js";
import { authUser } from "../middlewares/users.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/getMessages").get(loadMessages);
// router.route("/userSignup").post(userSignup);


export default router;






