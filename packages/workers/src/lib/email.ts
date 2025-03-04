import Plunk from "@plunk/node";

export function getPlunkClient() {
	return new Plunk(process.env.PLUNK_API_KEY);
}

// 发送注册验证码邮件
export async function sendSignupEmail(
	email: string,
	username: string,
	code: string,
) {
	const plunk = getPlunkClient();
	await plunk.emails.send({
		from: "info@pexni.com",
		name: "Pexni",
		to: email,
		subject: "Welcome to OpenChat - Please Verify Your Email",
		body: `
			<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
				<p>Hi ${username},</p>
				
				<p>Welcome to OpenChat! We're excited to have you join our community.</p>
				
				<p>To complete your registration, please use the verification code below:</p>
				
				<p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0; text-align: center;">
					${code}
				</p>
				
				<p>This code will expire in 10 minutes. If you did not create an account with OpenChat, please ignore this email.</p>
				
				<p>Best regards,<br>
				The OpenChat Team</p>
			</div>
		`,
	});
}

// 发送登录验证码邮件
export async function sendSigninOtpEmail(email: string, code: string) {
	const plunk = getPlunkClient();
	await plunk.emails.send({
		from: "info@pexni.com",
		name: "Pexni",
		to: email,
		subject: "OpenChat - Your Login Verification Code",
		body: `
			<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
				<p>Hello,</p>
				
				<p>You recently requested to sign in to your OpenChat account. Here's your verification code:</p>
				
				<p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0; text-align: center;">
					${code}
				</p>
				
				<p>This code will expire in 10 minutes. If you did not attempt to sign in to OpenChat, please ignore this email.</p>
				
				<p>Best regards,<br>
				The OpenChat Team</p>
			</div>
		`,
	});
}
