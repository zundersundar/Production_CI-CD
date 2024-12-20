http_archive(
    name = "build_bazel_rules_nodejs",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.0.0/rules_nodejs-5.0.0.tar.gz"],
    strip_prefix = "rules_nodejs-5.0.0",
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "nodejs_register_toolchains", "npm_install")
nodejs_register_toolchains()
npm_install(
    name = "npm",
    package_json = "//:./forntend/package.json",
    lock_file = "//:./frontend/package-lock.json",
)
