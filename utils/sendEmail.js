const transporter = require('./transporter');


const sendEmail = async (toEmail, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: '"E-Learning Platform" <chiemenagodson532@gmail.com>',
            to: toEmail,
            subject: subject,
            text: text,
        });
    } catch (error) {
        console.log(error);
    }
}



module.exports = sendEmail;