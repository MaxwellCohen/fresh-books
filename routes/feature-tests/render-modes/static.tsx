export default function RenderModeSTATIC() {
  return (
    <>
      <h1>Render mode: static</h1>
      <p>rendered at <time id="ft-rendered-at">{new Date().toISOString()}</time> · <span id="ft-rendered-rand">{crypto.randomUUID()}</span></p>
    </>
  );
}
