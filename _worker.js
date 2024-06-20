export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    let githubRawUrl = 'https://raw.githubusercontent.com'
    const {
      GH_NAME,
      GH_REPO,
      GH_BRANCH,
      GH_TOKEN,
      TOKEN,
      URL302,
      ERROR,
      URL: EnvUrl
    } = env || {}
    if (url.pathname !== '/') {
      const path = [GH_NAME, GH_REPO, GH_BRANCH].filter(Boolean).join('/')
      githubRawUrl += `/${path}${url.pathname}`

      const token = url.searchParams.get('token') || TOKEN || GH_TOKEN
      if (!token) return new Response(`TOKEN不能为空`, { status: 400 })
      // 构建请求头
      const headers = new Headers()
      headers.append('Authorization', `token ${token}`)
      // 发起请求
      const response = await fetch(githubRawUrl, { headers })
      // 检查请求是否成功 (状态码 200 到 299)
      if (response.ok) {
        // 在这里您可以处理文件内容，例如返回给客户端或进行其他操作
        return new Response(await response.text(), {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
          }
        })
      } else {
        // 如果请求不成功，返回适当的错误响应
        return new Response(
          ERROR || '无法获取文件，检查路径或TOKEN是否正确。',
          { status: response.status }
        )
      }
    } else {
      const envKey = URL302 ? 'URL302' : EnvUrl ? 'URL' : null
      if (envKey) {
        const urls = await ADD(env[envKey])
        const url = urls[Math.floor(Math.random() * urls.length)]
        return envKey === 'URL302'
          ? Response.redirect(url, 302)
          : fetch(new Request(url, request))
      }
      //首页改成一个nginx伪装页
      return new Response(await nginx(), {
        headers: {
          'Content-Type': 'text/html; charset=UTF-8'
        }
      })
    }
  }
}

async function nginx() {
  const text = `
	  <!DOCTYPE html>
	  <html>
	  <head>
	  <title>Welcome to nginx!</title>
	  <style>
		  body {
			  width: 35em;
			  margin: 0 auto;
			  font-family: Tahoma, Verdana, Arial, sans-serif;
		  }
	  </style>
	  </head>
	  <body>
	  <h1>Welcome to nginx!</h1>
	  <p>If you see this page, the nginx web server is successfully installed and
	  working. Further configuration is required.</p>
	  
	  <p>For online documentation and support please refer to
	  <a href="http://nginx.org/">nginx.org</a>.<br/>
	  Commercial support is available at
	  <a href="http://nginx.com/">nginx.com</a>.</p>
	  
	  <p><em>Thank you for using nginx.</em></p>
	  </body>
	  </html>
	  `
  return text
}

async function ADD(envadd) {
  var addtext = envadd.replace(/[	|"'\r\n]+/g, ',').replace(/,+/g, ',') // 将空格、双引号、单引号和换行符替换为逗号
  //console.log(addtext);
  if (addtext.charAt(0) == ',') addtext = addtext.slice(1)
  if (addtext.charAt(addtext.length - 1) == ',')
    addtext = addtext.slice(0, addtext.length - 1)
  const add = addtext.split(',')
  //console.log(add);
  return add
}
