import { app, translate } from "../app"
import { Container } from "./container"


export function Footer() {
  return <Container block={app.footer}>
    <div className="mb-16">{translate(app.footer.text)}</div>
  </Container>

}

