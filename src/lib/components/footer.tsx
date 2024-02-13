import { app, translate } from "../app"


export function Footer() {
  return <div>Footer: {translate(app.footer.text)}</div>
}

