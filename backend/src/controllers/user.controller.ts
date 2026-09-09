import { asyncHandler } from "../utils/asyncHandler";
import userService from "../services/user.service";

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.user!.id);
  res.json({ success: true, data: user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user!.id, req.body);
  res.json({ success: true, data: user });
});

export default { getMe, updateMe };
