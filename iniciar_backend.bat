@echo off
chcp 65001 > nul
title BiblioTech - Servidor Spring Boot

echo ==============================================================================
echo                 BIBLIOTECH - INICIALIZADOR DO BACK-END
echo ==============================================================================
echo.

:: Detectar JAVA_HOME se não estiver configurado
if "%JAVA_HOME%"=="" (
    if exist "%LOCALAPPDATA%\Programs\IntelliJ IDEA 2026.3\jbr" (
        set "JAVA_HOME=%LOCALAPPDATA%\Programs\IntelliJ IDEA 2026.3\jbr"
        set "PATH=%LOCALAPPDATA%\Programs\IntelliJ IDEA 2026.3\jbr\bin;%PATH%"
        echo [INFO] Java 25 detectado pelo IntelliJ IDEA.
    )
)

:: Detectar Maven
set "MVN_CMD=mvn"
if exist "%LOCALAPPDATA%\Programs\IntelliJ IDEA 2026.3\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" (
    set "MVN_CMD=%LOCALAPPDATA%\Programs\IntelliJ IDEA 2026.3\plugins\maven-plugin\lib\maven3\bin\mvn.cmd"
    echo [INFO] Maven detectado pelo IntelliJ IDEA.
)

echo [INFO] Verificando servico MySQL...
net start | findstr /i "mysql" > nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Servico MySQL esta em execucao na porta 3306.
) else (
    echo [AVISO] O servico MySQL nao parece estar rodando no Windows.
    echo         Inicie o MySQL pelo MySQL Workbench, XAMPP ou Services antes de prosseguir.
)

echo.
echo [INFO] Iniciando aplicacao Spring Boot na porta 8080...
echo        Pressione Ctrl + C para encerrar o servidor.
echo.

cd /d "%~dp0backend"
call "%MVN_CMD%" spring-boot:run

if %ERRORLEVEL% neq 0 (
    echo.
    echo ==============================================================================
    echo [DICA] Caso o comando acima falhe, voce pode rodar o backend facilmente:
    echo        1. Abra o IntelliJ IDEA.
    echo        2. Abra a pasta: %~dp0backend
    echo        3. Abra a classe: BibliotechApplication.java e clique em Run ▶️.
    echo ==============================================================================
    pause
)
