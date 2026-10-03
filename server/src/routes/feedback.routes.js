import { Router } from "express";
import {
    getFeedback,
    createOrUpdateFeedback
} from "../controllers/feedback.controllers.js";
import { authUser } from "../middlewares/users.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();


router.route("/getFeedback").get(authUser, getFeedback);

router
    .route("/createOrUpdateFeedback")
    .post(
        authUser,
        upload.array("files"),
        createOrUpdateFeedback
    );


// router.route("/editProfile/:id").put(authUser, editUserProfile);

export default router;






