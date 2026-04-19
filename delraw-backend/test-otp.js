const email = process.argv[2] || 'sawanpuri9907@gmail.com';

async function testOtpSender() {
  console.log(`🚀 Triggering NodeMailer to send OTP to: ${email}...`);
  try {
    const res = await fetch('http://localhost:5000/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (res.ok) {
       const data = await res.json();
       console.log('✅ Success! Gateway Response:', data);
    } else {
       const errConfig = await res.text();
       console.error('❌ Failed! Status:', res.status);
       console.error('Response details:', errConfig);
    }
  } catch (err) {
    console.error('💥 Terminal Exception:', err.message);
  }
}

testOtpSender();
