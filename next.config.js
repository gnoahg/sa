/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	images: {
		domains: [(process.env.NEXT_PUBLIC_DOMAIN ?? "").replace("http://", "").replace("https://", "").replace(":3005", "")]
	},
	redirects: () => [
		{
			source: "/",
			destination: "https://gnoahg.github.io/cdn/",
			permanent: true
		}
	]
};
