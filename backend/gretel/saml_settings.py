"""SAML settings for testing purposes"""

from django.urls import reverse_lazy
from os.path import dirname, join
from cdh.federated_auth.saml.settings import *  # noqa: S2208 also import SAML settings

_BASE_DIR = dirname(__file__)

SAML_CONFIG = create_saml_config(
    base_url="http://localhost:8000",
    name="gretel5",
    key_file=join(_BASE_DIR, "certs", "private.key"),
    cert_file=join(_BASE_DIR, "certs", "public.cert"),
    # run https://github.com/CentreForDigitalHumanities/Development-IdP
    idp_metadata="http://localhost:7000/saml/idp/metadata/",
    contact_given_name="Research Software Lab, Utrecht University Centre for Digital Humanities",
    contact_email="digitalhumanities@uu.nl",
)

# This is needed for local development
# (unless you feel like connecting to localhost using SSL)
SAML_SESSION_COOKIE_SAMESITE = 'Lax'

AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "djangosaml2.backends.Saml2Backend",
)

LOGIN_URL = reverse_lazy("saml2_login")
