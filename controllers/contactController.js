const { sendContactFormEmail } = require('../utils/emailService');

// POST /api/contact
const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, phone, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }
    await sendContactFormEmail({ name, email, subject, phone, message });
    res.status(200).json({ message: 'Your message has been sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send your message. Please try again later.' });
  }
};

module.exports = { submitContactForm }; 