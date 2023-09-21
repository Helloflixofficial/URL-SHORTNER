import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  bio: { type: String },
  name: { type: String, required: true },
  image: { type: String },
  threads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }],
  onboarded: {
    type: Boolean,
    default: false,
  },
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cummunities" }],
});
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
