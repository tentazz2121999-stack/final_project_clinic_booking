import express from "express";
import doctorController from "../controllers/doctor.controller";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";
import validate from "../middleware/validate";
import { availabilitySchema, timeBlockSchema } from "../schemas/doctor.schema";

const router = express.Router();

router.get("/", doctorController.list);
router.get("/me/profile", authenticate, authorize("DOCTOR"), doctorController.getMyProfile);
router.get("/:id", doctorController.getById);
router.get("/:id/reviews", doctorController.getReviews);
router.get("/:id/slots", doctorController.getAvailableSlots);

router.post(
  "/:id/availability",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  validate(availabilitySchema),
  doctorController.addAvailability
);
router.delete(
  "/:id/availability/:availabilityId",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  doctorController.removeAvailability
);

router.get("/:id/blocks", authenticate, authorize("DOCTOR", "ADMIN"), doctorController.listTimeBlocks);
router.post(
  "/:id/blocks",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  validate(timeBlockSchema),
  doctorController.addTimeBlock
);
router.delete("/:id/blocks/:blockId", authenticate, authorize("DOCTOR", "ADMIN"), doctorController.removeTimeBlock);

export default router;
