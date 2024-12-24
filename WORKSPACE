# Load external dependencies
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Load Python build rules
http_archive(
    name = "rules_python",
    urls = ["https://github.com/bazelbuild/rules_python/releases/download/0.22.0/rules_python-0.22.0.tar.gz"],
    sha256 = "2cc5127b6b8c5d8455448fa7686a4d0b47ef49f5a43cc0ed84f587d5f896af06",
)

load("@rules_python//python:pip.bzl", "pip_install")
pip_install(
    requirements = "//:requirements.txt",
)

# Load Node.js build rules
http_archive(
    name = "rules_nodejs",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/v5.3.0/rules_nodejs-5.3.0.tar.gz"],
    sha256 = "ba66f9b2c19235f8c2207f64e071e1223b62ed8392c5e6eebf016cb8ec8b1291",
)

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains", "npm_install")
nodejs_register_toolchains()
npm_install(
    name = "npm_deps",
    package_json = "//frontend:package.json",
    lockfile = "//frontend:package-lock.json",
)

# Declare the project modules
module(
    name = "my_project",
    version = "1.0.0",
)

bazel_dep(name = "rules_python", version = "0.22.0")
bazel_dep(name = "rules_nodejs", version = "5.3.0")

# Include all modules in the project
bazel_dep(name = "frontend", version = "1.0.0")
bazel_dep(name = "mqtt", version = "1.0.0")
bazel_dep(name = "mysql_ingestor", version = "1.0.0")
bazel_dep(name = "jarvis", version = "1.0.0")
bazel_dep(name = "heimdall", version = "1.0.0")
bazel_dep(name = "influxdb_ingestor", version = "1.0.0")
