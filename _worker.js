export default {
  async fetch(request, env) {
    const { GH_NAME, GH_REPO, GH_TOKEN } = env || {}
    const url = new URL(request.url)
    const githubName = url.searchParams.get('username') || GH_NAME
    const githubRepo = url.searchParams.get('repo') || GH_REPO
    const URL = `https://api.github.com/repos/${githubName}/${githubRepo}/releases/latest`
    const headers = new Headers()
    headers.append('Authorization', `token ${GH_TOKEN}`)
    const response = await fetch(URL, { headers }).then((res) => res.json())
    const latestJsonUrl = response?.data?.assets?.[0]?.browser_download_url
    if (!response.ok || !latestJsonUrl) {
      return new Response({ version: 'v0.0.0' }, { status: 200 })
    }
    return await fetch(latestJsonUrl, { headers }).then((res) => res.json())
  }
}
