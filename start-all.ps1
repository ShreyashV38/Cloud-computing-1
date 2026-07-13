# Start all microservices and gateway

Write-Host "Starting DB Service on port 4010..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd db; npm run dev`""

Write-Host "Starting API Gateway on port 4000..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd gateway; npm run dev`""

Write-Host "Starting Product Service on port 4001..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd services/product-service; npm run dev`""

Write-Host "Starting Search Service on port 4002..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd services/search-service; npm run dev`""

Write-Host "Starting Cart Service on port 4003..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd services/cart-service; npm run dev`""

Write-Host "Starting Order Service on port 4004..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd services/order-service; npm run dev`""

Write-Host "Starting Payment Service on port 4005..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd services/payment-service; npm run dev`""

Write-Host "Starting Review Service on port 4006..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd services/review-service; npm run dev`""

Write-Host "Starting User Service on port 4008..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd services/user-service; npm run dev`""

Write-Host ""
Write-Host "All services started!"
Write-Host ""
Write-Host "  DB Service:       http://localhost:4010"
Write-Host "  Gateway:          http://localhost:4000"
Write-Host "  Product Service:  http://localhost:4001"
Write-Host "  Search Service:   http://localhost:4002"
Write-Host "  Cart Service:     http://localhost:4003"
Write-Host "  Order Service:    http://localhost:4004"
Write-Host "  Payment Service:  http://localhost:4005"
Write-Host "  Review Service:   http://localhost:4006"
Write-Host "  User Service:     http://localhost:4008"
Write-Host ""
Write-Host "Now run 'cd client; npm run dev' to start the frontend on http://localhost:3000"
