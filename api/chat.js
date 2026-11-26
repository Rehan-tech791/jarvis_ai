
module.exports = (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed"
    });
  }

  return res.status(200).json({
    reply: "ULTRON backend connection successful. Awaiting AI integration, Creator."
  });
};
