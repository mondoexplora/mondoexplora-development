@echo off
cd /d "C:\Users\fran\Desktop\mondoexplora-nextjs"
echo Starting data update at %date% %time%
npm run process-data
echo Data update completed at %date% %time%
pause 