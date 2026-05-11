# Install OpenSSH Server
Add-WindowsCapability -Online -Name "OpenSSH.Server~~~~0.0.1.0"

# Start and enable the service
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# Firewall rule
New-NetFirewallRule -DisplayName "OpenSSH-Server" -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow -ErrorAction SilentlyContinue

# Verify
Get-Service sshd | Select-Object Name, Status, StartType
Write-Output "=== DONE ==="
