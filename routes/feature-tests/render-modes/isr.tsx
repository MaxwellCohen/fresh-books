export default function RenderModeISR() {
  return (
    <>
      <h1>Render mode: isr</h1>
      <p>rendered at <time id="ft-rendered-at">{new Date().toISOString()}</time> · <span id="ft-rendered-rand">{crypto.randomUUID()}</span></p>
    </>
  );
}
