import usersDao from "./users";
import conversationsDao from "./conversations";
import verificationCodesDao from "./verification-codes";
import messagesDao from "./messages";
import refreshTokensDao from "./refresh-tokens";
import filesDao from "./files";
import qrCodeLoginsDao from "./qr-code-logins";

export default {
	users: usersDao,
	verificationCodes: verificationCodesDao,
	messages: messagesDao,
	conversations: conversationsDao,
	refreshTokens: refreshTokensDao,
	files: filesDao,
	qrCodeLogins: qrCodeLoginsDao,
};
