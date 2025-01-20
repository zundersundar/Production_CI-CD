load("@rules_python//python:defs.bzl", "py_test", "py_binary")

# Define lint rule
py_binary(
    name = "lint",
    srcs = glob(["run.py"]),
    args = ["--errors-only", "module1/"],
    main = "pylint",
    deps = ["@pip_deps//:pylint"],
)

# Define security check
py_binary(
    name = "bandit_check",
    srcs = [],
    args = ["-r", "module1/"],
    main = "bandit",
    deps = ["@pip_deps//:bandit"],
)

# Define pytest
#py_test(
 #   name = "unit_tests",
  #  srcs = glob(["**/test_*.py"]),
  #  main = "pytest",
  #  args = ["--cov=module1", "--cov-report=term-missing"],
  #  deps = ["@pip_deps//:pytest"],
#)
