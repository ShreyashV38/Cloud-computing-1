# Start all microservices and gateway

Write-Host "Starting API Gateway on port 4000..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd gateway; npm run dev`""

Write-Host "Starting Product Service on port 4001..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd services/product-service; npm run dev`""

Write-Host "Starting Order Service on port 4002..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd services/order-service; npm run dev`""

Write-Host "Starting User Service on port 4003..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd services/user-service; npm run dev`""

Write-Host "All backend services started! Don't forget to run 'npm run dev' in your client folder."
