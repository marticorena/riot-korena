Write-Host "Checking code complexity and maintainability using Radon..."
radon cc app -a -nc
radon mi app -s
Write-Host "Running strict Pre-commit hooks via Ruff & Black..."
pre-commit run --all-files
Write-Host "All Quality Control modules successfully checked."
