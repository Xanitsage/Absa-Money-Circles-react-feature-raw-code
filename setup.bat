
@echo off
REM Windows setup script

REM Install npm dependencies
echo Installing npm dependencies...
call npm install

REM Build the project
echo Building the project...
call npm run build

REM Create directories
echo Creating directories...
mkdir components hooks lib pages 2>nul

REM Copy configuration files
echo Copying configuration files...
xcopy /E /I client\src\components\* components\
xcopy /E /I client\src\hooks\* hooks\
xcopy /E /I client\src\lib\* lib\
xcopy /E /I client\src\pages\* pages\

REM Set up environment variables
echo Setting up environment variables...
echo NODE_ENV=development> .env
echo PORT=5000>> .env

echo Setup complete! You can now run the development server with 'npm run dev'
