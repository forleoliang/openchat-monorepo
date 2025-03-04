import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/layout.tsx", [
		index("routes/home.tsx", { id: "home" }),
		route("chat/:id", "routes/home.tsx", { id: "chat" }),
	]),
	route("signin", "routes/signin.tsx"),
	route("signup", "routes/signup.tsx"),
	route("reset-password", "routes/reset-password.tsx"),
	route("account-verify", "routes/account-verify.tsx"),
] satisfies RouteConfig;
