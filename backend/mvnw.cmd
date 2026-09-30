@REM ----------------------------------------------------------------------------
@REM BuildAsset Logistics Maven Launcher Wrapper
@REM ----------------------------------------------------------------------------
@echo off
setlocal
if exist "C:\Users\nalin\.maven\maven-3.9.12\bin\mvn.cmd" (
    call "C:\Users\nalin\.maven\maven-3.9.12\bin\mvn.cmd" %*
) else (
    call mvn %*
)
endlocal
