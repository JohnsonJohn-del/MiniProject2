@echo off
powershell -NoProfile -Command "Add-WindowsCapability -Online -Name 'OpenSSH.Server~~~~0.0.1.0'" > %TEMP%\ssh_install.log 2>&1
powershell -NoProfile -Command "Start-Service sshd; Set-Service -Name sshd -StartupType 'Automatic'" >> %TEMP%\ssh_install.log 2>&1
powershell -NoProfile -Command "New-NetFirewallRule -DisplayName 'OpenSSH-Server' -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow -ErrorAction SilentlyContinue" >> %TEMP%\ssh_install.log 2>&1
echo DONE > D:\MiniProject\ssh-installed.txt
