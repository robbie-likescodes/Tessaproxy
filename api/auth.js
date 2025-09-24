export default async function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  // broad enough to work for public/private repos you own
  const scope = "repo,user:email";
  const redirect = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scope)}`;
  res.status(302).setHeader("Location", redirect).end();
}
