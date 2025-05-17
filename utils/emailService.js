const nodemailer = require("nodemailer");

// Create a transporter using SMTP
console.log('Creating SMTP transporter with settings:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    // Not logging password for security
  }
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// Function to send OTP email for signup/verification
const sendOTPEmail = async (email, otp) => {
  console.log('Attempting to send OTP email to:', email);
  console.log('OTP value:', otp);

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify Your Email - RideTogether",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Welcome to RideTogether!</h2>
        <p>Thank you for signing up. To complete your registration, please use the following OTP:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #0066cc; margin: 0; font-size: 32px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    console.log('Sending mail with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Detailed email error:', error);
    throw new Error("Failed to send verification email");
  }
};

// Function to send OTP email for password reset
const sendPasswordResetOTPEmail = async (email, otp) => {
  console.log('Attempting to send Password Reset OTP email to:', email);
  console.log('OTP value:', otp);

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset Your Password - RideTogether",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">Password Reset Request</h2>
        <p>We received a request to reset your RideTogether account password. Use the OTP below to proceed:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #dc3545; margin: 0; font-size: 32px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    console.log('Sending mail with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Detailed email error:', error);
    throw new Error("Failed to send password reset email");
  }
};

// Function to send contact form email
const sendContactFormEmail = async (formData) => {
  const { name, email, subject, phone, message } = formData;
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: "supridetogether@gmail.com",
    replyTo: email,
    subject: `Contact Form Submission: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066cc;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>NUST Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</div>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message from the RideTogether contact form.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact form email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Contact form email error:', error);
    throw new Error("Failed to send contact form email");
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
  sendContactFormEmail,
}; 