const nodemailer = require('nodemailer');

// SMTP Configuration
const smtpConfig = {
  service: 'gmail', // Using Gmail service
  auth: {
    user: 'wanttarstore@gmail.com',
    pass: 'yzblwntpbiwaqxwu' // App password
  },
  secure: true, // Use SSL
  port: 465
};

// Alternative configuration if service doesn't work
const alternativeConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: 'wanttarstore@gmail.com',
    pass: 'yzblwntpbiwaqxwu'
  }
};

// Test function
async function testSMTP() {
  console.log('🧪 Testing SMTP credentials...\n');
  
  try {
    // Test with Gmail service first
    console.log('📧 Testing with Gmail service configuration...');
    const transporter1 = nodemailer.createTransporter(smtpConfig);
    
    // Verify connection
    await transporter1.verify();
    console.log('✅ Gmail service connection verified successfully!');
    
    // Send test email
    const testEmail = {
      from: '"Wanttar Store" <wanttarstore@gmail.com>',
      to: 'wanttarstore@gmail.com', // Send to self for testing
      subject: '✅ SMTP Test - Gmail Service Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #28a745; margin-top: 0;">🎉 SMTP Test Successful!</h2>
            <p>Your SMTP credentials are working correctly with <strong>Gmail service</strong> configuration.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <h3>Configuration Used:</h3>
            <ul>
              <li><strong>Service:</strong> Gmail</li>
              <li><strong>Email:</strong> wanttarstore@gmail.com</li>
              <li><strong>Port:</strong> 465 (SSL)</li>
              <li><strong>Secure:</strong> true</li>
            </ul>
            <p><em>Test performed on: ${new Date().toLocaleString()}</em></p>
          </div>
        </div>
      `
    };
    
    const info1 = await transporter1.sendMail(testEmail);
    console.log('📮 Test email sent successfully!');
    console.log('📍 Message ID:', info1.messageId);
    console.log('📍 Response:', info1.response);
    
    return true;
    
  } catch (error1) {
    console.log('❌ Gmail service failed:', error1.message);
    console.log('\n🔄 Trying alternative SMTP configuration...\n');
    
    try {
      // Test with alternative configuration
      console.log('📧 Testing with alternative SMTP configuration...');
      const transporter2 = nodemailer.createTransporter(alternativeConfig);
      
      // Verify connection
      await transporter2.verify();
      console.log('✅ Alternative SMTP connection verified successfully!');
      
      // Send test email
      const testEmail2 = {
        from: '"Wanttar Store" <wanttarstore@gmail.com>',
        to: 'wanttarstore@gmail.com',
        subject: '✅ SMTP Test - Alternative Configuration',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #28a745; margin-top: 0;">🎉 SMTP Test Successful!</h2>
              <p>Your SMTP credentials are working correctly with <strong>alternative</strong> configuration.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <h3>Configuration Used:</h3>
              <ul>
                <li><strong>Host:</strong> smtp.gmail.com</li>
                <li><strong>Email:</strong> wanttarstore@gmail.com</li>
                <li><strong>Port:</strong> 587 (STARTTLS)</li>
                <li><strong>Secure:</strong> false</li>
              </ul>
              <p><em>Test performed on: ${new Date().toLocaleString()}</em></p>
            </div>
          </div>
        `
      };
      
      const info2 = await transporter2.sendMail(testEmail2);
      console.log('📮 Test email sent successfully with alternative config!');
      console.log('📍 Message ID:', info2.messageId);
      console.log('📍 Response:', info2.response);
      
      return true;
      
    } catch (error2) {
      console.log('❌ Alternative configuration also failed:', error2.message);
      return false;
    }
  }
}

// Enhanced debugging function
async function debugSMTPConnection() {
  console.log('\n🔍 Running detailed SMTP diagnostics...\n');
  
  const configs = [
    {
      name: 'Gmail Service (SSL)',
      config: smtpConfig
    },
    {
      name: 'Gmail SMTP (STARTTLS)',
      config: alternativeConfig
    },
    {
      name: 'Gmail SMTP (SSL)',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'wanttarstore@gmail.com',
          pass: 'yzblwntpbiwaqxwu'
        }
      }
    }
  ];
  
  for (const { name, config } of configs) {
    try {
      console.log(`🧪 Testing: ${name}`);
      const transporter = nodemailer.createTransporter(config);
      
      // Test connection
      await transporter.verify();
      console.log(`✅ ${name}: Connection successful`);
      
      // Test email sending (only for the first successful one)
      const testResult = await transporter.sendMail({
        from: '"Wanttar Store Test" <wanttarstore@gmail.com>',
        to: 'wanttarstore@gmail.com',
        subject: `SMTP Test - ${name}`,
        text: `This is a test email sent using ${name} configuration at ${new Date().toLocaleString()}`
      });
      
      console.log(`📧 ${name}: Email sent successfully`);
      console.log(`📍 Message ID: ${testResult.messageId}\n`);
      return { success: true, config: name };
      
    } catch (error) {
      console.log(`❌ ${name}: Failed - ${error.message}\n`);
    }
  }
  
  return { success: false };
}

// Main execution
async function main() {
  console.log('🚀 SMTP Credentials Test Script');
  console.log('================================\n');
  console.log('📧 Email: wanttarstore@gmail.com');
  console.log('🔐 App Password: yzblwntpbiwaqxwu');
  console.log('⚠️  Note: Make sure 2FA is enabled and this is an App Password\n');
  
  // First try the simple test
  const simpleTestResult = await testSMTP();
  
  if (!simpleTestResult) {
    console.log('\n🔍 Simple test failed. Running detailed diagnostics...');
    const diagnosticsResult = await debugSMTPConnection();
    
    if (!diagnosticsResult.success) {
      console.log('\n❌ All SMTP configurations failed!');
      console.log('\n💡 Troubleshooting Tips:');
      console.log('1. Make sure 2-Factor Authentication is enabled on the Gmail account');
      console.log('2. Verify this is an App Password, not the regular account password');
      console.log('3. Check if "Less secure app access" is enabled (if not using App Password)');
      console.log('4. Ensure the Gmail account is not locked or suspended');
      console.log('5. Try generating a new App Password');
    } else {
      console.log(`\n✅ Success with: ${diagnosticsResult.config}`);
    }
  }
  
  console.log('\n🏁 Test completed!');
}

// Handle unhandled promises
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the test
main().catch(console.error);