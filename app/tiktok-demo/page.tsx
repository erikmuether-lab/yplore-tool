export default function TikTokDemo() {
  return (
    <main style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontFamily: "Arial",
      background: "#000",
      color: "#fff",
      flexDirection: "column"
    }}>
      <h1>TikTok Login</h1>
      <p>Authorize YPLORE to access your account</p>

      <button style={{
        marginTop: "20px",
        padding: "10px 20px",
        borderRadius: "8px",
        background: "#25F4EE",
        color: "#000",
        fontWeight: 700
      }}>
        Authorize
      </button>
    </main>
  );
}