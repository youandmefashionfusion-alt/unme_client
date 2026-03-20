import Otp from "../../../../../models/otpModel";
import sendEmail from "../../../../../controller/emailController";
export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ status: false, message: "Email required" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    await sendEmail({
      to: email,
      subject: `U n Me Authentication is ${otp}`,
      text: `Your OTP for U n Me Authentication is ${otp}`,
      htmlContent: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP - U n Me</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f7;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
                    
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                U n Me
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">
                                Your trusted shopping companion
                            </p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 50px 40px;">
                            <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                                Verify Your Email
                            </h2>
                            
                            <p style="margin: 0 0 32px 0; color: #666666; font-size: 16px; line-height: 24px; text-align: center;">
                                We received a request to verify your email address. Use the code below to complete your verification:
                            </p>

                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%); border: 2px dashed #667eea; border-radius: 12px; padding: 30px; display: inline-block;">
                                            <p style="margin: 0 0 12px 0; color: #666666; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                                Your OTP Code
                                            </p>
                                            <p style="margin: 0; color: #667eea; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                ${otp}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Timer Warning -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                                <tr>
                                    <td style="background-color: #fff4e6; border-left: 4px solid #ff9800; border-radius: 8px; padding: 16px 20px;">
                                        <p style="margin: 0; color: #e65100; font-size: 14px; line-height: 20px;">
                                            ⏱️ <strong>This code expires in 5 minutes.</strong> Please verify soon.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Notice -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
                                <tr>
                                    <td style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                                        <p style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">
                                            🔒 Security Tips:
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 13px; line-height: 20px;">
                                            <li style="margin-bottom: 8px;">Never share this code with anyone</li>
                                            <li style="margin-bottom: 8px;">U n Me will never ask for your OTP</li>
                                            <li>If you didn't request this, please ignore this email</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; color: #999999; font-size: 13px; line-height: 20px; text-align: center;">
                                If you didn't request this verification code, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <p style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                                            Need Help?
                                        </p>
                                        <p style="margin: 0; color: #666666; font-size: 14px; line-height: 20px;">
                                            Contact us at 
                                            <a href="mailto:support@unmejewels.com" style="color: #667eea; text-decoration: none; font-weight: 600;">support@unmejewels.com</a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                        <p style="margin: 0 0 8px 0; color: #999999; font-size: 12px;">
                                            © 2024 U n Me. All rights reserved.
                                        </p>
                                        <p style="margin: 0; color: #999999; font-size: 12px;">
                                            This is an automated message, please do not reply.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Bottom spacing -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td align="center">
                            <p style="margin: 0; color: #999999; font-size: 12px; line-height: 18px;">
                                You received this email because you requested an OTP verification code.<br>
                                If you have questions, visit our 
                                <a href="#" style="color: #667eea; text-decoration: none;">Help Center</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    })

    console.log("OTP:", otp);
    // TODO: integrate SMS

    return Response.json({ status: true, message: "OTP Sent" });
  } catch (error) {
    return Response.json({ status: false, message: error.message }, { status: 500 });
  }
}
