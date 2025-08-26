export async function GET() {
  const res = await fetch("http://localhost:8000/predict");

  if (!res.ok) {
    const errorText = await res.text();
    return new Response(errorText, { status: res.status });
  }

  const data = await res.json(); // data doit avoir { enterprises, stats }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
