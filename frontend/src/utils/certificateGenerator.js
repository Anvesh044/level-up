export const generateCertificateHTML = (name, score) => {
  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head><title>Certificate</title></head>
      <body style="text-align:center;font-family:serif;">
        <h1>CERTIFICATE OF COMPLETION</h1>
        <h2>${name}</h2>
        <p>Score: ${score}</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <button onclick="window.print()">Download</button>
      </body>
    </html>
  `);
};
