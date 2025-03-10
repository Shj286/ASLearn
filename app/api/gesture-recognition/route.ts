export async function POST(req: Request) {
  try {
    const response = await fetch("http://localhost:8000/detect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`Python server returned ${response.status}`);
    }

    const data = await response.json();
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Error processing gesture recognition:", error);
    return new Response("Failed to process hand gesture", { status: 200 });
  }
}
