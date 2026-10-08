@echo off
REM ============================================================================
REM DeepSeek Desktop - Test Runner (Windows)
REM Runs all tests across the monorepo
REM ============================================================================

echo.
echo ============================================================
echo   DeepSeek Desktop - Test Runner
echo ============================================================
echo.

setlocal enabledelayedexpansion

set TOTAL_PACKAGES=0
set PASSED_PACKAGES=0
set FAILED_PACKAGES=0

REM Function to run tests for a package
call :run_package_tests "packages\shared" "@deepseek/shared"
call :run_package_tests "packages\secrets" "@deepseek/secrets"
call :run_package_tests "packages\auth" "@deepseek/auth"
call :run_package_tests "packages\harness" "@deepseek/harness"
call :run_package_tests "packages\browser" "@deepseek/browser"
call :run_package_tests "packages\mcp" "@deepseek/mcp"
call :run_package_tests "packages\github" "@deepseek/github"
call :run_package_tests "packages\git" "@deepseek/git"
call :run_package_tests "packages\sync" "@deepseek\sync"
call :run_package_tests "packages\tools" "@deepseek\tools"
call :run_package_tests "packages\skills" "@deepseek\skills"
call :run_package_tests "apps\desktop" "@deepseek/desktop"

echo.
echo ============================================================
echo   Test Summary
echo ============================================================
echo.
echo Total Packages:  %TOTAL_PACKAGES%
echo Passed:          %PASSED_PACKAGES%
echo Failed:          %FAILED_PACKAGES%
echo.

if %FAILED_PACKAGES% EQU 0 (
    echo [OK] All tests passed!
    exit /b 0
) else (
    echo [ERROR] Some tests failed
    exit /b 1
)

goto :eof

:run_package_tests
set package_path=%~1
set package_name=%~2

echo Testing %package_name%...

if exist "%package_path%\package.json" (
    pushd "%package_path%"
    
    REM Check if test script exists
    findstr /C:"\"test\"" package.json >nul
    if !errorlevel! EQU 0 (
        set /a TOTAL_PACKAGES+=1
        
        npm test >nul 2>&1
        if !errorlevel! EQU 0 (
            echo [OK] %package_name% tests passed
            set /a PASSED_PACKAGES+=1
        ) else (
            echo [ERROR] %package_name% tests failed
            set /a FAILED_PACKAGES+=1
        )
    ) else (
        echo [WARN] %package_name% has no test script
    )
    
    popd
)

goto :eof
