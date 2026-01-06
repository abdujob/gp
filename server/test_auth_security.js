const axios = require('axios');

/**
 * Comprehensive Authentication System Test Script
 * Tests all security features: registration, login, email verification,
 * password reset, refresh tokens, and account lockout
 */

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

let testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// Test user data
const testUser = {
    full_name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'SecurePass123!',
    role: 'EXPEDITEUR',
    phone: '+221771234567',
    address: 'Dakar, Sénégal'
};

let accessToken = '';
let refreshToken = '';
let userId = '';

/**
 * Helper function to log test results
 */
function logTest(name, passed, message = '') {
    const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`${status} - ${name}`);
    if (message) {
        console.log(`   ${colors.cyan}${message}${colors.reset}`);
    }

    testResults.tests.push({ name, passed, message });
    if (passed) {
        testResults.passed++;
    } else {
        testResults.failed++;
    }
}

/**
 * Test 1: User Registration
 */
async function testRegistration() {
    console.log(`\n${colors.blue}=== Test 1: User Registration ===${colors.reset}`);

    try {
        const response = await axios.post(`${API_URL}/auth/register`, testUser);

        if (response.status === 201 && response.data.accessToken) {
            accessToken = response.data.accessToken;
            refreshToken = response.data.refreshToken;
            userId = response.data.user.id;

            logTest('Registration successful', true, `User ID: ${userId}`);
            logTest('Access token received', !!accessToken);
            logTest('Refresh token received', !!refreshToken);
            logTest('Email verification required', response.data.user.is_email_verified === false);
        } else {
            logTest('Registration', false, 'Invalid response');
        }
    } catch (error) {
        logTest('Registration', false, error.response?.data?.msg || error.message);
    }
}

/**
 * Test 2: Duplicate Email Prevention
 */
async function testDuplicateEmail() {
    console.log(`\n${colors.blue}=== Test 2: Duplicate Email Prevention ===${colors.reset}`);

    try {
        await axios.post(`${API_URL}/auth/register`, testUser);
        logTest('Duplicate email prevention', false, 'Should have rejected duplicate email');
    } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.code === 'EMAIL_EXISTS') {
            logTest('Duplicate email prevention', true, 'Correctly rejected duplicate');
        } else {
            logTest('Duplicate email prevention', false, error.message);
        }
    }
}

/**
 * Test 3: Password Strength Validation
 */
async function testWeakPassword() {
    console.log(`\n${colors.blue}=== Test 3: Password Strength Validation ===${colors.reset}`);

    const weakPasswords = [
        { password: 'short', reason: 'Too short' },
        { password: 'nouppercase123!', reason: 'No uppercase' },
        { password: 'NOLOWERCASE123!', reason: 'No lowercase' },
        { password: 'NoNumbers!', reason: 'No numbers' },
        { password: 'NoSpecialChar123', reason: 'No special characters' }
    ];

    for (const test of weakPasswords) {
        try {
            await axios.post(`${API_URL}/auth/register`, {
                ...testUser,
                email: `weak${Date.now()}@example.com`,
                password: test.password
            });
            logTest(`Weak password rejected: ${test.reason}`, false, 'Should have rejected');
        } catch (error) {
            if (error.response?.status === 400) {
                logTest(`Weak password rejected: ${test.reason}`, true);
            } else {
                logTest(`Weak password rejected: ${test.reason}`, false, error.message);
            }
        }
    }
}

/**
 * Test 4: Login with Correct Credentials
 */
async function testLogin() {
    console.log(`\n${colors.blue}=== Test 4: Login with Correct Credentials ===${colors.reset}`);

    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });

        if (response.status === 200 && response.data.accessToken) {
            accessToken = response.data.accessToken;
            refreshToken = response.data.refreshToken;

            logTest('Login successful', true);
            logTest('New access token received', !!accessToken);
            logTest('New refresh token received', !!refreshToken);
        } else {
            logTest('Login', false, 'Invalid response');
        }
    } catch (error) {
        logTest('Login', false, error.response?.data?.msg || error.message);
    }
}

/**
 * Test 5: Login with Wrong Password
 */
async function testWrongPassword() {
    console.log(`\n${colors.blue}=== Test 5: Login with Wrong Password ===${colors.reset}`);

    try {
        await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: 'WrongPassword123!'
        });
        logTest('Wrong password rejected', false, 'Should have rejected');
    } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.code === 'INVALID_CREDENTIALS') {
            logTest('Wrong password rejected', true);
            logTest('Attempts remaining shown', !!error.response?.data?.attemptsRemaining);
        } else {
            logTest('Wrong password rejected', false, error.message);
        }
    }
}

/**
 * Test 6: Account Lockout After Failed Attempts
 */
async function testAccountLockout() {
    console.log(`\n${colors.blue}=== Test 6: Account Lockout After Failed Attempts ===${colors.reset}`);

    // Create a new user for this test
    const lockoutUser = {
        ...testUser,
        email: `lockout${Date.now()}@example.com`
    };

    try {
        await axios.post(`${API_URL}/auth/register`, lockoutUser);

        // Try to login with wrong password 5 times
        for (let i = 1; i <= 5; i++) {
            try {
                await axios.post(`${API_URL}/auth/login`, {
                    email: lockoutUser.email,
                    password: 'WrongPassword123!'
                });
            } catch (error) {
                if (i === 5 && error.response?.data?.code === 'ACCOUNT_LOCKED') {
                    logTest('Account locked after 5 failed attempts', true);
                    logTest('Lock duration provided', !!error.response?.data?.lockedUntil);
                    return;
                }
            }
        }

        logTest('Account lockout', false, 'Account should have been locked');
    } catch (error) {
        logTest('Account lockout test setup', false, error.message);
    }
}

/**
 * Test 7: Refresh Token
 */
async function testRefreshToken() {
    console.log(`\n${colors.blue}=== Test 7: Refresh Token ===${colors.reset}`);

    try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: refreshToken
        });

        if (response.status === 200 && response.data.accessToken) {
            const newAccessToken = response.data.accessToken;
            logTest('Refresh token works', true);
            logTest('New access token received', newAccessToken !== accessToken);
            accessToken = newAccessToken;
        } else {
            logTest('Refresh token', false, 'Invalid response');
        }
    } catch (error) {
        logTest('Refresh token', false, error.response?.data?.msg || error.message);
    }
}

/**
 * Test 8: Protected Route Access
 */
async function testProtectedRoute() {
    console.log(`\n${colors.blue}=== Test 8: Protected Route Access ===${colors.reset}`);

    try {
        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.status === 200 && response.data.id === userId) {
            logTest('Protected route access with valid token', true);
            logTest('User data retrieved correctly', response.data.email === testUser.email);
        } else {
            logTest('Protected route access', false, 'Invalid response');
        }
    } catch (error) {
        logTest('Protected route access', false, error.response?.data?.msg || error.message);
    }
}

/**
 * Test 9: Protected Route Without Token
 */
async function testProtectedRouteWithoutToken() {
    console.log(`\n${colors.blue}=== Test 9: Protected Route Without Token ===${colors.reset}`);

    try {
        await axios.get(`${API_URL}/auth/me`);
        logTest('Protected route without token', false, 'Should have rejected');
    } catch (error) {
        if (error.response?.status === 401 && error.response?.data?.code === 'NO_TOKEN') {
            logTest('Protected route without token rejected', true);
        } else {
            logTest('Protected route without token', false, error.message);
        }
    }
}

/**
 * Test 10: Rate Limiting
 */
async function testRateLimiting() {
    console.log(`\n${colors.blue}=== Test 10: Rate Limiting ===${colors.reset}`);

    const testEmail = `ratelimit${Date.now()}@example.com`;
    let rateLimitHit = false;

    // Try to login 10 times quickly
    for (let i = 0; i < 10; i++) {
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: testEmail,
                password: 'SomePassword123!'
            });
        } catch (error) {
            if (error.response?.status === 429) {
                rateLimitHit = true;
                logTest('Rate limiting works', true, 'Rate limit triggered');
                break;
            }
        }
    }

    if (!rateLimitHit) {
        logTest('Rate limiting', false, 'Rate limit should have been triggered');
    }
}

/**
 * Test 11: Password Change
 */
async function testPasswordChange() {
    console.log(`\n${colors.blue}=== Test 11: Password Change ===${colors.reset}`);

    const newPassword = 'NewSecurePass456!';

    try {
        const response = await axios.put(`${API_URL}/auth/change-password`, {
            currentPassword: testUser.password,
            newPassword: newPassword
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.status === 200) {
            logTest('Password change successful', true);

            // Try to login with new password
            try {
                const loginResponse = await axios.post(`${API_URL}/auth/login`, {
                    email: testUser.email,
                    password: newPassword
                });

                if (loginResponse.status === 200) {
                    logTest('Login with new password works', true);
                    testUser.password = newPassword; // Update for future tests
                    accessToken = loginResponse.data.accessToken;
                    refreshToken = loginResponse.data.refreshToken;
                } else {
                    logTest('Login with new password', false);
                }
            } catch (error) {
                logTest('Login with new password', false, error.message);
            }
        } else {
            logTest('Password change', false, 'Invalid response');
        }
    } catch (error) {
        logTest('Password change', false, error.response?.data?.msg || error.message);
    }
}

/**
 * Test 12: Logout
 */
async function testLogout() {
    console.log(`\n${colors.blue}=== Test 12: Logout ===${colors.reset}`);

    try {
        const response = await axios.post(`${API_URL}/auth/logout`, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.status === 200) {
            logTest('Logout successful', true);

            // Try to use old refresh token
            try {
                await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken: refreshToken
                });
                logTest('Refresh token invalidated', false, 'Old refresh token should not work');
            } catch (error) {
                if (error.response?.status === 401) {
                    logTest('Refresh token invalidated after logout', true);
                } else {
                    logTest('Refresh token invalidation', false, error.message);
                }
            }
        } else {
            logTest('Logout', false, 'Invalid response');
        }
    } catch (error) {
        logTest('Logout', false, error.response?.data?.msg || error.message);
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║   🔐 GP Authentication System - Security Test Suite 🔐   ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log(`\n${colors.yellow}Testing API at: ${API_URL}${colors.reset}\n`);

    try {
        await testRegistration();
        await testDuplicateEmail();
        await testWeakPassword();
        await testLogin();
        await testWrongPassword();
        await testAccountLockout();
        await testRefreshToken();
        await testProtectedRoute();
        await testProtectedRouteWithoutToken();
        await testRateLimiting();
        await testPasswordChange();
        await testLogout();

        // Print summary
        console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.cyan}║                      TEST SUMMARY                          ║${colors.reset}`);
        console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
        console.log(`\n${colors.green}✓ Passed: ${testResults.passed}${colors.reset}`);
        console.log(`${colors.red}✗ Failed: ${testResults.failed}${colors.reset}`);
        console.log(`${colors.blue}Total: ${testResults.passed + testResults.failed}${colors.reset}`);

        const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2);
        console.log(`\n${colors.yellow}Success Rate: ${successRate}%${colors.reset}\n`);

        if (testResults.failed === 0) {
            console.log(`${colors.green}🎉 All tests passed! Authentication system is secure. 🎉${colors.reset}\n`);
        } else {
            console.log(`${colors.red}⚠️  Some tests failed. Please review the results above. ⚠️${colors.reset}\n`);
        }

    } catch (error) {
        console.error(`\n${colors.red}Fatal error running tests:${colors.reset}`, error.message);
    }
}

// Run tests
runAllTests();
