// Add this to your main component to see what API URL is being used
// You can add this to App.tsx temporarily

useEffect(() => {
  console.log('=== FRONTEND DEBUG INFO ===');
  console.log('Current API URL:', import.meta.env.VITE_API_URL);
  console.log('Environment Mode:', import.meta.env.MODE);
  console.log('All VITE vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
  
  // Test direct fetch to backend
  console.log('Testing direct connection to backend...');
  fetch('https://taskmanager-production-4880.up.railway.app/health')
    .then(res => {
      console.log('✅ Direct backend connection successful:', res.status);
      return res.json();
    })
    .then(data => console.log('Backend response:', data))
    .catch(err => console.error('❌ Direct backend connection failed:', err));
}, []);