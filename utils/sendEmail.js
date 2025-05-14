const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  // service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465, // SSL
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,      // masukkan di .env
    pass: process.env.EMAIL_PASSWORD   // app password untuk Gmail
  }
});

const sendPasswordResetEmail = async (toEmail, token) => {

  const resetLink = `http://localhost:5173/forgot-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Verifikasi Penggantian Password',
    html: `
      <h2>Reset Password Akun Reusemart</h2>
      <p>Klik link di bawah ini untuk mengganti password Anda:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Link hanya berlaku selama 1 jam.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendRejectionEmail = async (toEmail) => {

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Penggantian Password',
    html: `
      <h2>Penggantian Password</h2>
      <p>Mohon maaf, jenis akun anda tidak dapat mengakses fitur ini</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
  sendRejectionEmail
};
