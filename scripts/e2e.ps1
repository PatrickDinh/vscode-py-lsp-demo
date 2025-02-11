$env:CODE_TESTS_PATH = "$($pwd.Path)\client\out\test"
$env:CODE_TESTS_WORKSPACE = "$($pwd.Path)\client\testFixture"

node "$($pwd.Path)\client\out\test\runTest"
