import { preview } from 'vite'
import puppeteer from 'puppeteer'
import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROUTES = ['/']
const PORT = 4173

async function run() {
  const server = await preview({
    preview: { port: PORT, strictPort: true },
  })

  const browser = await puppeteer.launch({ headless: true })

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage()
      const url = `http://localhost:${PORT}${route}`
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
      // small extra wait for any deferred mounts
      await new Promise((r) => setTimeout(r, 500))
      let html = await page.content()

      // Strip dev-only attrs that hydration doesn't need
      html = html.replace(/<!--[\s\S]*?-->/g, (m) =>
        m.includes('vite') ? '' : m,
      )

      const outPath =
        route === '/'
          ? resolve('dist/index.html')
          : resolve('dist', route.replace(/^\//, ''), 'index.html')

      writeFileSync(outPath, html)
      console.log(`prerendered ${route} -> ${outPath} (${html.length} bytes)`)
      await page.close()
    }
  } finally {
    await browser.close()
    await new Promise((resolve) => server.httpServer.close(resolve))
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
