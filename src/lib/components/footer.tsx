import { app, translate } from "../app"
import { Container } from "./container"


export function Footer() {
  return <Container block={app.page.footer}>
    <div className="mb-16">{translate(app.page.footer.text)}</div>
  </Container>

}

