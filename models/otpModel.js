import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 300 } // auto delete in 5 mins
  }
});

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);
