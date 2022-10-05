""" Settings overrides to quickly enable production mode.

    Magic glue; this is NOT the place for customizations.
"""

import os
import os.path as op

here = op.dirname(op.abspath(__file__))

from glue import *

DEBUG = False

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '::1']

STATICFILES_DIRS = [op.join(here, 'frontend', 'dist')]

STATIC_ROOT = op.join(here, 'static')

if not op.exists(STATIC_ROOT):
    os.mkdir(STATIC_ROOT)
