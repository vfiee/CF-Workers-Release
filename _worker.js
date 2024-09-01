export default {
  async fetch(request, env) {
    const { GH_NAME, GH_REPO, GH_TOKEN } = env || {}
    const requestUrl = new URL(request.url)
    const githubName = requestUrl.searchParams.get('username') || GH_NAME
    const githubRepo = requestUrl.searchParams.get('repo') || GH_REPO
    const url = `https://api.github.com/repos/${githubName}/${githubRepo}/releases/latest`
    const errorResponse = new Response(JSON.stringify({ version: 'v0.0.0' }), {
      status: 200
    })
    const response = await fetch(url, {
      headers: { Authorization: `token ${GH_TOKEN}`, 'User-Agent': 'request' }
    }).then((res) => res.json())
    const latestJsonUrl = response?.assets?.[0]?.browser_download_url
    if (!latestJsonUrl) return errorResponse
    const jsonRes = await fetch(latestJsonUrl, {
      headers: { 'User-Agent': 'request' }
    })
    if (!jsonRes.ok) return errorResponse
    return new Response(JSON.stringify(await jsonRes.json()))
  }
}
