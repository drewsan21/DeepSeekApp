#!/usr/bin/env bash
# ============================================================================
# DeepSeek Desktop - Test Runner
# Runs all tests across the monorepo
# ============================================================================

set -e

echo ""
echo "============================================================"
echo "  DeepSeek Desktop - Test Runner"
echo "============================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
TOTAL_PACKAGES=0
PASSED_PACKAGES=0
FAILED_PACKAGES=0

# Function to run tests for a package
run_package_tests() {
    local package_path=$1
    local package_name=$2
    
    echo -e "${BLUE}Testing ${package_name}...${NC}"
    
    if [ -d "$package_path" ] && [ -f "$package_path/package.json" ]; then
        cd "$package_path"
        
        # Check if test script exists
        if grep -q '"test"' package.json; then
            TOTAL_PACKAGES=$((TOTAL_PACKAGES + 1))
            
            if npm test 2>&1; then
                echo -e "${GREEN}✓ ${package_name} tests passed${NC}"
                PASSED_PACKAGES=$((PASSED_PACKAGES + 1))
            else
                echo -e "${RED}✗ ${package_name} tests failed${NC}"
                FAILED_PACKAGES=$((FAILED_PACKAGES + 1))
            fi
        else
            echo -e "${YELLOW}⚠ ${package_name} has no test script${NC}"
        fi
        
        cd - > /dev/null
    fi
}

echo "Running tests for all packages..."
echo ""

# Test shared packages
run_package_tests "packages/shared" "@deepseek/shared"
run_package_tests "packages/secrets" "@deepseek/secrets"
run_package_tests "packages/auth" "@deepseek/auth"
run_package_tests "packages/harness" "@deepseek/harness"
run_package_tests "packages/browser" "@deepseek/browser"
run_package_tests "packages/mcp" "@deepseek/mcp"
run_package_tests "packages/github" "@deepseek/github"
run_package_tests "packages/git" "@deepseek/git"
run_package_tests "packages/sync" "@deepseek/sync"
run_package_tests "packages/tools" "@deepseek/tools"
run_package_tests "packages/skills" "@deepseek/skills"

# Test desktop app
run_package_tests "apps/desktop" "@deepseek/desktop"

echo ""
echo "============================================================"
echo "  Test Summary"
echo "============================================================"
echo ""
echo -e "Total Packages:  ${TOTAL_PACKAGES}"
echo -e "${GREEN}Passed:          ${PASSED_PACKAGES}${NC}"
echo -e "${RED}Failed:          ${FAILED_PACKAGES}${NC}"
echo ""

if [ $FAILED_PACKAGES -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
