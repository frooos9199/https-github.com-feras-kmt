async function testAPI() {
  try {
    const response = await fetch('http://localhost:3008/api/admin/events/cmji6bcal0004jo04gw1upv47/invitations', {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('Response status:', response.status);
      const text = await response.text();
      console.log('Response text:', text);
      return;
    }

    const data = await response.json();
    console.log('Available marshals count:', data.availableMarshals?.length || 0);
    console.log('First few marshals:');
    (data.availableMarshals || []).slice(0, 3).forEach(m => {
      console.log(`- ${m.name}: ${m.marshalTypes}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();