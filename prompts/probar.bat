@echo off
cd /d "%~dp0"
where node >nul 2>nul || (
  echo Falta Node.js. Se abre la pagina para instalarlo: descarga la version LTS, instalala y vuelve a abrir este archivo.
  start https://nodejs.org
  pause
  exit /b
)
for /f "tokens=1 delims=v." %%a in ('node -v') do set NODEMAJOR=%%a
if %NODEMAJOR% LSS 22 (
  echo Tu Node es la version %NODEMAJOR% y hace falta la 22 o mas nueva.
  echo Se abre la pagina: descarga la version LTS, instalala y vuelve a abrir este archivo.
  start https://nodejs.org
  pause
  exit /b
)
if not exist ".env" (
  echo No encuentro el archivo .env con la clave en esta carpeta.
  pause
  exit /b
)
echo.
echo Lanzando la prueba. Tarda unos minutos; la primera vez descarga promptfoo.
echo Los avisos que empiezan por "npm warn" se pueden ignorar.
echo.
call npx.cmd -y promptfoo@latest eval --env-file .env --no-cache -o resultados.html resultados.json
echo.
if exist "resultados.html" (
  echo Listo. Se abre la tabla en el navegador.
  start "" "resultados.html"
) else (
  echo No se han generado resultados. Copia el texto de arriba y pasaselo a Claude.
)
pause
