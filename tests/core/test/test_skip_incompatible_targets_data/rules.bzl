# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under both the MIT license found in the
# LICENSE-MIT file in the root directory of this source tree and the Apache
# License, Version 2.0 found in the LICENSE-APACHE file in the root directory
# of this source tree.

def _impl(_ctx):
    return [DefaultInfo(), ExternalRunnerTestInfo(type = "custom", command = ["python3", "-c", "import sys; sys.exit(0)"])]

test_rule = rule(
    impl = _impl,
    attrs = {
    },
)
