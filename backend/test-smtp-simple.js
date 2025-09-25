const nodemailer = require('nodemailer');

// Simple SMTP Test
async function quickSMTPTest() {
  console.log('🧪 Quick SMTP Test for Gmail\n');
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'wanttarstore@gmail.com',
      pass: 'yzblwntpbiwaqxwu'
    }
  });
  
  try {
    // Test connection
    console.log('🔌 Testing connection...');
    await transporter.verify();
    console.log('✅ Connection successful!');
    
    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: 'wanttarstore@gmail.com',
      to: 'wanttarstore@gmail.com',
      subject: 'SMTP Test - Quick Test',
      text: 'This is a quick SMTP test. If you receive this, your SMTP is working!',
      html: `
        <h2>🎉 SMTP Test Successful!</h2>
        <p>Your Gmail SMTP configuration is working correctly.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Email:</strong> wanttarstore@gmail.com</p>
        <p><strong>Status:</strong> ✅ Working</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📧 Check your inbox at wanttarstore@gmail.com');
    console.log('\n🎉 SMTP is working correctly!');
    
  } catch (error) {
    console.log('❌ SMTP test failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure 2FA is enabled on your Gmail account');
    console.log('2. Verify the App Password is correct: yzblwntpbiwaqxwu');
    console.log('3. Check if the Gmail account is accessible');
    console.log('4. Ensure your network allows SMTP connections');
  }
}

quickSMTPTest();