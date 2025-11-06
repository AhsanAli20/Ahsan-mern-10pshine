const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
    
    console.log("SMTP User:", process.env.EMAIL_USER);
  
    console.log("SMTP Pass Length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0); 
    console.log("SMTP Host:", process.env.EMAIL_HOST);


    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT, 
        secure: false,
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
        logger: true,
        transaction: true
    });

    try {
        const mailOptions = {
            
            from: `Note App <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html || options.text.replace(/\n/g, '<br>'),
            text: options.text,
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('Message sent: %s', info.messageId);

    } catch (error) {
        console.error("Error sending email:", error);
        // Yeh error catch block controller mein jayega
        throw new Error('Email sending failed.');
    }
};

module.exports = sendEmail;