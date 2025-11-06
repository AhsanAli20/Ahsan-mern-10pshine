const nodemailer = require('nodemailer');

// Ab Transporter ko bahar define nahi karenge, taaki woh process.env 
// ke load hone ka wait kar sake.


const sendEmail = async (options) => {
    
    // 🔥 ULTIMATE CHECK: Console par print karwaen! 🔥
    console.log("SMTP User:", process.env.EMAIL_USER);
    // PASS ko poora print nahi karana chahiye security ke liye, isliye sirf length dekhen.
    console.log("SMTP Pass Length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0); 
    console.log("SMTP Host:", process.env.EMAIL_HOST);


    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT, 
        secure: false,
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, // Agar yeh undefined ya chota hai, to error aayega
        },
        logger: true,
        transaction: true
    });

    try {
        const mailOptions = {
            // APP_NAME missing tha, isliye yahan sirf EMAIL_USER use kar lete hain.
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