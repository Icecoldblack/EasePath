@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@echo off
@setlocal

set WRAPPER_JAR=".mvn\wrapper\maven-wrapper.jar"
set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

@REM If no wrapper jar exists, download it
if not exist %WRAPPER_JAR% (
    echo Downloading Maven Wrapper...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri %WRAPPER_URL% -OutFile %WRAPPER_JAR%}"
)

@REM Execute Maven
"%JAVA_HOME%\bin\java" %MAVEN_OPTS% -jar %WRAPPER_JAR% %*
