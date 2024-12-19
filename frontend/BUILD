load("//tools:nodejs.bzl", "nodejs_test")

nodejs_test(
    name = "lint",
    srcs = glob(["src/**/*.js", "src/**/*.jsx"]),
    tools = ["eslint"],
    args = ["--fix", "--ext", ".js,.jsx", "src/"],
)

nodejs_test(
    name = "format",
    srcs = glob(["src/**/*.js", "src/**/*.jsx"]),
    tools = ["prettier"],
    args = ["--write", "src/"],
)
